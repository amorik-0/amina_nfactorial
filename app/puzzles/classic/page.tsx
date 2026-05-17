import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PUZZLES, DIFFICULTY_COLORS, type Difficulty } from '@/lib/puzzles'

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy:   'Easy',
  medium: 'Medium',
  hard:   'Hard',
}

const SECTION_DESCRIPTIONS: Record<Difficulty, string> = {
  easy:   'Click your piece twice forward — it\'s all intuition.',
  medium: 'Captures and positioning — feel the right move.',
  hard:   'Chain jumps across two enemies.',
}

export default function ClassicPuzzlesPage() {
  const grouped = {
    easy:   PUZZLES.filter(p => p.difficulty === 'easy'),
    medium: PUZZLES.filter(p => p.difficulty === 'medium'),
    hard:   PUZZLES.filter(p => p.difficulty === 'hard'),
  } as Record<Difficulty, typeof PUZZLES>

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm transition-colors"
        >
          <ArrowLeft size={14} /> Home
        </Link>
        <h1 className="text-sm font-semibold text-stone-800 tracking-tight">
          Classic Puzzles
        </h1>
        <span className="text-xs text-stone-400">{PUZZLES.length} puzzles</span>
      </header>

      {/* Intro */}
      <div className="px-8 py-8 max-w-3xl mx-auto">
        <p className="text-sm text-stone-500 leading-relaxed">
          Each puzzle presents a fixed board position.{' '}
          <span className="text-stone-800 font-medium">Click a red piece, then click where to move it.</span>{' '}
          Crown a red piece at rank 8 to solve. Real checkers rules apply — mandatory captures are enforced.
        </p>
      </div>

      {/* Sections */}
      <main className="px-8 pb-16 max-w-3xl mx-auto space-y-12">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
          <section key={diff}>
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`
                  inline-block text-[10px] font-medium uppercase tracking-widest
                  px-2 py-0.5 rounded border
                  ${DIFFICULTY_COLORS[diff]}
                `}
              >
                {DIFFICULTY_LABELS[diff]}
              </span>
              <span className="text-xs text-stone-400">
                {SECTION_DESCRIPTIONS[diff]}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {grouped[diff].map(puzzle => (
                <Link
                  key={puzzle.id}
                  href={`/puzzles/classic/${puzzle.id}`}
                  className="
                    group flex flex-col gap-2
                    border border-stone-200 rounded-xl p-4 bg-white
                    hover:border-stone-300 hover:shadow-sm
                    transition-all duration-150
                  "
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-stone-300 mr-2">
                        #{String(puzzle.id).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-semibold text-stone-800 group-hover:text-stone-900">
                        {puzzle.title}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                    {puzzle.description}
                  </p>
                  <div className="mt-auto pt-1 text-[10px] text-stone-300 group-hover:text-stone-500 transition-colors">
                    {puzzle.solution.length} moves · click to play
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
