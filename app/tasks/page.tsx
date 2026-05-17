'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { StaticBoard } from '@/components/game/StaticBoard'
import { getInitialBoard } from '@/lib/initialBoard'

// ─────────────────────────────────────────────────────────────────────────────
// 3-step flow
//   1. Welcome  + choose mode  (Classic / Coder mode)
//   2. Choose level            (Easy / Normal / Hard)
//   3. Show task               (board + description + timer)
// ─────────────────────────────────────────────────────────────────────────────

type Step  = 1 | 2 | 3
type Mode  = 'classic' | 'coder'
type Level = 'easy' | 'normal' | 'hard'

const MODE_LABEL: Record<Mode, string> = {
  classic: 'Classic',
  coder:   'Coder mode',
}

const LEVEL_LABEL: Record<Level, string> = {
  easy:   'Easy',
  normal: 'Normal',
  hard:   'Hard',
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Welcome + mode selection
// ─────────────────────────────────────────────────────────────────────────────
function StepWelcome({ onPickMode }: { onPickMode: (m: Mode) => void }) {
  return (
    <section className="flex gap-4 items-start">
      <div className="flex-1">
        <h1 className="text-2xl font-extrabold text-brown-900 mb-2">
          Welcome to the tasks section!
        </h1>
        <p className="text-xs font-medium text-brown-700 leading-relaxed mb-4">
          Your goal is to assess the board position and find the perfect move before
          time runs out. Search for hidden combinations: break into kings or take down
          multiple opponents&apos; pieces at once. Every second counts!
        </p>
        <p className="text-xs font-medium text-brown-700 mb-3">
          Choose one of the two modes below to get started:
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => onPickMode('classic')}
            className="bg-sage-300 hover:bg-sage-400 rounded-xl px-6 py-3 text-base font-extrabold text-brown-900 shadow-card-sm transition-colors"
          >
            Classic
          </button>
          <button
            onClick={() => onPickMode('coder')}
            className="bg-sage-300 hover:bg-sage-400 rounded-xl px-6 py-3 text-base font-extrabold text-brown-900 shadow-card-sm transition-colors"
          >
            Coder mode
          </button>
        </div>
      </div>
      <div className="flex-shrink-0">
        <img
          src="/canva/red-flag.png"
          alt="Red flag"
          className="w-[140px] h-auto"
        />
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Choose level
// ─────────────────────────────────────────────────────────────────────────────
function StepLevel({
  mode,
  onPickLevel,
  onBack,
}: {
  mode: Mode
  onPickLevel: (lvl: Level) => void
  onBack: () => void
}) {
  return (
    <section>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-brown-700 hover:text-brown-900 mb-6 font-bold transition-colors"
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
        Back to modes
      </button>

      <p className="text-sm font-bold text-brown-700 mb-2">
        Mode: <span className="text-brown-900">{MODE_LABEL[mode]}</span>
      </p>
      <h2 className="text-4xl font-extrabold text-brown-900 mb-8 text-center">
        Choose your level!
      </h2>

      <div className="flex justify-center gap-4">
        {(['easy', 'normal', 'hard'] as Level[]).map(lvl => (
          <button
            key={lvl}
            onClick={() => onPickLevel(lvl)}
            className="bg-sage-300 hover:bg-sage-400 rounded-xl px-8 py-3 text-xl font-extrabold text-brown-900 shadow-card-sm min-w-[110px] transition-colors"
          >
            {LEVEL_LABEL[lvl]}
          </button>
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
const TASK_DESCRIPTIONS: Record<Mode, Record<Level, string>> = {
  classic: {
    easy:   'Find the forced capture that gains a piece advantage. Look for an undefended opponent piece and jump over it in one move.',
    normal: 'Analyse the position carefully — there is a two-move combination that captures two pieces. Find the forced sequence before time runs out.',
    hard:   'A multi-jump chain is hidden in this position. Calculate three moves ahead to clear the path and crown your piece.',
  },
  coder: {
    easy:   'Write board.move() to capture the opponent\'s lone piece. Use the coordinate notation shown on the board (e.g. board.move("C3","D4")).',
    normal: 'Code a two-step sequence: first set up the position, then execute the jump. Both commands must follow forced-capture rules.',
    hard:   'Craft a three-command script that chains multiple captures. The engine enforces mandatory captures — every move must be legal.',
  },
}

const TIMER_SECONDS: Record<Level, number> = { easy: 60, normal: 45, hard: 30 }

// Step 3 — Show actual task (board + description + timer)
// ─────────────────────────────────────────────────────────────────────────────
function StepTask({
  mode,
  level,
  onBack,
}: {
  mode: Mode
  level: Level
  onBack: () => void
}) {
  const board = getInitialBoard()
  const router = useRouter()
  const total = TIMER_SECONDS[level]
  const [seconds, setSeconds] = useState(total)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [started, setStarted] = useState(false)

  const puzzleHref = mode === 'classic'
    ? `/puzzles/classic?diff=${level}`
    : `/puzzles?diff=${level}`

  function startTimer() {
    if (started) return
    setStarted(true)
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          router.push(puzzleHref)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const urgent = seconds <= 10 && started

  return (
    <section>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-brown-700 hover:text-brown-900 mb-6 font-bold transition-colors"
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
        Back to levels
      </button>

      <div className="flex items-center gap-3 mb-6">
        <span className="px-3 py-1 rounded-pill bg-sage-300 text-xs font-extrabold text-brown-900">
          {MODE_LABEL[mode]}
        </span>
        <span className="px-3 py-1 rounded-pill bg-sage-200 text-xs font-extrabold text-brown-900">
          {LEVEL_LABEL[level]}
        </span>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-shrink-0">
          <StaticBoard board={board} size="md" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-extrabold text-brown-900 mb-3">Your task:</h3>
          <p className="text-sm text-brown-700 font-semibold mb-6 leading-relaxed">
            {TASK_DESCRIPTIONS[mode][level]}
          </p>
          <p className="text-base font-extrabold text-brown-900">Time limit:</p>
          <p className={`text-4xl font-extrabold tabular-nums mb-6 ${urgent ? 'text-red-500' : 'text-brown-900'}`}>
            {mm}:{ss}
          </p>

          <Link
            href={puzzleHref}
            onClick={startTimer}
            className="inline-block bg-sage-400 hover:bg-sage-500 rounded-pill px-8 py-3 text-base font-extrabold text-brown-900 shadow-button transition-colors"
          >
            Start
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [step,  setStep]  = useState<Step>(1)
  const [mode,  setMode]  = useState<Mode  | null>(null)
  const [level, setLevel] = useState<Level | null>(null)

  function pickMode(m: Mode) {
    setMode(m)
    setStep(2)
  }

  function pickLevel(l: Level) {
    setLevel(l)
    setStep(3)
  }

  function backToModes() {
    setStep(1)
    setMode(null)
    setLevel(null)
  }

  function backToLevels() {
    setStep(2)
    setLevel(null)
  }

  return (
    <main className="bg-cream-200 min-h-screen py-10 px-6">
      <div className="max-w-[640px] mx-auto">
        {step === 1 && <StepWelcome onPickMode={pickMode} />}
        {step === 2 && mode && (
          <StepLevel mode={mode} onPickLevel={pickLevel} onBack={backToModes} />
        )}
        {step === 3 && mode && level && (
          <StepTask mode={mode} level={level} onBack={backToLevels} />
        )}
      </div>
    </main>
  )
}
