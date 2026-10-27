/**
 * Hero-style loading shell — only for the main profile shell routes:
 * `/profile`, `/u/:id`, `/translators/:slug` (see RouteFallback + page initial load).
 * Do not use inside sheets, tabs, or subpages; use ContentLoadingSkeleton or SocialListSkeleton.
 */
export const ProfilePageSkeleton = () => (
  <div className="animate-pulse pb-24">
    <div className="relative h-44">
      <div className="absolute inset-x-0 top-0 h-full bg-muted/60" />
      <div className="relative z-10 flex flex-col items-center pt-24">
        <div className="h-[6.5rem] w-[6.5rem] rounded-full bg-muted ring-[3px] ring-background/80" />
        <div className="mt-4 h-6 w-36 rounded-md bg-muted" />
      </div>
    </div>
    <div className="mx-4 mt-6 grid grid-cols-3 gap-2">
      <div className="h-16 rounded-lg bg-muted/70" />
      <div className="h-16 rounded-lg bg-muted/70" />
      <div className="h-16 rounded-lg bg-muted/70" />
    </div>
  </div>
)
