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
    { label: 'Start tutorial', href: '/play/learn' },
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8">
          {(['Easy', 'Normal', 'Hard'] as const).map((level, i) => {
            const widths  = ['55%', '75%', '95%']
            const colors  = ['#A9DB94', '#F5C842', '#E87A6A']
            const borders = ['#88BD70', '#C9A830', '#C45A50']
            return (
              <div key={level} className="w-full flex items-center gap-3">
                <span
                  className="text-[11px] font-extrabold w-12 shrink-0"
                  style={{ color: '#5A4030' }}
                >
                  {level}
                </span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: 14, background: 'rgba(0,0,0,0.08)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: widths[i],
                      background: colors[i],
                      border: `1.5px solid ${borders[i]}`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {mode === 'fog' && (() => {
        const cs = 30
        // board: 4 rows × 8 cols; rows 0–1 = fog, rows 2–3 = visible with pieces
        const pieces: Record<string, 'p' | 'g'> = {
          '2-1': 'g', '2-3': 'g', '2-5': 'g', '2-7': 'g',
          '3-0': 'p', '3-2': 'p', '3-4': 'p', '3-6': 'p',
        }
        return (
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.18)' }}>
              {[0, 1, 2, 3].map(r => (
                <div key={r} className="flex">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(c => {
                    const isDark = (r + c) % 2 === 1
                    const fog = r < 2
                    const piece = pieces[`${r}-${c}`]
                    return (
                      <div
                        key={c}
                        style={{
                          width: cs, height: cs, flexShrink: 0,
                          background: fog
                            ? (isDark ? '#2A2828' : '#3A3838')
                            : (isDark ? '#424040' : '#FFFDE1'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {!fog && piece === 'g' && (
                          <div style={{ width: cs * 0.75, height: cs * 0.75, borderRadius: '50%', background: '#88BD70', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '65%', height: '65%', borderRadius: '50%', background: 'radial-gradient(circle at 35% 28%, #E8F5D8, #A9DB94)' }} />
                          </div>
                        )}
                        {!fog && piece === 'p' && (
                          <div style={{ width: cs * 0.75, height: cs * 0.75, borderRadius: '50%', background: '#E89BC8', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '65%', height: '65%', borderRadius: '50%', background: 'radial-gradient(circle at 35% 28%, #FFF0F4, #FFC2E8)' }} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {mode === 'code' && (
        <div className="absolute inset-0 flex items-center justify-center p-7">
          <div className="w-full rounded-xl bg-zinc-950 p-4 shadow-card-sm">
            <div className="mb-3 flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="h-2 w-2 rounded-full bg-sage-400" />
            </div>
            <div className="space-y-2 font-mono text-[10px]">
              <p><span className="text-cyan-300">board</span><span className="text-pink-400">.move</span><span className="text-zinc-500">(</span><span className="text-amber-200">"A3"</span><span className="text-zinc-500">, </span><span className="text-amber-200">"B4"</span><span className="text-zinc-500">)</span></p>
              <p><span className="text-emerald-400">✓</span><span className="text-zinc-400"> Moved A3 → B4</span></p>
              <p className="text-zinc-600">Black to move_</p>
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
  const [color, setColor] = useState<'red' | 'black'>('red')

  function hrefFor(baseHref: string) {
    if (baseHref.includes('/multiplayer')) return baseHref
    return `${baseHref}?color=${color}`
  }

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

      {mode !== 'learning' && (
        <>
          <p className="text-brown-700 font-medium mb-6">Play with:</p>
          <div className="mb-8 inline-flex rounded-pill bg-sage-200 p-1 shadow-card-sm">
            {(['red', 'black'] as const).map(player => (
              <button
                key={player}
                onClick={() => setColor(player)}
                className={[
                  'rounded-pill px-4 py-2 text-xs font-extrabold transition-colors',
                  color === player
                    ? 'bg-sage-400 text-brown-900 shadow-button'
                    : 'text-brown-700 hover:bg-sage-300',
                ].join(' ')}
              >
                {player === 'red' ? 'Red' : 'Black'}
              </button>
            ))}
          </div>
        </>
      )}

      {mode === 'learning' && (
        <p className="text-brown-700 font-medium mb-8">
          Learn the rules step-by-step through 4 interactive lessons.
        </p>
      )}

      <div className="flex flex-col gap-4 max-w-md mx-auto">
        {options.map(opt => (
          <Link
            key={opt.label}
            href={hrefFor(opt.href)}
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
