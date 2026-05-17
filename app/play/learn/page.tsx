'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react'
import { useTutorialStore } from '@/store/tutorialStore'
import { TUTORIAL_STEPS } from '@/lib/game/tutorialSteps'
import { TutorialBoard } from '@/components/tutorial/TutorialBoard'

// ── Progress dots at the top ──────────────────────────────────────────────────
function ProgressBar({ total, current, completed }: { total: number; current: number; completed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === current ? 28 : 10,
            background:
              i < current || (i === current && completed)
                ? '#88BD70'
                : i === current
                ? '#424040'
                : 'rgba(66,64,64,0.2)',
          }}
        />
      ))}
    </div>
  )
}

// ── Instruction card ──────────────────────────────────────────────────────────
function InstructionCard({
  step,
  index,
  total,
  isCompleted,
  mistakes,
}: {
  step: (typeof TUTORIAL_STEPS)[number]
  index: number
  total: number
  isCompleted: boolean
  mistakes: number
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="bg-sage-200 rounded-card shadow-card p-6 w-full max-w-sm"
      >
        {/* Step counter */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-extrabold text-brown-500 uppercase tracking-wider">
            Step {index + 1} / {total}
          </span>
          {mistakes > 0 && !isCompleted && (
            <span className="text-xs font-bold text-red-400">
              {mistakes} mistake{mistakes !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <h2 className="text-2xl font-extrabold text-brown-900 mb-3">{step.title}</h2>
        <p className="text-sm font-medium text-brown-700 leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Hint */}
        <div className="border-l-2 border-sage-400 pl-3 py-0.5">
          <p className="text-xs text-brown-500 font-medium">{step.hint}</p>
        </div>

        {/* Completion state */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 flex items-center gap-2 text-sm font-bold text-piece-green-dark"
            >
              <CheckCircle2 size={18} strokeWidth={2.5} />
              Nice work! Ready for the next step.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Navigation controls ───────────────────────────────────────────────────────
function NavControls({
  index,
  total,
  isCompleted,
  onPrev,
  onNext,
  onReset,
}: {
  index: number
  total: number
  isCompleted: boolean
  onPrev: () => void
  onNext: () => void
  onReset: () => void
}) {
  const isLast = index === total - 1

  return (
    <div className="flex items-center gap-3 w-full max-w-sm">
      <button
        onClick={onPrev}
        disabled={index === 0}
        className="flex items-center gap-1 px-4 py-2 rounded-pill text-sm font-bold text-brown-700 hover:bg-sage-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <button
        onClick={onReset}
        className="ml-auto p-2 rounded-full text-brown-500 hover:text-brown-900 hover:bg-sage-200 transition-colors"
        title="Restart this step"
      >
        <RotateCcw size={16} />
      </button>

      {isLast && isCompleted ? (
        <Link
          href="/game"
          className="flex items-center gap-1.5 px-5 py-2 bg-sage-400 hover:bg-sage-500 rounded-pill text-sm font-extrabold text-brown-900 shadow-button transition-colors"
        >
          Play now
        </Link>
      ) : (
        <button
          onClick={onNext}
          disabled={!isCompleted}
          className="flex items-center gap-1 px-5 py-2 bg-sage-400 hover:bg-sage-500 disabled:bg-sage-200 disabled:text-brown-400 disabled:cursor-not-allowed rounded-pill text-sm font-extrabold text-brown-900 shadow-button transition-colors"
        >
          Next <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LearnPage() {
  const { currentStepIndex, isStepCompleted, mistakesMade, nextStep, prevStep, goToStep, reset } =
    useTutorialStore()

  const step = TUTORIAL_STEPS[currentStepIndex]
  const isAllDone = currentStepIndex === TUTORIAL_STEPS.length - 1 && isStepCompleted

  // Reset store on mount so you always start fresh
  useEffect(() => {
    reset()
  }, [reset])

  function handleReset() {
    goToStep(currentStepIndex)
  }

  return (
    <main className="bg-cream-200 min-h-screen py-10 px-6">
      {/* Top bar */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
        <Link
          href="/game"
          className="flex items-center gap-1 text-sm font-bold text-brown-700 hover:text-brown-900 transition-colors"
        >
          <ChevronLeft size={16} /> Exit tutorial
        </Link>
        <ProgressBar
          total={TUTORIAL_STEPS.length}
          current={currentStepIndex}
          completed={isStepCompleted}
        />
        <div className="text-xs font-bold text-brown-400 tabular-nums">
          {currentStepIndex + 1}/{TUTORIAL_STEPS.length}
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-start gap-10 justify-center">
        {/* Board */}
        <div className="flex-shrink-0">
          <TutorialBoard />
        </div>

        {/* Instruction panel */}
        <div className="flex flex-col gap-5 w-full max-w-sm">
          <InstructionCard
            step={step}
            index={currentStepIndex}
            total={TUTORIAL_STEPS.length}
            isCompleted={isStepCompleted}
            mistakes={mistakesMade}
          />

          <NavControls
            index={currentStepIndex}
            total={TUTORIAL_STEPS.length}
            isCompleted={isStepCompleted}
            onPrev={prevStep}
            onNext={nextStep}
            onReset={handleReset}
          />

          {/* All-done banner */}
          <AnimatePresence>
            {isAllDone && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-sage-300 rounded-card p-4 text-center shadow-card-sm"
              >
                <p className="text-sm font-extrabold text-brown-900 mb-1">
                  Tutorial complete! 🎉
                </p>
                <p className="text-xs font-medium text-brown-700">
                  You know the rules. Time to play a real game.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
