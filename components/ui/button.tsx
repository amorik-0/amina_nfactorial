import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Button variants aligned with the design system (1.png – 5.png).
 *
 * primary   — sage-400 green pill, extrabold dark text  (CTA: Play, Start, Shop…)
 * secondary — sage-200 green pill, bold dark text       (secondary actions)
 * ghost     — transparent, subtle hover                 (nav/icon actions)
 * outline   — bordered, transparent                     (destructive/cancel)
 * danger    — red tint                                  (delete, error)
 *
 * shape:
 * pill      — fully rounded (default, matches design)
 * rounded   — standard 10px radius
 * icon      — square, equal sides
 */
const buttonVariants = cva(
  // Base — shared across all variants
  [
    'inline-flex items-center justify-center gap-2',
    'font-bold text-brown-900',
    'transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-200',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        // ── Primary CTA ────────────────────────────────────────────────────
        primary: [
          'bg-sage-400 text-brown-900',
          'shadow-button',
          'hover:bg-sage-500 active:scale-[0.97]',
        ].join(' '),

        // ── Secondary / lighter card-style button ──────────────────────────
        secondary: [
          'bg-sage-200 text-brown-900',
          'shadow-card-sm',
          'hover:bg-sage-300 active:scale-[0.97]',
        ].join(' '),

        // ── Ghost — no background ──────────────────────────────────────────
        ghost: [
          'bg-transparent text-brown-700',
          'hover:bg-sage-200/60 active:bg-sage-200',
        ].join(' '),

        // ── Outline — bordered ─────────────────────────────────────────────
        outline: [
          'bg-transparent border border-brown-100 text-brown-700',
          'hover:bg-sage-100/60 hover:border-brown-300',
        ].join(' '),

        // ── Danger ────────────────────────────────────────────────────────
        danger: [
          'bg-red-100 text-red-700 border border-red-200',
          'hover:bg-red-200 active:scale-[0.97]',
        ].join(' '),

        // ── Terminal / dark — CodeCheckers pages ───────────────────────────
        terminal: [
          'bg-emerald-600 text-black font-semibold',
          'hover:bg-emerald-500 active:scale-[0.97]',
          'shadow-[0_0_8px_rgba(16,185,129,0.35)]',
        ].join(' '),

        // ── Legacy alias (keep so existing code doesn't break) ─────────────
        default: [
          'bg-sage-400 text-brown-900',
          'shadow-button',
          'hover:bg-sage-500 active:scale-[0.97]',
        ].join(' '),
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        link: 'text-sage-600 underline-offset-4 hover:underline',
      },

      size: {
        default: 'h-10 px-5 py-2 text-sm rounded-pill',
        sm:      'h-8  px-3 py-1.5 text-xs rounded-pill',
        md:      'h-10 px-5 py-2 text-sm rounded-pill',
        lg:      'h-12 px-8 py-3 text-base rounded-pill font-extrabold',
        xl:      'h-14 px-10 py-3 text-lg rounded-pill font-extrabold',
        icon:    'h-9  w-9 rounded-full p-0',
        'icon-sm':'h-7 w-7 rounded-full p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
