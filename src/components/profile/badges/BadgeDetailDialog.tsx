import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SocialBadgeCatalogItem } from '@/services/socialProfile'
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

export const BadgeDetailDialog = ({ badge, open, onOpenChange }: BadgeDetailDialogProps) => {
  if (!badge) return null

  const showHidden = badge.hidden && !badge.earned
  const title = showHidden ? 'نشان مخفی' : badge.display_title

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-border/60 bg-card">
        <DialogHeader className="items-center text-center">
          <BadgeVisual
            earned={badge.earned}
            hidden={badge.hidden}
            imageUrl={badge.image_url}
            title={badge.title}
            size="lg"
            className="mb-2"
          />
          {showHidden && badge.hint ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{badge.hint}</p>
          ) : null}
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <p className="text-xs text-primary-300/90">
            {BADGE_RARITY_LABEL[badge.rarity] ?? badge.rarity}
          </p>
          <DialogDescription className="text-sm leading-relaxed text-foreground/85">
            {badge.earned ? badge.description : showHidden ? badge.description : badge.description}
          </DialogDescription>
        </DialogHeader>
        {!badge.earned && badge.progress.target > 0 ? (
          <div className="space-y-2 pt-2">
            <BadgeProgressBar
              current={badge.progress.current}
              target={badge.progress.target}
              earned={false}
              className="h-1.5"
            />
            <p className="text-center text-xs text-muted-foreground">
              {formatBadgeProgress(badge.progress.current, badge.progress.target)}
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
