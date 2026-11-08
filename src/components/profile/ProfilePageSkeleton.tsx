import { cn } from '@/lib/utils'
import {
  ProfileAnimeRailSkeleton,
  ProfileBadgesShowcaseSkeleton,
  ProfileFollowButtonSkeleton,
  ProfileSocialStatsRowSkeleton,
  ProfileTabBarSkeleton,
  ProfileTranslationsRailSkeleton,
} from '@/components/profile/ProfileSectionSkeletons'

export type ProfilePageSkeletonVariant = 'own' | 'public'

type ProfilePageSkeletonProps = {
  /** Public shells show the follow CTA placeholder under stats. */
  variant?: ProfilePageSkeletonVariant
  className?: string
}

/**
 * Progressive profile shell — hero + highlight sections + tab area.
 * Used while auth (`isReady`) or social profile is still loading on:
 * `/profile`, `/u/:id`, `/translators/:slug` (see RouteFallback + pages).
 * Do not use inside sheets, tabs, or subpages; use ContentLoadingSkeleton instead.
 */
export const ProfilePageSkeleton = ({
  variant = 'own',
  className,
}: ProfilePageSkeletonProps) => (
  <div
    className={cn('bg-background pb-24 text-foreground', className)}
    aria-busy="true"
    aria-label="در حال بارگذاری پروفایل"
  >
    <div className="animate-pulse" aria-hidden>
      <div className="relative h-36">
        <div className="absolute inset-x-0 top-0 h-full bg-muted/60" />
        <div className="relative z-10 flex flex-col items-center pt-[5.75rem]">
          <div className="media-card-skeuo h-20 w-20 rounded-2xl">
            <div className="media-card-skeuo-face bg-muted" />
          </div>
          <div className="mt-3 h-5 w-32 rounded-md bg-muted" />
          <div className="mt-2 h-3 w-24 rounded-md bg-muted/80" />
        </div>
      </div>
    </div>

    <ProfileSocialStatsRowSkeleton className="mt-0" />

    {variant === 'public' ? (
      <div className="px-4 pt-0.5">
        <ProfileFollowButtonSkeleton />
      </div>
    ) : null}

    <ProfileTranslationsRailSkeleton className="!mt-2.5" />
    <ProfileBadgesShowcaseSkeleton className="mt-2" />

    <ProfileTabBarSkeleton />
    <ProfileAnimeRailSkeleton className="mt-4" titleClassName="w-36" />
    <ProfileAnimeRailSkeleton className="mt-6" titleClassName="w-28" />
  </div>
)
