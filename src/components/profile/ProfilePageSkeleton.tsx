import {
  ProfileBadgesShowcaseSkeleton,
} from '@/components/profile/ProfileSectionSkeletons'

/**
 * Hero-style loading shell — only for the main profile shell routes:
 * `/profile`, `/u/:id`, `/translators/:slug` (see RouteFallback + page initial load).
 * Do not use inside sheets, tabs, or subpages; use ContentLoadingSkeleton or SocialListSkeleton.
 */
export const ProfilePageSkeleton = () => (
  <div className="pb-24">
    <div className="animate-pulse">
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
      <div className="mx-4 mt-3 h-12 rounded-xl bg-muted/70" />
    </div>
    <ProfileBadgesShowcaseSkeleton className="mt-2.5" />
  </div>
)
