import { ViewIcon } from 'hugeicons-react'

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

/** Compact view-count chip for poster / featured cards (top-start). */
export const AnimeViewCountBadge = ({ count }: { count?: number | null }) => {
  const n =
    typeof count === 'number' && Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0

  return (
    <span
      className="absolute top-2 start-2 z-[1] inline-flex items-center gap-0.5 rounded-md border border-white/20 bg-black/50 backdrop-blur-sm px-1 py-0.5 text-[9px] font-medium tabular-nums leading-none text-white/95"
      aria-label={`${toPersianNumber(n)} بازدید`}
    >
      <ViewIcon className="h-2.5 w-2.5 shrink-0 text-white/90" aria-hidden />
      {toPersianNumber(n)}
    </span>
  )
}
