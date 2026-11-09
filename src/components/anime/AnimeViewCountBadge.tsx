import { ViewIcon } from 'hugeicons-react'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

/** Compact view-count chip for poster / featured cards (top-start). */
export const AnimeViewCountBadge = ({
  count,
  soft = false,
}: {
  count?: number | null
  /** Skip backdrop-blur for dense scrolling grids. */
  soft?: boolean
}) => {
  const n =
    typeof count === 'number' && Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0

  return (
    <span
      className={cn(
        'absolute top-2 start-2 z-[1] inline-flex items-center gap-0.5 rounded-md border border-white/20 bg-black/55 px-1 py-0.5 text-[9px] font-medium tabular-nums leading-none text-white/95',
        !soft && 'backdrop-blur-sm'
      )}
      aria-label={`${toPersianDigits(n)} بازدید`}
    >
      <ViewIcon className="h-2.5 w-2.5 shrink-0 text-white/90" aria-hidden />
      {toPersianDigits(n)}
    </span>
  )
}
