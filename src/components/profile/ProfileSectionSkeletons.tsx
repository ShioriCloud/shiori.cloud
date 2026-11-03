import { cn } from '@/lib/utils'
import {
  profileHighlightGlowClass,
  profileHighlightSectionClass,
} from '@/components/profile/profileHighlightCard'

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
  <div className={cn('mx-4 mt-2', className)} aria-hidden>
    <section className={profileHighlightSectionClass('primary')}>
      <div className={profileHighlightGlowClass('left', 'primary')} />
      <div className={profileHighlightGlowClass('right', 'sky')} />
      <div className="relative flex items-stretch px-1 py-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center gap-2 px-1 py-1',
              i < 2 && 'border-e border-border/45'
            )}
          >
            <Pulse className="h-4 w-8" />
            <Pulse className="h-2.5 w-12" />
          </div>
        ))}
      </div>
    </section>
  </div>
)

export const ProfileFollowButtonSkeleton = ({ className }: { className?: string }) => (
  <Pulse className={cn('mx-4 h-11 w-auto rounded-xl', className)} aria-hidden />
)

export const ProfileOverviewStripSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('mx-4 mt-5', className)} aria-hidden>
    <section className={profileHighlightSectionClass('primary')}>
      <div className={profileHighlightGlowClass('left', 'primary')} />
      <div className={cn(profileHighlightGlowClass('right', 'primary'), 'bottom-0 top-auto')} />
      <div className="relative space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Pulse className="h-8 w-8 rounded-xl" />
          <Pulse className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-4">
          <Pulse className="h-[5.5rem] w-[5.5rem] shrink-0 rounded-full" />
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Pulse key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </section>
  </div>
)
