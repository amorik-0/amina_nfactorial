import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'
import { PUZZLES, DIFFICULTY_COLORS, type Difficulty } from '@/lib/puzzles'

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy:   'Easy',
  medium: 'Medium',
  hard:   'Hard',
}

const SECTION_DESCRIPTIONS: Record<Difficulty, string> = {
  easy:   'Just advance your piece to rank 8 in two moves.',
  medium: 'Captures and position setup required.',
  hard:   'Chain jumps and multi-piece decisions.',
}

export default function PuzzlesPage() {
  const grouped = {
    easy:   PUZZLES.filter(p => p.difficulty === 'easy'),
    medium: PUZZLES.filter(p => p.difficulty === 'medium'),
    hard:   PUZZLES.filter(p => p.difficulty === 'hard'),
  } as Record<Difficulty, typeof PUZZLES>

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-xs font-mono transition-colors"
        >
          <ArrowLeft size={12} /> Home
        </Link>
        <h1 className="font-mono text-sm font-semibold text-zinc-200 tracking-widest uppercase">
          CodeCheckers · Puzzles
        </h1>
        <span className="text-xs font-mono text-zinc-600">{PUZZLES.length} puzzles</span>
      </header>

      {/* Intro */}
      <div className="px-8 py-8 max-w-3xl mx-auto">
        <p className="font-mono text-sm text-zinc-400 leading-relaxed">
          Each puzzle presents a fixed board position. Your task: write{' '}
          <span className="text-zinc-200">board.move()</span> commands in the terminal to crown
          a red piece in{' '}
          <span className="text-zinc-200">exactly 2 moves</span>. The engine enforces real
          checkers rules — mandatory captures included.
        </p>
      </div>

      {/* Sections */}
      <main className="px-8 pb-16 max-w-3xl mx-auto space-y-12">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
          <section key={diff}>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`
                  inline-block text-[10px] font-mono uppercase tracking-widest
                  px-2 py-0.5 rounded border font-semibold
                  ${DIFFICULTY_COLORS[diff]}
                `}
              >
                {DIFFICULTY_LABELS[diff]}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {SECTION_DESCRIPTIONS[diff]}
              </span>
            </div>

            {/* Puzzle grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {grouped[diff].map(puzzle => (
                <Link
                  key={puzzle.id}
                  href={`/puzzles/${puzzle.id}`}
                  className="
                    group flex flex-col gap-2
                    border border-zinc-800 rounded-lg p-4
                    hover:border-zinc-600 hover:bg-zinc-900
                    transition-colors duration-150
                  "
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-zinc-600 mr-2">
                        #{String(puzzle.id).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-sm font-semibold text-zinc-200 group-hover:text-white">
                        {puzzle.title}
                      </span>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-zinc-500 leading-relaxed line-clamp-2">
                    {puzzle.description}
                  </p>
                  <div className="mt-auto pt-1 font-mono text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
                    {puzzle.solution.length} command{puzzle.solution.length !== 1 ? 's' : ''} · board.move()
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
