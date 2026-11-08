import { cn } from '@/lib/utils'

/** Flat stats card shell — Figma v3 (آمار / بازدید و علاقه‌مندی‌ها). */
export const profileStatsCardClass = () =>
  cn(
    'rounded-2xl border border-border/70 bg-card/95 p-4 text-right',
    'dark:border-[#1e1e24] dark:bg-[#141418]'
  )
