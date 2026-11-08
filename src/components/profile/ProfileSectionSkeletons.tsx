import { cn } from '@/lib/utils'
import {
  profileHighlightGlowClass,
  profileHighlightSectionClass,
} from '@/components/profile/profileHighlightCard'
import { profileStatsCardClass } from '@/components/profile/profileStatsCard'

const Pulse = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-md bg-muted/70', className)} />
)

/** Reserved height for the 4-slot badge showcase grid (aura + face). */
export const PROFILE_BADGES_SHOWCASE_GRID_MIN_H = 'min-h-[5rem]'

/** Reserved height for the translations poster rail. */
export const PROFILE_TRANSLATIONS_RAIL_MIN_H = 'min-h-[10.5rem]'

export const ProfileBadgesShowcaseSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('mx-4 mt-3', className)} aria-hidden>
    <section className={profileHighlightSectionClass('amber')}>
      <div className={profileHighlightGlowClass('right', 'amber')} />
      <div className={cn(profileHighlightGlowClass('left', 'primary'), 'bottom-0 top-auto')} />
      <div className="relative px-4 py-4">
        <div className="flex items-start gap-2.5">
          <Pulse className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <Pulse className="h-4 w-24" />
            <Pulse className="h-3 w-40" />
          </div>
          <Pulse className="mt-1 h-3 w-10 shrink-0" />
        </div>
        <div
          className={cn(
            'mt-3 grid grid-cols-4 gap-2 px-0',
            PROFILE_BADGES_SHOWCASE_GRID_MIN_H
          )}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Pulse key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  </div>
)

export const ProfileTranslationsRailSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('mx-4 mt-3', className)} aria-hidden>
    <section className={profileHighlightSectionClass('sky')}>
      <div className={profileHighlightGlowClass('right', 'sky')} />
      <div className={cn(profileHighlightGlowClass('left', 'primary'), 'bottom-0 top-auto')} />
      <div className="relative px-3.5 pt-3.5 pb-2.5">
        <div className="flex items-start gap-2.5">
          <Pulse className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <Pulse className="h-4 w-28" />
            <Pulse className="h-3 w-44" />
          </div>
          <Pulse className="mt-1 h-3 w-10 shrink-0" />
        </div>
      </div>
      <div className={cn('relative flex gap-2.5 overflow-hidden px-3.5 pb-3.5', PROFILE_TRANSLATIONS_RAIL_MIN_H)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-[100px] shrink-0 space-y-2">
            <Pulse className="aspect-[2/3] w-full rounded-xl" />
            <Pulse className="h-3 w-16" />
          </div>
        ))}
      </div>
    </section>
  </div>
)

export const ProfileAnimeRailSkeleton = ({
  className,
  titleClassName = 'w-44',
}: {
  className?: string
  titleClassName?: string
}) => (
  <div className={cn('mt-6', className)} aria-hidden>
    <Pulse className={cn('mb-3 mr-4 h-4', titleClassName)} />
    <div className="flex gap-2.5 overflow-hidden px-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-[100px] shrink-0 space-y-2">
          <Pulse className="aspect-[2/3] w-full rounded-xl" />
          <Pulse className="h-3 w-16" />
        </div>
      ))}
    </div>
  </div>
)

export const ProfileFavoritesGridSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('mt-6 px-4', className)} aria-hidden>
    <Pulse className="mb-3 h-4 w-28" />
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Pulse key={i} className="aspect-[2/3] w-full rounded-xl" />
      ))}
    </div>
  </div>
)

export const ProfileSocialStatsRowSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('mx-4 mt-3 flex gap-2', className)} dir="rtl" aria-hidden>
    {Array.from({ length: 3 }).map((_, i) => (
      <section key={i} className={cn(profileHighlightSectionClass('primary'), 'flex-1')}>
        <div className={profileHighlightGlowClass('left', 'primary')} />
        <div className={cn(profileHighlightGlowClass('right', 'sky'), 'opacity-60')} />
        <div className="relative flex flex-col items-center gap-2 px-2 py-3.5">
          <Pulse className="h-5 w-10" />
          <Pulse className="h-2.5 w-14" />
        </div>
      </section>
    ))}
  </div>
)

export const ProfileFollowButtonSkeleton = ({ className }: { className?: string }) => (
  <Pulse className={cn('mx-4 h-11 w-auto rounded-xl', className)} aria-hidden />
)

/** Sticky tab strip placeholder while profile shell data is not ready. */
export const ProfileTabBarSkeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'mx-4 mt-5 rounded-xl border border-border/40 bg-card/40 px-2 py-2.5',
      className
    )}
    aria-hidden
  >
    <div className="flex gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Pulse key={i} className="h-9 flex-1 rounded-lg" />
      ))}
    </div>
  </div>
)

export const ProfileOverviewStripSkeleton = ({ className }: { className?: string }) => (
  <div className={cn(profileStatsCardClass(), 'space-y-4', className)} aria-hidden>
    <div className="flex justify-end gap-2">
      <Pulse className="h-4 w-16" />
      <Pulse className="h-5 w-28" />
    </div>
    <div className="flex items-center gap-5">
      <div className="min-w-0 flex-1 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-5 w-full rounded-md" />
        ))}
      </div>
      <Pulse className="h-[8.75rem] w-[8.75rem] shrink-0 rounded-full" />
    </div>
  </div>
)
