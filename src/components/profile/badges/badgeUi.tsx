import type { SocialBadgeCatalogItem } from '@/services/socialProfile'
import { BADGE_ART_DROP_SHADOW, badgeImageSrc } from '@/lib/badgeArt'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'

export const BADGE_RARITY_LABEL: Record<string, string> = {
  common: 'معمولی',
  rare: 'کمیاب',
  epic: 'حماسی',
  legendary: 'افسانه‌ای',
}

export const BADGE_RARITY_TEXT_CLASS: Record<string, string> = {
  common: 'text-slate-400',
  rare: 'text-sky-400',
  epic: 'text-violet-400',
  legendary: 'text-amber-400',
}

export const BadgeRarityLabel = ({
  rarity,
  className,
}: {
  rarity: string
  className?: string
}) => (
  <span
    className={cn(
      'font-medium',
      BADGE_RARITY_TEXT_CLASS[rarity] ?? BADGE_RARITY_TEXT_CLASS.common,
      className
    )}
  >
    {BADGE_RARITY_LABEL[rarity] ?? rarity}
  </span>
)

export const formatBadgeProgress = (current: number, target: number): string => {
  if (target <= 0) return ''
  return `${toPersianDigits(current)} از ${toPersianDigits(target)}`
}

export const badgeProgressPercent = (current: number, target: number): number => {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

type BadgeVisualProps = {
  earned: boolean
  hidden?: boolean
  imageUrl?: string | null
  title?: string
  rarity?: string
  size?: 'sm' | 'md' | 'lg' | 'profile' | 'showcase'
  className?: string
}

const sizeClass = {
  sm: 'h-16 w-16 text-lg',
  profile: 'h-[5.25rem] w-[5.25rem] text-2xl',
  showcase: 'h-[6.25rem] w-[6.25rem] text-2xl',
  md: 'h-[5rem] w-[5rem] text-2xl',
  lg: 'h-32 w-32 text-4xl',
}

const compactArtSizes = new Set(['sm', 'md', 'profile', 'showcase'])

/**
 * Earned: transparent cutout art. Locked: empty circle; «?» only for hidden badges.
 */
export const BadgeVisual = ({
  earned,
  hidden,
  imageUrl,
  title,
  rarity = 'common',
  size = 'md',
  className,
}: BadgeVisualProps) => {
  const showHidden = hidden && !earned
  const artSize = compactArtSizes.has(size) ? 'sm' : 'lg'
  const src = badgeImageSrc(imageUrl, artSize === 'lg' ? 'lg' : 'sm')
  const hasArt = earned && Boolean(src)
  const glow =
    BADGE_ART_DROP_SHADOW[rarity] ?? BADGE_ART_DROP_SHADOW.common

  if (hasArt) {
    return (
      <div
        className={cn(
          'relative mx-auto flex shrink-0 items-center justify-center',
          sizeClass[size],
          className
        )}
        aria-hidden={false}
      >
        <img
          src={src!}
          alt=""
          decoding="async"
          className={cn('h-full w-full object-contain', glow)}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative mx-auto flex shrink-0 items-center justify-center rounded-full border-2 border-dashed',
        earned
          ? 'border-primary-400/35 bg-primary-500/10'
          : 'border-border/55 bg-muted/20',
        sizeClass[size],
        className
      )}
      aria-hidden={!earned && !showHidden}
    >
      {showHidden ? (
        <span className="font-bold text-muted-foreground">؟</span>
      ) : earned ? (
        <span className="font-bold text-primary-200/90">
          {(title ?? '?').trim().charAt(0) || '★'}
        </span>
      ) : null}
    </div>
  )
}

export const BadgeProgressBar = ({
  current,
  target,
  earned,
  className,
}: {
  current: number
  target: number
  earned?: boolean
  className?: string
}) => {
  const pct = earned ? 100 : badgeProgressPercent(current, target)
  return (
    <div
      className={cn('h-1 w-full overflow-hidden rounded-full bg-muted/60', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all',
          earned ? 'bg-primary-400' : 'bg-foreground/70'
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export type BadgeCardModel = Pick<
  SocialBadgeCatalogItem,
  | 'id'
  | 'display_title'
  | 'title'
  | 'earned'
  | 'hidden'
  | 'hint'
  | 'unlock_hint'
  | 'progress'
  | 'image_url'
  | 'is_new'
  | 'rarity'
>
