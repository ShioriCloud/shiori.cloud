import { cn } from '@/lib/utils'

/**
 * Shared profile panel. Uses the theme card (lighter than the old near-black
 * fill) so labels stay readable without changing layout.
 */
export const PROFILE_PANEL_CLASS = cn(
  'border border-border/80 bg-card text-foreground',
  'shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06),0_10px_24px_-18px_rgba(0,0,0,0.55)]'
)

/** Flat stats card shell — same surface as other profile panels. */
export const profileStatsCardClass = () =>
  cn(PROFILE_PANEL_CLASS, 'min-w-0 w-full overflow-hidden rounded-2xl p-4 text-right')
