'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameMode, GameType } from '@/lib/game/types'

// ─── data ──────────────────────────────────────────────────────────────────────

const MODES: {
  id: GameMode
  label: string
  tagline: string
  description: string
  accent: string
  bg: string
  border: string
  tag: string
}[] = [
  {
    id: 'classic',
    label: 'Classic',
    tagline: 'Pure checkers, no distractions.',
    description: 'Full board visibility. Click to move. Focus on strategy.',
    accent: 'text-stone-800',
    bg: 'bg-stone-50 hover:bg-stone-100',
    border: 'border-stone-200 hover:border-stone-300',
    tag: 'bg-stone-100 text-stone-500',
  },
  {
    id: 'fog',
    label: 'Fog of War',
    tagline: 'You only see what your pieces reveal.',
    description: 'Fog surrounds the board. Move by clicking. Out-think your opponent.',
    accent: 'text-slate-800',
    bg: 'bg-slate-50 hover:bg-slate-100',
    border: 'border-slate-200 hover:border-slate-300',
    tag: 'bg-slate-100 text-slate-500',
  },
  {
    id: 'code',
    label: 'CodeCheckers',
    tagline: 'Control the board with code.',
    description: 'Fog of War + terminal input. Type board.move("A3","B4") to play.',
    accent: 'text-zinc-100',
    bg: 'bg-zinc-900 hover:bg-zinc-800',
    border: 'border-zinc-700 hover:border-zinc-600',
    tag: 'bg-zinc-800 text-zinc-400',
  },
]

const TYPES: { id: GameType; label: string; sub: string }[] = [
  { id: 'local',       label: 'Local',       sub: 'Pass & Play on one device' },
  { id: 'ai',          label: 'vs Bot',      sub: 'Play against the AI'       },
  { id: 'multiplayer', label: 'Multiplayer', sub: 'Challenge a friend online' },
]

// ─── component ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<GameMode | null>(null)

  function handleSelect(mode: GameMode) {
    setSelected(prev => (prev === mode ? null : mode))
  }

  function handlePlay(type: GameType) {
    if (!selected) return
    if (type === 'multiplayer') {
      router.push(`/play/${selected}/multiplayer?roomId=new`)
    } else {
      router.push(`/play/${selected}/${type}`)
    }
  }

  const isDarkMode = selected === 'code'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-stone-100">
        <span className="text-sm font-semibold tracking-tight text-stone-900">Checkers</span>
        <div className="flex items-center gap-4">
          <a
            href="/puzzles"
            className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
          >
            Puzzles
          </a>
          <a
            href="/shop"
            className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
          >
            Shop
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 mb-3">
            Choose your game
          </h1>
          <p className="text-stone-400 text-sm max-w-xs mx-auto leading-relaxed">
            Three modes, one board. Pick a style, then choose how you want to play.
          </p>
        </motion.div>

        {/* Mode cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
        >
          {MODES.map(m => {
            const isActive = selected === m.id
            return (
              <motion.button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className={`
                  relative text-left p-5 border rounded-xl transition-colors duration-200
                  ${m.bg} ${m.border}
                  ${isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                `}
              >
                {/* Mode tag */}
                <span className={`inline-block text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded mb-3 ${m.tag}`}>
                  {m.id}
                </span>

                <p className={`font-semibold text-sm mb-1 ${m.accent}`}>{m.label}</p>
                <p className={`text-xs leading-relaxed ${m.id === 'code' ? 'text-zinc-400' : 'text-stone-400'}`}>
                  {m.tagline}
                </p>

                {/* Active check */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Type picker — slides in when a mode is selected */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key="type-picker"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="overflow-hidden w-full max-w-2xl"
            >
              <div className="pt-1">
                <p className="text-xs text-stone-400 mb-3 font-medium tracking-wide uppercase">
                  How do you want to play?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map((t, i) => (
                    <motion.button
                      key={t.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.2 }}
                      onClick={() => handlePlay(t.id)}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="
                        group text-left px-4 py-3
                        border border-stone-200 rounded-lg
                        hover:border-blue-400 hover:bg-blue-50
                        transition-colors duration-150
                      "
                    >
                      <p className="text-sm font-semibold text-stone-800 group-hover:text-blue-700 transition-colors">
                        {t.label}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">{t.sub}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description of selected mode */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.p
              key={selected}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-stone-400 text-center max-w-sm leading-relaxed"
            >
              {MODES.find(m => m.id === selected)?.description}
            </motion.p>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-stone-100 flex items-center justify-between">
        <span className="text-[11px] text-stone-300">Checkers Platform</span>
        <span className="font-mono text-[10px] text-stone-300">
          board.move(&quot;A3&quot;, &quot;B4&quot;)
        </span>
      </footer>
    </div>
  )
}
