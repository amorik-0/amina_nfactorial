'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Skin, PieceVisual } from '@/lib/skins'
import type { CSSProperties } from 'react'
import type { GameMode, Piece as PieceType } from '@/lib/game/types'

// ── Classic warm piece (default skin in classic mode) ─────────────────────────
const RING_COLOR = { green: '#88BD70', pink: '#E89BC8' }
const INNER_GRADIENT = {
  green: 'radial-gradient(circle at 35% 28%, #E8F5D8 0%, #D5ECBA 8%, #A9DB94 22%)',
  pink:  'radial-gradient(circle at 35% 28%, #FFF0F4 0%, #FFE0E5 8%, #FFC2E8 22%)',
}
const CROWN_STYLE: CSSProperties = {
  color: '#C8A020',
  filter: 'drop-shadow(0 1px 2px rgba(180,140,0,0.60))',
  fontSize: 10,
}
function ClassicWarmPiece({ isRed, isKing, isSelected }: { isRed: boolean; isKing: boolean; isSelected: boolean }) {
  const palette = isRed ? 'pink' : 'green'
  return (
    <motion.div
      layout
      initial={false}
      animate={{ scale: isSelected ? 1.12 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        width: 32, height: 32, borderRadius: '50%',
        background: RING_COLOR[palette],
        boxShadow: isSelected ? '0 6px 18px rgba(0,0,0,0.25)' : '0 3px 10px rgba(0,0,0,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}
    >
      <div style={{
        width: '68%', height: '68%', borderRadius: '50%',
        background: INNER_GRADIENT[palette],
        boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isKing && <span style={CROWN_STYLE}>♛</span>}
      </div>
    </motion.div>
  )
}

// ── Emoji / icon piece (all non-classic skins) ────────────────────────────────
function EmojiPiece({
  visual,
  isKing,
  isSelected,
  pieceId,
}: {
  visual: PieceVisual
  isKing: boolean
  isSelected: boolean
  pieceId: string
}) {
  const emoji = isKing ? (visual.kingEmoji ?? visual.emoji) : visual.emoji
  const isDustText = emoji === 'DUST'

  return (
    <motion.div
      layout
      layoutId={pieceId}
      initial={false}
      animate={{ scale: isSelected ? 1.12 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: visual.outerColor,
        boxShadow: isSelected
          ? `0 0 0 2.5px ${visual.ringColor}, 0 6px 18px rgba(0,0,0,0.30)`
          : `0 0 0 2px ${visual.ringColor}, 0 3px 8px rgba(0,0,0,0.22)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* inner highlight circle */}
      <div style={{
        position: 'absolute',
        inset: 3,
        borderRadius: '50%',
        background: visual.innerColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {isDustText ? (
          <span style={{
            fontSize: 7,
            fontWeight: 900,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.04em',
            fontFamily: 'Impact, Arial Black, sans-serif',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            lineHeight: 1,
          }}>
            {isKing ? '★DUST' : 'DUST'}
          </span>
        ) : (
          <span style={{
            fontSize: isDustText ? 7 : 16,
            lineHeight: 1,
            userSelect: 'none',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
          }}>
            {emoji}
          </span>
        )}
      </div>

      {/* king indicator: gold star badge */}
      {isKing && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#F0C020',
          border: '1.5px solid #A08000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 7,
          lineHeight: 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}>
          ★
        </div>
      )}
    </motion.div>
  )
}

// ── Public component ──────────────────────────────────────────────────────────
interface PieceProps {
  piece: PieceType
  skin: Skin
  gameMode: GameMode
  activeSkinId: string
  isSelected?: boolean
}

export function Piece({ piece, skin, gameMode, activeSkinId, isSelected = false }: PieceProps) {
  const isRed  = piece.player === 'red'
  const isKing = piece.type === 'king'
  const isClassicWarm = gameMode === 'classic' && activeSkinId === 'default'

  if (isClassicWarm) {
    return <ClassicWarmPiece isRed={isRed} isKing={isKing} isSelected={isSelected} />
  }

  const visual = isRed ? skin.pieces.red : skin.pieces.black

  return (
    <EmojiPiece
      visual={visual}
      isKing={isKing}
      isSelected={isSelected}
      pieceId={piece.id}
    />
  )
}
