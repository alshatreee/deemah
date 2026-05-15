import { conditionMeta } from '@/lib/constants/conditions'
import { cn } from '@/lib/utils'

interface ConditionBadgeProps {
  condition: string | null | undefined
  size?: 'sm' | 'md'
  className?: string
}

const TONES = {
  success: 'bg-emerald-500/90 text-white',
  info: 'bg-blue-500/90 text-white',
  neutral: 'bg-slate-500/90 text-white',
} as const

export function ConditionBadge({ condition, size = 'sm', className }: ConditionBadgeProps) {
  const meta = conditionMeta(condition)
  if (!meta) return null
  const tone = TONES[meta.tone as keyof typeof TONES] ?? TONES.neutral
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        tone,
        className,
      )}
    >
      {meta.label}
    </span>
  )
}
