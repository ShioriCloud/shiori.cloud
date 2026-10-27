import { cn } from '@/lib/utils'

/** Shared shell for profile highlight cards (stats, badges, translations). */
export const profileHighlightSectionClass = (accent?: 'primary' | 'amber' | 'sky') =>
  cn(
    'relative overflow-hidden rounded-2xl border border-border/50',
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
    accent === 'amber' &&
      'bg-gradient-to-br from-amber-400/[0.12] via-background to-primary-400/[0.06]',
    accent === 'sky' &&
      'bg-gradient-to-br from-sky-400/[0.10] via-background to-primary-400/[0.08]',
    (!accent || accent === 'primary') &&
      'bg-gradient-to-br from-primary-400/[0.08] via-background to-sky-400/[0.06]'
  )

export const profileHighlightGlowClass = (position: 'left' | 'right', color: 'primary' | 'amber' | 'sky') =>
  cn(
    'pointer-events-none absolute rounded-full blur-3xl',
    position === 'left' && '-left-8 top-0 h-28 w-28',
    position === 'right' && '-right-10 top-0 h-32 w-32',
    color === 'primary' && 'bg-primary-400/15',
    color === 'amber' && 'bg-amber-400/15',
    color === 'sky' && 'bg-sky-400/15'
  )
