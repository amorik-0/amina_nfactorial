# Checkers Duel ♟

A production-ready, fully-featured Checkers game built with Next.js 15, Supabase, Zustand, and Framer Motion.

---

## Features

- **Pass & Play** — two players, one device
- **vs AI** — minimax with alpha-beta pruning (depth 4)
- **Multiplayer** — real-time via Supabase Realtime channels
- **Full checkers rules** — mandatory captures, chain jumps, king promotion
- **Emoji reactions** — react during the game
- **Post-match review** — contextual tips based on your play
- **Leaderboard** — ranked by wins (requires Supabase)
- **Auth** — sign up / sign in via Supabase Auth

---

## Tech Stack

| Layer       | Tech                          |
|-------------|-------------------------------|
| Framework   | Next.js 15 App Router         |
| Language    | TypeScript                    |
| Styling     | Tailwind CSS + custom design  |
| Components  | Radix UI primitives           |
| Animations  | Framer Motion                 |
| State       | Zustand                       |
| Backend     | Supabase (Auth + Realtime + DB) |
| Deployment  | Vercel                        |

---

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd checkers-duel
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL editor, run the contents of `supabase/schema.sql`
3. Enable Realtime for the `games` table in the Supabase dashboard
4. Copy your project URL and anon key into `.env.local`

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable                        | Description                        | Required |
|---------------------------------|------------------------------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL          | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon (public) key    | Yes      |

> **Note:** The game modes (Pass & Play and vs AI) work fully without Supabase. Only Multiplayer and Leaderboard require a Supabase connection.

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

---

## Game Rules

- **Mandatory captures**: if you can capture, you must
- **Chain captures**: after capturing, if you can capture again, you must continue
- **King promotion**: reach the opponent's last rank to become a King (moves in all 4 diagonal directions)
- **Win condition**: opponent has no pieces left OR no valid moves

---

## Project Structure

```
app/                    Next.js App Router pages
  (auth)/               Login & register
  play/
    local/              Pass & Play mode
    ai/                 vs AI mode
    [roomId]/           Multiplayer room
  leaderboard/          Rankings page
components/
  game/                 Board, Cell, Piece, GameStatus, etc.
  ui/                   Shadcn-compatible UI primitives
  layout/               Header
  providers/            App providers (Toaster)
lib/
  game/
    types.ts            All game types
    engine.ts           Full checkers rules engine
    ai.ts               Minimax AI with alpha-beta pruning
  supabase/             Client & server Supabase instances
  utils.ts              cn(), generateRoomId(), etc.
store/
  gameStore.ts          Zustand global game state
supabase/
  schema.sql            Full DB schema with RLS
```
