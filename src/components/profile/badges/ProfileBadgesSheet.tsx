import { useState } from 'react'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { useSocialBadgeCatalogUser } from '@/hooks/useSocialProfile'
import type { SocialBadgePublicList } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import { BadgeVisual, BadgeNewPill, badgeShowsAsNew } from './badgeUi'
import { BadgeDetailBody } from './BadgeDetailDialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'

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
          dir="rtl"
          className="max-h-[85vh] rounded-t-3xl border-border/60 bg-background px-4 pb-8 pt-3"
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
          <header className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">
              نشان‌های {displayName}
            </h2>
            <span className="shrink-0 text-sm font-medium text-primary-400 tabular-nums" dir="ltr">
              {toPersianDigits(earned)} از {toPersianDigits(total)}
            </span>
          </header>

          {isLoading ? (
            <div className="py-4">
              <SocialListSkeleton rows={2} />
            </div>
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
                    'text-center transition-transform active:scale-[0.98]'
                  )}
                >
                  <div className="relative w-full">
                    <BadgeVisual
                      earned
                      imageUrl={badge.image_url}
                      title={badge.title}
                      rarity={badge.rarity}
                      size="sm"
                    />
                    {badgeShowsAsNew(badge) ? (
                      <BadgeNewPill className="absolute -left-0.5 -top-0.5" />
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
          <DialogContent className="max-w-sm border-0 bg-transparent p-0 shadow-none sm:rounded-2xl">
            <BadgeDetailBody
              badge={{
                title: detail.title,
                description: detail.description,
                rarity: detail.rarity,
                image_url: detail.image_url,
                earned: true,
                unlock_hint: detail.unlock_hint ?? null,
                earned_at: detail.earned_at,
                is_new: detail.is_new,
              }}
            />
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  )
}
