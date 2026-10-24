import { cn } from '@/lib/utils'

/** Elevated section card — aligned with ProfileOverviewStrip. */
export const SOCIAL_SURFACE_CLASS = cn(
  'overflow-hidden rounded-2xl border border-border/50',
  'bg-gradient-to-br from-card via-card to-primary-400/[0.05]',
  'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'
)

export const SOCIAL_DIVIDER_CLASS = 'divide-y divide-border/40'

/** Padded inner shell for composers and comment cards. */
export const SOCIAL_INSET_SHELL_CLASS = cn(SOCIAL_SURFACE_CLASS, 'px-3.5 py-3.5')
