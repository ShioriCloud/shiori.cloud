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

/** Skeuo frame + glow for each badge on profile showcase. */
export const profileBadgeShowcaseOuterClass =
  'media-card-skeuo rounded-xl active:scale-95 transition-transform shrink-0'

export const profileBadgeShowcaseFaceClass = (rarity?: string) =>
  cn(
    'media-card-skeuo-face relative flex h-16 w-16 items-center justify-center bg-muted/20',
    'before:pointer-events-none before:absolute before:inset-2 before:-z-10 before:rounded-full before:blur-xl',
    rarity === 'legendary' && 'before:bg-amber-400/50',
    rarity === 'epic' && 'before:bg-violet-400/45',
    rarity === 'rare' && 'before:bg-sky-400/40',
    (!rarity || rarity === 'common') && 'before:bg-amber-300/35'
  )
