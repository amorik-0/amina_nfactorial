import Link from 'next/link'
import { Button } from '@/components/ui/button'

const MODES = [
  {
    href: '/play/local',
    icon: '🤝',
    title: 'Pass & Play',
    description: 'Two players on one device. Take turns and battle it out!',
    badge: 'Local',
    color: 'from-blue-500/10 to-indigo-500/10',
    border: 'hover:border-blue-400/40',
  },
  {
    href: '/play/ai',
    icon: '🤖',
    title: 'vs AI',
    description: 'Challenge our minimax AI with alpha-beta pruning. Can you win?',
    badge: 'Solo',
    color: 'from-[#e07b54]/10 to-red-500/10',
    border: 'hover:border-[#e07b54]/40',
  },
  {
    href: '/play/new',
    icon: '🌐',
    title: 'Multiplayer',
    description: 'Create a room and invite a friend. Real-time play via Supabase.',
    badge: 'Online',
    color: 'from-green-500/10 to-emerald-500/10',
    border: 'hover:border-green-400/40',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      {/* Hero */}
      <div className="text-center mb-16 max-w-2xl">
        <div className="text-8xl mb-6 animate-bounce-slow">♟</div>

        <h1 className="text-5xl sm:text-6xl font-black mb-4 leading-tight">
          <span className="gradient-text">Checkers Duel</span>
        </h1>

        <p className="text-cream/60 text-xl max-w-md mx-auto leading-relaxed">
          Classic checkers reimagined — play locally, challenge AI, or duel a
          friend online in real time.
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid sm:grid-cols-3 gap-5 w-full max-w-3xl mb-12">
        {MODES.map(mode => (
          <Link
            key={mode.href}
            href={mode.href}
            className={`
              group relative flex flex-col gap-4 p-6 rounded-2xl
              bg-gradient-to-br ${mode.color}
              backdrop-blur-md border border-white/10 ${mode.border}
              transition-all duration-300 hover:scale-105 hover:-translate-y-1
              hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]
            `}
          >
            {/* Badge */}
            <span className="absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-cream/60">
              {mode.badge}
            </span>

            <span className="text-4xl">{mode.icon}</span>

            <div>
              <h2 className="text-cream font-bold text-xl mb-1">{mode.title}</h2>
              <p className="text-cream/60 text-sm leading-relaxed">
                {mode.description}
              </p>
            </div>

            <div className="mt-auto">
              <span className="text-[#e07b54] text-sm font-medium group-hover:underline">
                Play now →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Leaderboard link */}
      <Button variant="outline" asChild>
        <Link href="/leaderboard">
          🏆 View Leaderboard
        </Link>
      </Button>

      {/* Rules hint */}
      <div className="mt-10 text-cream/30 text-sm text-center max-w-xs">
        Mandatory captures · Chain jumps · Kings on last rank
      </div>
    </div>
  )
}
