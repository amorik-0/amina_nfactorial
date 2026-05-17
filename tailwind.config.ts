import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './store/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-nunito)', 'Nunito', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },

      // ── Brand Color Palette ────────────────────────────────────────────────
      //
      //  Sampled directly from design mockups (1.png – 5.png):
      //
      //  cream-*   page backgrounds, light surfaces
      //  sage-*    cards, tiles, buttons
      //  brown-*   text hierarchy
      //  board-*   checkerboard squares
      //  piece-*   checkers pieces (green = black player, pink = red player)
      //
      colors: {
        // Page & surface backgrounds
        cream: {
          50:  '#FFFEF5',
          100: '#FFFDE1',   // ← primary page background (Home spec)
          200: '#FFFDE1',   // ← alias, kept for legacy callers
          300: '#F2EFC0',
          400: '#E2DDA8',
        },

        // Sage green — cards, mode tiles, action buttons
        sage: {
          100: '#E4F4D0',
          200: '#C8E8A8',   // ← card / tile fill
          300: '#AEDD8E',   // ← heavier card
          400: '#A9DB94',   // ← primary CTA button (Home spec exact)
          500: '#8BCF6A',   // ← button hover / pressed
          600: '#6BB84A',   // ← strong emphasis
        },

        // Text hierarchy — warm dark brown tones
        brown: {
          900: '#3A2E0A',   // ← primary text (headings, labels)
          700: '#5C5228',   // ← secondary text (body, descriptions)
          500: '#8A7A50',   // ← muted / placeholder
          300: '#BEB090',   // ← very muted
          100: '#E8E0CC',   // ← dividers, subtle borders
        },

        // Checkerboard squares
        board: {
          dark:   '#262626',   // near-black dark squares
          light:  '#E8E3C0',   // cream light squares
          border: '#C0B898',   // board outer border
          bg:     '#F2EDD8',   // board wrapper background
        },

        // Checkers pieces
        piece: {
          green:        '#6DC96B',   // green piece base (black player)
          'green-hi':   '#A8EAA0',   // green piece highlight
          'green-dark': '#4AA847',   // green piece shadow/border
          pink:         '#E89EC0',   // pink piece base (red player)
          'pink-hi':    '#F4C0D8',   // pink piece highlight
          'pink-dark':  '#C87098',   // pink piece shadow/border
        },

        // Legacy aliases — kept so existing dark-mode components don't crash
        // during the migration. Remove once all components are updated.
        accent: '#8BCF6A',
      },

      // ── Border Radius ──────────────────────────────────────────────────────
      borderRadius: {
        none:  '0',
        sm:    '6px',
        DEFAULT: '8px',
        md:    '10px',
        lg:    '14px',
        xl:    '18px',
        '2xl': '20px',   // ← card radius
        '3xl': '28px',
        full:  '9999px', // ← pill buttons / nav active
        // Named aliases matching the design language
        card:  '20px',
        chip:  '12px',
        board: '10px',
        pill:  '9999px',
      },

      // ── Box Shadow ─────────────────────────────────────────────────────────
      boxShadow: {
        // Subtle warm shadows (use brown hue, not cold grey)
        'card-sm':  '0 1px 4px rgba(58,46,10,0.06)',
        'card':     '0 2px 12px rgba(58,46,10,0.08)',
        'card-md':  '0 4px 20px rgba(58,46,10,0.10)',
        'card-lg':  '0 8px 32px rgba(58,46,10,0.12)',
        'button':   '0 2px 8px rgba(58,46,10,0.12)',
        'board':    '0 4px 24px rgba(58,46,10,0.14)',
        // Piece 3-D sheen
        'piece':    'inset 0 2px 6px rgba(255,255,255,0.50), 0 3px 8px rgba(0,0,0,0.20)',
        'piece-sel':'inset 0 2px 6px rgba(255,255,255,0.50), 0 5px 14px rgba(0,0,0,0.28)',
        // Neon / terminal (for CodeCheckers pages — unchanged)
        'neon-cyan': '0 0 0 1.5px rgba(0,240,255,0.65), 0 0 8px rgba(0,240,255,0.40)',
        'neon-pink': '0 0 0 1.5px rgba(255,0,60,0.65),  0 0 8px rgba(255,0,60,0.40)',
        // Reset
        none: 'none',
      },

      // ── Spacing extras ─────────────────────────────────────────────────────
      maxWidth: {
        page: '900px',   // content column used on Home/Game/Tasks/Shop
      },
    },
  },
  plugins: [animate],
}

export default config
