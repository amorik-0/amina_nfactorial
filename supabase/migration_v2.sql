-- Migration v2: Stripe monetization + skins
-- Run this in Supabase SQL Editor after schema.sql

-- 1. Add monetization columns to profiles
alter table profiles
  add column if not exists is_pro boolean default false,
  add column if not exists unlocked_skins text[] default '{}',
  add column if not exists active_skin text default 'default';

-- 2. Purchases table — audit trail of every Stripe payment
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  stripe_session_id text unique not null,
  stripe_payment_intent text,
  product_type text not null,       -- 'pro' | 'skin'
  product_id text not null,         -- 'pro' | 'wood' | 'midnight' | 'neon'
  amount_cents integer not null,
  currency text default 'usd',
  status text default 'pending',    -- 'pending' | 'completed' | 'refunded'
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- 3. RLS for purchases
alter table purchases enable row level security;

create policy "Users can read own purchases"
  on purchases for select
  using (auth.uid() = user_id);

-- Service role can insert/update purchases (used by webhook)
create policy "Service role manages purchases"
  on purchases for all
  using (true)
  with check (true);

-- 4. Function called by webhook to unlock a skin or grant pro
create or replace function grant_purchase(
  p_session_id text,
  p_product_type text,
  p_product_id text
) returns void as $$
declare
  v_user_id uuid;
begin
  -- Get user from purchase record
  select user_id into v_user_id
  from purchases
  where stripe_session_id = p_session_id;

  if v_user_id is null then
    raise exception 'Purchase not found for session %', p_session_id;
  end if;

  -- Mark purchase completed
  update purchases
  set status = 'completed', completed_at = now()
  where stripe_session_id = p_session_id;

  -- Grant the product
  if p_product_type = 'pro' then
    update profiles set is_pro = true where id = v_user_id;
  elsif p_product_type = 'skin' then
    update profiles
    set unlocked_skins = array_append(
      unlocked_skins,
      p_product_id
    )
    where id = v_user_id
      and not (p_product_id = any(unlocked_skins)); -- idempotent
  end if;
end;
$$ language plpgsql security definer;
