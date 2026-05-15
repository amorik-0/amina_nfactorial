-- Checkers Duel Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  wins integer default 0,
  losses integer default 0,
  draws integer default 0,
  created_at timestamptz default now()
);

-- Games table
create table games (
  id uuid primary key default gen_random_uuid(),
  room_id text unique not null,
  player_red uuid references profiles(id),
  player_black uuid references profiles(id),
  status text default 'waiting', -- waiting | active | finished
  winner uuid references profiles(id),
  board_state jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table games enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Games policies
create policy "Games are viewable by everyone"
  on games for select
  using (true);

create policy "Authenticated users can create games"
  on games for insert
  with check (auth.uid() is not null);

create policy "Players can update their games"
  on games for update
  using (auth.uid() = player_red or auth.uid() = player_black);

-- Updated_at trigger
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger games_updated_at
  before update on games
  for each row execute procedure handle_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Leaderboard view
create or replace view leaderboard as
  select
    id,
    username,
    avatar_url,
    wins,
    losses,
    draws,
    wins + losses + draws as total_games,
    case
      when wins + losses + draws = 0 then 0
      else round(wins::numeric / (wins + losses + draws) * 100, 1)
    end as win_rate
  from profiles
  order by wins desc, win_rate desc;
