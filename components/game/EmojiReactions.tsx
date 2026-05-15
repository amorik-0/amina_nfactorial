'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EMOJIS = ['👍', '😂', '😮', '😢', '🔥', '👏'] as const
type Emoji = typeof EMOJIS[number]

interface FloatingEmoji {
  id: number
  emoji: Emoji
  x: number
}

interface EmojiReactionsProps {
  onReaction?: (emoji: Emoji) => void
}

let reactionCounter = 0

export function EmojiReactions({ onReaction }: EmojiReactionsProps) {
  const [floating, setFloating] = useState<FloatingEmoji[]>([])

  const handleReaction = useCallback((emoji: Emoji) => {
    const id = ++reactionCounter
    const x = Math.random() * 60 - 30 // -30 to +30px horizontal drift

    setFloating(prev => [...prev, { id, emoji, x }])
    onReaction?.(emoji)

    // Remove after animation
    setTimeout(() => {
      setFloating(prev => prev.filter(f => f.id !== id))
    }, 1600)
  }, [onReaction])

  return (
    <div className="relative flex flex-col gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
      <div className="text-cream/50 text-xs text-center font-medium uppercase tracking-wider">
        Reactions
      </div>

      {/* Emoji buttons */}
      <div className="grid grid-cols-3 gap-2">
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className="relative text-2xl flex items-center justify-center h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all active:scale-90 hover:scale-110 duration-150"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Floating animations */}
      <AnimatePresence>
        {floating.map(({ id, emoji, x }) => (
          <motion.div
            key={id}
            className="absolute bottom-16 left-1/2 pointer-events-none text-3xl z-20"
            style={{ translateX: '-50%' }}
            initial={{ y: 0, x, opacity: 1, scale: 0.5 }}
            animate={{ y: -80, x: x * 1.5, opacity: 0, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          >
            {emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
