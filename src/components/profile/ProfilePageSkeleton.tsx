/** Shared loading shell for /profile, /u/:id, /translators/:slug resolve. */
export const ProfilePageSkeleton = () => (
  <div className="animate-pulse pb-24">
    <div className="relative h-44">
      <div className="absolute inset-x-0 top-0 h-full bg-muted/60" />
      <div className="relative z-10 flex flex-col items-center pt-24">
        <div className="media-card-skeuo h-24 w-24 rounded-2xl">
          <div className="media-card-skeuo-face bg-muted" />
        </div>
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
