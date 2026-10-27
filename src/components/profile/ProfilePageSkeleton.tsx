/**
 * Hero-style loading shell — only for the main profile shell routes:
 * `/profile`, `/u/:id`, `/translators/:slug` (see RouteFallback + page initial load).
 * Do not use inside sheets, tabs, or subpages; use ContentLoadingSkeleton or SocialListSkeleton.
 */
export const ProfilePageSkeleton = () => (
  <div className="animate-pulse pb-24">
    <div className="flex items-center justify-between px-4 pt-3">
      <div className="h-9 w-9 rounded-lg bg-muted" />
      <div className="h-9 w-9 rounded-lg bg-muted" />
    </div>
    <div className="mt-4 flex items-start gap-3.5 px-4">
      <div className="h-20 w-20 shrink-0 rounded-xl bg-muted" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-5 w-36 rounded-md bg-muted" />
        <div className="h-3 w-24 rounded-md bg-muted/70" />
      </div>
    </div>
    <div className="mt-4 px-4">
      <div className="h-4 w-56 rounded-md bg-muted/70" />
    </div>
    <div className="mx-4 mt-6 h-10 rounded-xl bg-muted/60" />
    <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
      <div className="aspect-[2/3] rounded-xl bg-muted/50" />
      <div className="aspect-[2/3] rounded-xl bg-muted/50" />
      <div className="aspect-[2/3] rounded-xl bg-muted/50" />
    </div>
  </div>
)
