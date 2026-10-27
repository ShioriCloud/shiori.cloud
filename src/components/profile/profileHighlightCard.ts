import { cn } from '@/lib/utils'

const profileHighlightElevation = cn(
  'border-border/65 bg-card/40',
  'shadow-[0_2px_14px_-6px_rgba(0,0,0,0.14),inset_0_1px_0_0_rgba(255,255,255,0.07)]',
  'dark:border-border/55 dark:bg-card/25 dark:shadow-[0_2px_16px_-6px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.05)]'
)

/** Shared shell for profile highlight cards (stats, badges, translations). */
export const profileHighlightSectionClass = (accent?: 'primary' | 'amber' | 'sky') =>
  cn(
    'relative overflow-hidden rounded-2xl border',
    profileHighlightElevation,
    accent === 'amber' &&
      'bg-gradient-to-br from-amber-400/[0.12] via-background to-primary-400/[0.06]',
    accent === 'sky' &&
      'bg-gradient-to-br from-sky-400/[0.10] via-background to-primary-400/[0.08]',
    (!accent || accent === 'primary') &&
      'bg-gradient-to-br from-primary-400/[0.08] via-background to-sky-400/[0.06]'
  )

export const profileHighlightGlowClass = (
  position: 'left' | 'right',
  color: 'primary' | 'amber' | 'sky'
) =>
  cn(
    'pointer-events-none absolute rounded-full blur-3xl',
    position === 'left' && '-left-8 top-0 h-28 w-28',
    position === 'right' && '-right-10 top-0 h-32 w-32',
    color === 'primary' && 'bg-primary-400/15',
    color === 'amber' && 'bg-amber-400/15',
    color === 'sky' && 'bg-sky-400/15'
  )

/** Elevated slot behind each showcase badge on profile. */
export const profileBadgeShowcaseSlotClass = (rarity?: string) =>
  cn(
    'relative rounded-2xl border p-2',
    'border-border/70 bg-card/90',
    'shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_3px_10px_-4px_rgba(0,0,0,0.2)]',
    'dark:border-border/60 dark:bg-muted/50',
    'before:pointer-events-none before:absolute before:inset-1 before:-z-10 before:rounded-full before:blur-2xl',
    rarity === 'legendary' && 'before:bg-amber-400/55 shadow-[0_0_28px_-6px_rgba(251,191,36,0.55)]',
    rarity === 'epic' && 'before:bg-violet-400/50 shadow-[0_0_26px_-6px_rgba(139,92,246,0.45)]',
    rarity === 'rare' && 'before:bg-sky-400/45 shadow-[0_0_24px_-6px_rgba(56,189,248,0.4)]',
    (!rarity || rarity === 'common') &&
      'before:bg-amber-300/40 shadow-[0_0_22px_-6px_rgba(251,191,36,0.38)]'
  )
