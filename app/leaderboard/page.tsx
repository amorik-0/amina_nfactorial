import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface LeaderboardRow {
  id: string
  username: string
  wins: number
  losses: number
  draws: number
  total_games: number
  win_rate: number
}

export const revalidate = 60

const MEDALS = ['🥇', '🥈', '🥉']

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(50)

  const leaderboard: LeaderboardRow[] = rows ?? []

  return (
    <main className="min-h-screen py-12 px-6 max-w-2xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <span className="text-5xl block mb-3" role="img" aria-label="trophy">🏆</span>
        <h1 className="text-4xl font-extrabold text-brown-900 mb-2">Leaderboard</h1>
        <p className="text-brown-500 font-medium">Top checkers players ranked by wins</p>
      </div>

      {/* ── Not connected ───────────────────────────────────────────────── */}
      {error && (
        <div className="bg-sage-200 rounded-card p-6 text-center text-brown-500 mb-6 shadow-card">
          Connect Supabase to see player rankings.
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {leaderboard.length === 0 && !error && (
        <div className="bg-sage-200 rounded-card p-10 text-center shadow-card">
          <p className="text-brown-500 font-medium">No games played yet — be the first!</p>
          <Link
            href="/game"
            className="inline-block mt-4 px-6 py-2 bg-sage-400 rounded-pill text-brown-900 font-bold text-sm shadow-button hover:bg-sage-500 transition-colors"
          >
            Play now
          </Link>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────── */}
      {leaderboard.length > 0 && (
        <div className="bg-sage-200 rounded-card overflow-hidden shadow-card">
          <table className="w-full">
            <thead>
              <tr className="bg-sage-300">
                <th className="text-left py-3 px-4 text-xs font-extrabold text-brown-900 uppercase tracking-wider w-10">
                  #
                </th>
                <th className="text-left py-3 px-4 text-xs font-extrabold text-brown-900 uppercase tracking-wider">
                  Player
                </th>
                <th className="text-right py-3 px-4 text-xs font-extrabold text-brown-900 uppercase tracking-wider">
                  W
                </th>
                <th className="text-right py-3 px-4 text-xs font-extrabold text-brown-900 uppercase tracking-wider">
                  L
                </th>
                <th className="text-right py-3 px-4 text-xs font-extrabold text-brown-900 uppercase tracking-wider">
                  Win%
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, index) => (
                <tr
                  key={row.id}
                  className="border-t border-sage-300/60 hover:bg-sage-300/40 transition-colors"
                >
                  {/* Rank */}
                  <td className="py-3 px-4">
                    {index < 3 ? (
                      <span className="text-base">{MEDALS[index]}</span>
                    ) : (
                      <span className="text-sm font-bold text-brown-500 tabular-nums">
                        {index + 1}
                      </span>
                    )}
                  </td>

                  {/* Username */}
                  <td className="py-3 px-4 font-bold text-sm text-brown-900">
                    {row.username}
                  </td>

                  {/* Wins */}
                  <td className="py-3 px-4 text-right font-mono text-sm font-semibold text-piece-green-dark">
                    {row.wins}
                  </td>

                  {/* Losses */}
                  <td className="py-3 px-4 text-right font-mono text-sm font-semibold text-red-500">
                    {row.losses}
                  </td>

                  {/* Win rate */}
                  <td className="py-3 px-4 text-right font-mono text-sm font-bold text-brown-900">
                    {row.win_rate}
                    <span className="text-brown-500 font-medium">%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Back link ───────────────────────────────────────────────────── */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-brown-500 hover:text-brown-900 transition-colors"
        >
          ← Back to home
        </Link>
      </div>

    </main>
  )
}
