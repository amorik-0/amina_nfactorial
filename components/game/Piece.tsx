'use client'

import { motion } from 'framer-motion'
import type { Skin, PieceVisual } from '@/lib/skins'
import type { CSSProperties } from 'react'
import type { GameMode, Piece as PieceType } from '@/lib/game/types'

const SPRING = { type: 'spring', stiffness: 300, damping: 26 } as const

// ── Classic warm (pink / green gradient coin) ─────────────────────────────────
const CLASSIC = {
  red: {
    ring:  '#D070A8',
    face:  'radial-gradient(circle at 38% 32%, #FFF0F8 0%, #F8C0DC 28%, #E080B8 70%)',
    shine: 'radial-gradient(ellipse at 35% 20%, rgba(255,255,255,0.65) 0%, transparent 60%)',
  },
  black: {
    ring:  '#5A9A40',
    face:  'radial-gradient(circle at 38% 32%, #EEFADE 0%, #B8E898 28%, #6AAA50 70%)',
    shine: 'radial-gradient(ellipse at 35% 20%, rgba(255,255,255,0.65) 0%, transparent 60%)',
  },
}

function ClassicPiece({ isRed, isKing, isSelected }: { isRed: boolean; isKing: boolean; isSelected: boolean }) {
  const c = isRed ? CLASSIC.red : CLASSIC.black
  const SIZE = 32

  return (
    <motion.div
      layout
      initial={false}
      animate={{ scale: isSelected ? 1.13 : 1, y: isSelected ? -2 : 0 }}
      transition={SPRING}
      style={{
        width: SIZE, height: SIZE, borderRadius: '50%',
        background: c.ring,
        boxShadow: isSelected
          ? `0 0 0 2px rgba(255,255,255,0.5), 0 6px 16px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.25)`
          : `0 4px 10px rgba(0,0,0,0.30), 0 1px 3px rgba(0,0,0,0.20)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', flexShrink: 0,
      }}
    >
      {/* face */}
      <div style={{
        position: 'absolute', inset: 3, borderRadius: '50%',
        background: c.face,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* shine overlay */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: c.shine }} />
        {isKing && (
          <span style={{ fontSize: 11, lineHeight: 1, zIndex: 1, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}>
            ♛
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ── Emoji / token piece (all other skins) ─────────────────────────────────────
function EmojiPiece({
  visual, isKing, isSelected, pieceId,
}: {
  visual: PieceVisual
  isKing: boolean
  isSelected: boolean
  pieceId: string
}) {
  const SIZE = 32
  const isDust = visual.emoji === 'DUST'
  const emoji  = isKing && visual.kingEmoji ? visual.kingEmoji : visual.emoji

  return (
    <motion.div
      layout
      layoutId={pieceId}
      initial={false}
      animate={{ scale: isSelected ? 1.13 : 1, y: isSelected ? -2 : 0 }}
      transition={SPRING}
      style={{
        width: SIZE, height: SIZE, borderRadius: '50%',
        background: visual.ringColor,
        boxShadow: isSelected
          ? `0 0 0 2px rgba(255,255,255,0.45), 0 6px 16px rgba(0,0,0,0.38), 0 2px 4px rgba(0,0,0,0.22)`
          : `0 4px 10px rgba(0,0,0,0.32), 0 1px 3px rgba(0,0,0,0.18)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', flexShrink: 0,
      }}
    >
      {/* face — main coloured surface */}
      <div style={{
        position: 'absolute',
        inset: 3,
        borderRadius: '50%',
        background: visual.innerColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* top-left shine */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(ellipse at 33% 22%, rgba(255,255,255,0.55) 0%, transparent 58%)',
          pointerEvents: 'none',
        }} />

        {/* content */}
        {isDust ? (
          <span style={{
            fontSize: 6.5,
            fontWeight: 900,
            fontFamily: 'Impact, "Arial Narrow", Arial, sans-serif',
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '0.06em',
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
            lineHeight: 1,
            zIndex: 1,
            transform: isKing ? 'none' : undefined,
          }}>
            {isKing ? '★DUST' : 'DUST'}
          </span>
        ) : (
          <span style={{
            fontSize: 15,
            lineHeight: 1,
            userSelect: 'none',
            zIndex: 1,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.30))',
          }}>
            {emoji}
          </span>
        )}
      </div>

      {/* king badge — small gold star in bottom-right */}
      {isKing && (
        <div style={{
          position: 'absolute', bottom: -1, right: -1,
          width: 11, height: 11, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFE060, #C89000)',
          border: '1.5px solid #A07000',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 6.5, lineHeight: 1, color: '#5A3A00',
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
  const useClassic = activeSkinId === 'classic' || (gameMode === 'classic' && activeSkinId === 'default')

  if (useClassic) {
    return <ClassicPiece isRed={isRed} isKing={isKing} isSelected={isSelected} />
  }

  return (
    <EmojiPiece
      visual={isRed ? skin.pieces.red : skin.pieces.black}
      isKing={isKing}
      isSelected={isSelected}
      pieceId={piece.id}
    />
  )
}
