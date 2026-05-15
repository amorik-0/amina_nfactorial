import Link from 'next/link'
import { ArrowRight, Terminal, Bot, Users } from 'lucide-react'

const MODES = [
  {
    href: '/play/local',
    icon: Users,
    label: 'Local',
    title: 'Terminal Sandbox',
    description: 'Play pass-and-play with fog of war. Use the code terminal to move pieces.',
  },
  {
    href: '/play/ai',
    icon: Bot,
    label: 'Bot',
    title: 'vs Bot',
    description: 'You play Red via the terminal. The bot plays Black automatically.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Wordmark */}
      <div className="mb-12 text-center">
        <div className="flex items-center gap-2 justify-center mb-3">
          <Terminal size={20} className="text-zinc-400" strokeWidth={1.5} />
          <span className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
            CodeCheckers
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-100">
          Fog of War
        </h1>
        <p className="mt-3 text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
          Move pieces by writing code. Only see what your pieces reveal.
        </p>
      </div>

      {/* Mode cards */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mb-16">
        {MODES.map(({ href, icon: Icon, label, title, description }) => (
          <Link
            key={href}
            href={href}
            className="
              flex-1 group flex flex-col gap-4 p-5
              border border-zinc-800 hover:border-zinc-600
              bg-zinc-950 hover:bg-zinc-900
              transition-colors duration-150
            "
          >
            <div className="flex items-center justify-between">
              <Icon size={16} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" strokeWidth={1.5} />
              <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                {label}
              </span>
            </div>
            <div>
              <p className="font-semibold text-zinc-200 text-sm mb-1">{title}</p>
              <p className="text-zinc-500 text-xs leading-relaxed">{description}</p>
            </div>
            <div className="flex items-center gap-1 text-blue-500 text-xs font-mono mt-auto">
              Play <ArrowRight size={11} />
            </div>
          </Link>
        ))}
      </div>

      {/* Syntax reference */}
      <div className="border border-zinc-800 px-6 py-4 max-w-sm w-full">
        <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-3">
          Command syntax
        </p>
        <code className="font-mono text-xs text-zinc-300">
          board.move(&quot;A3&quot;, &quot;B4&quot;)
        </code>
        <p className="text-[10px] text-zinc-600 mt-2 leading-relaxed">
          Columns A–H, rows 1–8. Diagonal moves only. Captures are mandatory.
        </p>
      </div>

      <p className="mt-12 font-mono text-[10px] text-zinc-700">
        CodeCheckers — Fog of War Engine
      </p>
    </div>
  )
}
