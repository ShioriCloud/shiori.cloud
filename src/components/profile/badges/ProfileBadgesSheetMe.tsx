import { useMemo, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { useSocialBadgeCatalogMe } from '@/hooks/useSocialProfile'
import type { SocialBadgeCatalogItem } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import { BadgeVisual } from './badgeUi'
import { BadgeDetailDialog } from './BadgeDetailDialog'

type ProfileBadgesSheetMeProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  displayName?: string
}

export const ProfileBadgesSheetMe = ({
  open,
  onOpenChange,
  displayName = 'من',
}: ProfileBadgesSheetMeProps) => {
  const { data, isLoading } = useSocialBadgeCatalogMe(open)
  const [detail, setDetail] = useState<SocialBadgeCatalogItem | null>(null)

  const earned = data?.earned_count ?? 0
  const total = data?.total_count ?? 0

  const badges = useMemo(() => {
    const list: SocialBadgeCatalogItem[] = []
    for (const cat of data?.categories ?? []) {
      for (const b of cat.badges) {
        if (b.earned) list.push(b)
      }
    }
    return list
  }, [data?.categories])

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] rounded-t-3xl border-border/60 bg-background px-4 pb-8 pt-3"
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
          <SheetHeader className="mb-4 flex-row items-center justify-between space-y-0 text-right">
            <SheetTitle className="text-base font-semibold">نشان‌های {displayName}</SheetTitle>
            <span className="text-sm font-medium text-primary-400">
              {toPersianDigits(earned)} از {toPersianDigits(total)}
            </span>
          </SheetHeader>

          {isLoading ? (
            <div className="py-4">
              <SocialListSkeleton rows={2} />
            </div>
          ) : badges.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              هنوز نشانی نگرفتی — با تماشا و فعالیت باز می‌شوند.
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
                  <BadgeVisual
                    earned
                    imageUrl={badge.image_url}
                    title={badge.title}
                    rarity={badge.rarity ?? 'common'}
                    size="sm"
                  />
                  <span className="line-clamp-2 text-[11px] font-medium leading-tight text-foreground">
                    {badge.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <BadgeDetailDialog
        badge={detail}
        open={detail != null}
        onOpenChange={(v) => !v && setDetail(null)}
      />
    </>
  )
}
