'use client'

import { cn } from '@/lib/utils'
import { COLORS } from '@/lib/constants/colors'
import { Check } from 'lucide-react'

interface ColorSwatchProps {
  selected: string[]
  onToggle: (id: string) => void
  size?: 'sm' | 'md'
}

export function ColorSwatchGrid({ selected, onToggle, size = 'md' }: ColorSwatchProps) {
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'
  return (
    <div className="grid grid-cols-6 gap-2 pt-2">
      {COLORS.map((c) => {
        const isSel = selected.includes(c.id)
        const isWhite = c.id === 'white'
        const isMulti = c.id === 'multi'
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onToggle(c.id)}
            title={c.label}
            aria-label={c.label}
            aria-pressed={isSel}
            className={cn(
              dim,
              'rounded-full border-2 transition-all flex items-center justify-center',
              isSel
                ? 'border-primary ring-2 ring-primary/40 ring-offset-2'
                : 'border-border hover:scale-110',
              isWhite && 'shadow-inner',
            )}
            style={
              isMulti
                ? { backgroundImage: c.hex }
                : { backgroundColor: c.hex }
            }
          >
            {isSel && (
              <Check
                className={cn(
                  'h-4 w-4',
                  ['black', 'navy', 'burgundy', 'brown', 'purple', 'green', 'blue'].includes(c.id)
                    ? 'text-white'
                    : 'text-foreground',
                )}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
