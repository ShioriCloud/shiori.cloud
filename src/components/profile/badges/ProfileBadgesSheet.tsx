import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { RouteFallback } from '@/components/RouteFallback'
import { useSocialBadgeCatalogUser } from '@/hooks/useSocialProfile'
import type { SocialBadgePublicList } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import { BadgeVisual } from './badgeUi'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ProfileBadgesSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  telegramUserId: string
  displayName: string
}

type PublicBadge = SocialBadgePublicList['badges'][number]

export const ProfileBadgesSheet = ({
  open,
  onOpenChange,
  telegramUserId,
  displayName,
}: ProfileBadgesSheetProps) => {
  const { data, isLoading } = useSocialBadgeCatalogUser(telegramUserId, open)
  const [detail, setDetail] = useState<PublicBadge | null>(null)

  const earned = data?.earned_count ?? 0
  const total = data?.total_count ?? 0
  const badges = data?.badges ?? []

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] rounded-t-3xl border-border/60 bg-background px-4 pb-8 pt-3"
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
          <SheetHeader className="mb-4 flex-row items-center justify-between space-y-0 text-right">
            <SheetTitle className="text-base font-semibold">
              نشان‌های {displayName}
            </SheetTitle>
            <span className="text-sm font-medium text-primary-400">
              {toPersianDigits(earned)} از {toPersianDigits(total)}
            </span>
          </SheetHeader>

          {isLoading ? (
            <RouteFallback />
          ) : badges.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              هنوز نشانی ثبت نشده یا خصوصی است.
            </p>
          ) : (
            <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto pb-4">
              {badges.map((badge) => (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => setDetail(badge)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card/80 p-2',
                    'active:scale-[0.98] transition-transform text-center'
                  )}
                >
                  <div className="relative w-full">
                    <BadgeVisual
                      earned
                      imageUrl={badge.image_url}
                      title={badge.title}
                      size="sm"
                    />
                    {badge.is_new ? (
                      <span
                        className="absolute -right-0.5 -top-0.5 rounded-md bg-pink-500/90 px-1 py-0.5 text-[9px] font-bold text-white"
                      >
                        جدید
                      </span>
                    ) : null}
                  </div>
                  <span className="line-clamp-2 text-[11px] font-medium leading-tight text-foreground">
                    {badge.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={detail != null} onOpenChange={(v) => !v && setDetail(null)}>
        {detail ? (
          <DialogContent className="max-w-sm border-border/60 bg-card">
            <DialogHeader className="items-center text-center">
              <BadgeVisual
                earned
                imageUrl={detail.image_url}
                title={detail.title}
                size="lg"
                className="mb-2"
              />
              <DialogTitle>{detail.title}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-foreground/85">
                {detail.description}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  )
}
