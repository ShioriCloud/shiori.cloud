import { cn } from '@/lib/utils'

/** Flat stats card shell — Figma v3 (آمار / بازدید و علاقه‌مندی‌ها). */
export const profileStatsCardClass = () =>
  cn(
    'rounded-2xl border border-border/70 bg-card/95 p-4',
    'dark:border-[#1e1e24] dark:bg-[#141418]'
  )

export const ProfileSampleDataTag = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'inline-flex h-5 items-center rounded-[10px] bg-amber-400/12 px-1.5',
      'text-[10.5px] font-medium leading-none text-amber-400',
      className
    )}
  >
    داده نمونه
  </span>
)
