import { MyListCompactCard } from '@/components/my-list/MyListUi'
import type { SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'

type ProfileBadgesStripProps = {
  badges: SocialProfileMe['badges'] | undefined
}

export const ProfileBadgesStrip = ({ badges }: ProfileBadgesStripProps) => {
  const items = badges ?? []
  if (items.length === 0) {
    return (
      <MyListCompactCard className="flex min-h-[4.5rem] items-center justify-center px-4 py-5 text-xs text-muted-foreground">
        نشان‌ها — با تماشا و نمره‌دهی باز می‌شوند
      </MyListCompactCard>
    )
  }

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-foreground">نشان‌ها</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((badge) => (
          <span
            key={badge.id}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium',
              badge.is_new
                ? 'border-amber-400/35 bg-amber-400/10 text-amber-200'
                : 'border-border/60 bg-muted/40 text-foreground'
            )}
          >
            {badge.title}
            {badge.is_new ? (
              <span className="rounded-md bg-amber-400/25 px-1 py-0.5 text-[9px] font-bold text-amber-100">
                جدید
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  )
}
