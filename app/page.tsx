import Link from 'next/link'
import { StaticBoard } from '@/components/game/StaticBoard'
import { getInitialBoard } from '@/lib/initialBoard'

export default function HomePage() {
  const board = getInitialBoard()

  return (
    <main className="bg-cream-200 min-h-screen py-10 px-6">
      <div className="max-w-[560px] mx-auto flex flex-col gap-8">

        {/* Section 1: Play with friends or challenge AI */}
        <section className="flex gap-6 items-start">
          <div className="flex-shrink-0">
            <StaticBoard board={board} size="sm" />
          </div>
          <div className="flex-1 flex flex-col">
            <h1 className="text-[22px] font-extrabold text-brown-900 leading-tight mb-2">
              Play with friends or challenge the AI!
            </h1>
            <p className="text-xs text-brown-700 leading-relaxed mb-4 font-medium">
              Enjoy checkers in any format. Send a link to a friend for a quick online duel or practice your strategy against intelligent bots of varying difficulty.
            </p>
            <Link
              href="/game"
              className="mt-auto bg-sage-400 hover:bg-sage-500 rounded-pill text-center text-lg font-extrabold text-brown-900 w-full shadow-button"
              style={{ padding: '10px 0' }}
            >
              Play
            </Link>
          </div>
        </section>

        {/* Section 2: New formats */}
        <section className="flex gap-6 items-start">
          <div className="flex-1 flex flex-col">
            <h2 className="text-lg font-extrabold text-brown-900 leading-tight mb-2 text-center">
              New formats: from puzzles to coding
            </h2>
            <p className="text-[11px] text-brown-700 leading-relaxed mb-4 font-medium">
              Experience checkers from a completely new perspective. Solve complex game situations, train your intuition in invisible board mode, or write scripts to win in coder mode.
            </p>
            <Link
              href="/tasks"
              className="mt-auto bg-sage-400 hover:bg-sage-500 rounded-pill text-center text-lg font-extrabold text-brown-900 w-full shadow-button"
              style={{ padding: '10px 0' }}
            >
              Start
            </Link>
          </div>
          <div className="w-[200px] h-[200px] bg-sage-300 rounded-2xl flex-shrink-0" />
        </section>

        {/* Section 3: Play in your own style */}
        <section className="flex gap-6 items-start">
          <div className="flex-shrink-0 w-[240px] h-[240px] relative">
            <img
              src="/skin-preview.png"
              alt="Custom themed checkers board with burger and shawarma pieces"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <h2 className="text-lg font-extrabold text-brown-900 leading-tight mb-2 text-center">
              Play in Your Own Style
            </h2>
            <p className="text-[11px] text-brown-700 leading-relaxed mb-4 font-medium">
              Tired of the classic black and white? Choose custom board and piece designs. Discover unique styles and visual effects to make every game vibrant and memorable.
            </p>
            <Link
              href="/shop"
              className="mt-auto bg-sage-400 hover:bg-sage-500 rounded-pill text-center text-lg font-extrabold text-brown-900 w-full shadow-button"
              style={{ padding: '10px 0' }}
            >
              Shop
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
