'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'

// ── Mode → URL segment map (Learning = AI bot on classic) ────────────────────
type ModeKey = 'classic' | 'learning' | 'fog' | 'code'

const PLAY_TYPES: Record<ModeKey, { label: string; href: string }[]> = {
  classic: [
    { label: 'Friend offline', href: '/play/classic/local' },
    { label: 'Friend online',  href: '/play/classic/multiplayer' },
    { label: 'AI bot',         href: '/play/classic/ai' },
  ],
  learning: [
    { label: 'Easy AI',   href: '/play/classic/ai' },
    { label: 'Normal AI', href: '/play/classic/ai' },
    { label: 'Hard AI',   href: '/play/classic/ai' },
  ],
  fog: [
    { label: 'Friend offline', href: '/play/fog/local' },
    { label: 'Friend online',  href: '/play/fog/multiplayer' },
    { label: 'AI bot',         href: '/play/fog/ai' },
  ],
  code: [
    { label: 'Friend offline', href: '/play/code/local' },
    { label: 'Friend online',  href: '/play/code/multiplayer' },
    { label: 'AI bot',         href: '/play/code/ai' },
  ],
}

const MODE_LABEL: Record<ModeKey, string> = {
  classic:  'Classic',
  learning: 'Learning',
  fog:      'Fog mode',
  code:     'Coder mode',
}

// ─────────────────────────────────────────────────────────────────────────────
// 3×8 checkerboard preview embedded inside the "Classic" mode card.
// Fills almost the full card width — label sits overlaid in bottom-right.
// ─────────────────────────────────────────────────────────────────────────────
function MiniBoardPreview({ cellSize = 50 }: { cellSize?: number }) {
  const ROWS: ('g' | 'p' | '.')[][] = [
    ['.', 'g', '.', 'g', '.', 'g', '.', 'g'],
    ['p', '.', '.', '.', 'g', '.', 'p', '.'],
    ['.', 'p', '.', 'p', '.', '.', '.', '.'],
  ]

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-card-sm"
      style={{
        background: '#FFFDE1',
        width: cellSize * 8,
      }}
    >
      {ROWS.map((row, r) => (
        <div key={r} className="flex">
          {row.map((cell, c) => {
            const isDark = (r + c) % 2 === 1
            return (
              <div
                key={c}
                style={{
                  width: cellSize, height: cellSize,
                  background: isDark ? '#424040' : '#FFFDE1',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cell === 'g' && (
                  <div
                    style={{
                      width: cellSize * 0.78, height: cellSize * 0.78,
                      borderRadius: '50%',
                      background: '#88BD70',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                    }}
                  >
                    <div
                      style={{
                        width: '68%', height: '68%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 35% 28%, #E8F5D8 0%, #D5ECBA 8%, #A9DB94 22%)',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.55)',
                      }}
                    />
                  </div>
                )}
                {cell === 'p' && (
                  <div
                    style={{
                      width: cellSize * 0.78, height: cellSize * 0.78,
                      borderRadius: '50%',
                      background: '#E89BC8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                    }}
                  >
                    <div
                      style={{
                        width: '68%', height: '68%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 35% 28%, #FFF0F4 0%, #FFE0E5 8%, #FFC2E8 22%)',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.55)',
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface ModeCardProps {
  mode: ModeKey
  onSelect: () => void
}

function ModeCard({ mode, onSelect }: ModeCardProps) {
  const isClassic = mode === 'classic'

  return (
    <button
      onClick={onSelect}
      className="
        group relative w-full
        bg-sage-300 hover:bg-sage-400
        rounded-card shadow-card hover:shadow-card-md
        overflow-hidden
        transition-colors duration-200
        text-left
      "
      style={{ minHeight: 210 }}
    >
      {/* Classic: large board preview filling most of the card width */}
      {isClassic && (
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <MiniBoardPreview cellSize={44} />
        </div>
      )}

      {mode === 'learning' && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <img
            src="/canva/red-flag.png"
            alt=""
            className="h-28 w-28 object-contain opacity-95 transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      )}

      {mode === 'fog' && (
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-8 opacity-90">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className={
                i === 5 || i === 6 || i === 9
                  ? 'rounded-md bg-cream-100'
                  : 'rounded-md bg-brown-900/20'
              }
            />
          ))}
        </div>
      )}

      {mode === 'code' && (
        <div className="absolute inset-0 flex items-center justify-center p-7">
          <div className="w-full rounded-xl bg-zinc-950 p-4 shadow-card-sm">
            <div className="mb-3 flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="h-2 w-2 rounded-full bg-sage-400" />
            </div>
            <div className="space-y-2 font-mono text-[10px]">
              <p className="text-cyan-300">board<span className="text-pink-400">.move</span><span className="text-zinc-500">(</span><span className="text-white">"A3"</span><span className="text-zinc-500">, </span><span className="text-white">"B4"</span><span className="text-zinc-500">)</span></p>
              <p className="text-zinc-600">Red to move</p>
            </div>
          </div>
        </div>
      )}

      {/* Label — overlaid bottom-right; on Classic, sits on top of pieces with cream pill */}
      <span
        className={
          isClassic
            ? 'absolute bottom-4 right-5 z-10 px-4 py-1.5 rounded-pill bg-cream-100/85 text-2xl font-extrabold text-brown-900 select-none shadow-card-sm backdrop-blur-sm'
            : 'absolute bottom-5 right-6 text-3xl font-extrabold text-brown-900 select-none'
        }
      >
        {MODE_LABEL[mode]}
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function ModeSelector({ onSelect }: { onSelect: (m: ModeKey) => void }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <ModeCard mode="classic"  onSelect={() => onSelect('classic')}  />
      <ModeCard mode="learning" onSelect={() => onSelect('learning')} />
      <ModeCard mode="fog"      onSelect={() => onSelect('fog')}      />
      <ModeCard mode="code"     onSelect={() => onSelect('code')}     />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function PlayTypeSelector({
  mode,
  onBack,
}: {
  mode: ModeKey
  onBack: () => void
}) {
  const options = PLAY_TYPES[mode]

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-brown-700 hover:text-brown-900 mb-6 font-bold transition-colors"
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
        Back to modes
      </button>

      <h1 className="text-4xl font-extrabold text-brown-900 mb-2">
        {MODE_LABEL[mode]}
      </h1>
      <p className="text-brown-700 font-medium mb-10">Play with:</p>

      <div className="flex flex-col gap-4 max-w-md mx-auto">
        {options.map(opt => (
          <Link
            key={opt.label}
            href={opt.href}
            className="
              block w-full
              bg-sage-300 hover:bg-sage-400
              rounded-card py-5
              text-center text-2xl font-extrabold text-brown-900
              shadow-card transition-colors
            "
          >
            {opt.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function GamePage() {
  const [selectedMode, setSelectedMode] = useState<ModeKey | null>(null)

  return (
    <main className="bg-cream-200 min-h-screen py-10 px-6">
      <div className="max-w-page mx-auto">
        {selectedMode === null ? (
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-4xl font-extrabold text-brown-900">Choose a game mode</h1>
              <p className="mt-2 text-sm font-medium text-brown-700">Pick a board, then choose who to play with.</p>
            </div>
            <ModeSelector onSelect={setSelectedMode} />
          </div>
        ) : (
          <PlayTypeSelector mode={selectedMode} onBack={() => setSelectedMode(null)} />
        )}
      </div>
    </main>
  )
}
