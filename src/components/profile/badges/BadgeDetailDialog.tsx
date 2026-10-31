import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SocialBadgeCatalogItem, SocialBadgeRarity } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import {
  BADGE_RARITY_LABEL,
  BadgeProgressBar,
  BadgeVisual,
  formatBadgeProgress,
} from './badgeUi'

type BadgeDetailDialogProps = {
  badge: SocialBadgeCatalogItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const rarityShell: Record<string, string> = {
  legendary:
    'from-amber-400/25 via-card to-orange-500/10 border-amber-400/35',
  epic: 'from-violet-400/25 via-card to-fuchsia-500/10 border-violet-400/35',
  rare: 'from-sky-400/25 via-card to-cyan-500/10 border-sky-400/35',
  common: 'from-primary-400/15 via-card to-amber-400/8 border-border/60',
}

const rarityGlow: Record<string, string> = {
  legendary: 'bg-amber-400/35',
  epic: 'bg-violet-400/30',
  rare: 'bg-sky-400/30',
  common: 'bg-primary-400/25',
}

export type BadgeDetailViewModel = {
  title: string
  description: string
  rarity?: SocialBadgeRarity | string
  image_url?: string | null
  earned: boolean
  hidden?: boolean
  hint?: string | null
  unlock_hint?: string | null
  earned_at?: string | null
  progress?: { current: number; target: number }
  progress_parts?: Array<{
    label: string
    current: number
    target: number
    complete: boolean
  }>
}

export const BadgeDetailBody = ({ badge }: { badge: BadgeDetailViewModel }) => {
  const showHidden = Boolean(badge.hidden && !badge.earned)
  const title = showHidden ? 'نشان مخفی' : badge.title
  const rarity = badge.rarity ?? 'common'
  const unlockHint = badge.unlock_hint?.trim() || null

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5',
        rarityShell[rarity] ?? rarityShell.common
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full blur-3xl',
          rarityGlow[rarity] ?? rarityGlow.common
        )}
        aria-hidden
      />

      <DialogHeader className="relative items-center space-y-2 text-center">
        <div className="relative mb-1">
          <BadgeVisual
            earned={badge.earned}
            hidden={badge.hidden}
            imageUrl={badge.image_url}
            title={badge.title}
            rarity={rarity}
            size="lg"
          />
        </div>

        {showHidden && badge.hint ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{badge.hint}</p>
        ) : null}

        <DialogTitle className="text-lg leading-snug">{title}</DialogTitle>

        <span
          className={cn(
            'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
            rarity === 'legendary' &&
              'border-amber-400/40 bg-amber-400/15 text-amber-800 dark:text-amber-200',
            rarity === 'epic' &&
              'border-violet-400/40 bg-violet-400/15 text-violet-800 dark:text-violet-200',
            rarity === 'rare' &&
              'border-sky-400/40 bg-sky-400/15 text-sky-800 dark:text-sky-200',
            (!rarity || rarity === 'common') &&
              'border-border/60 bg-muted/40 text-muted-foreground'
          )}
        >
          {BADGE_RARITY_LABEL[rarity] ?? rarity}
        </span>

        <DialogDescription className="text-sm leading-relaxed text-foreground/90">
          {badge.description}
        </DialogDescription>
      </DialogHeader>

      {unlockHint ? (
        <div className="relative mt-4 rounded-xl border border-border/50 bg-background/55 px-3.5 py-3 text-center">
          <p className="text-[11px] font-semibold text-primary-400">نحوه دریافت</p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/85">{unlockHint}</p>
        </div>
      ) : null}

      {badge.earned && badge.earned_at ? (
        <p className="relative mt-3 text-center text-xs text-muted-foreground">
          دریافت:{' '}
          {new Date(badge.earned_at).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      ) : null}

      {!badge.earned && !showHidden && (badge.progress_parts?.length ?? 0) > 0 ? (
        <div className="relative mt-4 space-y-3">
          {badge.progress_parts!.map((part) => (
            <div key={part.label} className="space-y-1">
              <p className="text-xs text-muted-foreground">{part.label}</p>
              <BadgeProgressBar
                current={part.current}
                target={part.target}
                earned={part.complete}
                className="h-1.5"
              />
              <p className="text-center text-[11px] text-muted-foreground">
                {formatBadgeProgress(part.current, part.target)}
              </p>
            </div>
          ))}
        </div>
      ) : !badge.earned && !showHidden && (badge.progress?.target ?? 0) > 0 ? (
        <div className="relative mt-4 space-y-2">
          <BadgeProgressBar
            current={badge.progress!.current}
            target={badge.progress!.target}
            earned={false}
            className="h-1.5"
          />
          <p className="text-center text-xs text-muted-foreground">
            {formatBadgeProgress(badge.progress!.current, badge.progress!.target)}
          </p>
        </div>
      ) : null}
    </div>
  )
}

export const BadgeDetailDialog = ({ badge, open, onOpenChange }: BadgeDetailDialogProps) => {
  if (!badge) return null

  const view: BadgeDetailViewModel = {
    title: badge.display_title,
    description: badge.description,
    rarity: badge.rarity,
    image_url: badge.image_url,
    earned: badge.earned,
    hidden: badge.hidden,
    hint: badge.hint,
    unlock_hint: badge.unlock_hint,
    earned_at: badge.earned_at,
    progress: badge.progress,
    progress_parts: badge.progress_parts,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-0 bg-transparent p-0 shadow-none sm:rounded-2xl">
        <BadgeDetailBody badge={view} />
      </DialogContent>
    </Dialog>
  )
}
