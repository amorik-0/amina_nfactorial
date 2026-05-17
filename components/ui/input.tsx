import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Layout
          'flex h-10 w-full px-3 py-2',
          // Shape
          'rounded-lg border border-brown-100 bg-cream-100',
          // Typography
          'text-sm font-medium text-brown-900 placeholder:text-brown-500 placeholder:font-normal',
          // Focus
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-1 focus-visible:ring-offset-cream-200',
          // Transitions
          'transition-shadow duration-150',
          // Disabled
          'disabled:cursor-not-allowed disabled:opacity-50',
          // File input reset
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
