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

export const revalidate = 60 // revalidate every 60 seconds

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(50)

  const leaderboard: LeaderboardRow[] = rows ?? []

  return (
    <div className="min-h-screen px-4 py-24 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-4xl font-black gradient-text mb-2">Leaderboard</h1>
        <p className="text-cream/50">Top checkers players ranked by wins</p>
      </div>

      {error && (
        <div className="glass-card p-4 text-center text-cream/50 mb-6">
          Connect Supabase to see rankings
        </div>
      )}

      {leaderboard.length === 0 && !error && (
        <div className="glass-card p-8 text-center text-cream/40">
          No games played yet. Be the first!
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-cream/50 text-sm font-medium">#</th>
                <th className="text-left py-3 px-4 text-cream/50 text-sm font-medium">Player</th>
                <th className="text-right py-3 px-4 text-cream/50 text-sm font-medium">W</th>
                <th className="text-right py-3 px-4 text-cream/50 text-sm font-medium">L</th>
                <th className="text-right py-3 px-4 text-cream/50 text-sm font-medium">Win%</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, index) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span
                      className={
                        index === 0
                          ? 'text-yellow-400 font-bold'
                          : index === 1
                          ? 'text-gray-300 font-bold'
                          : index === 2
                          ? 'text-amber-600 font-bold'
                          : 'text-cream/40'
                      }
                    >
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-cream font-medium">{row.username}</td>
                  <td className="py-3 px-4 text-right text-green-400 font-mono text-sm">
                    {row.wins}
                  </td>
                  <td className="py-3 px-4 text-right text-red-400 font-mono text-sm">
                    {row.losses}
                  </td>
                  <td className="py-3 px-4 text-right text-[#e07b54] font-mono text-sm">
                    {row.win_rate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="text-cream/40 text-sm hover:text-cream/60 transition-colors">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
