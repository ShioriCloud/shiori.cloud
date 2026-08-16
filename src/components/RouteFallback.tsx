/** In-layout placeholder while a lazy route chunk loads — never the boot splash. */
export const RouteFallback = () => (
  <div
    className="relative min-h-[50vh] bg-background px-4 pb-24 pt-4"
    aria-busy="true"
    aria-live="polite"
  >
    <div
      className="mb-5 h-0.5 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-label="در حال بارگذاری"
    >
      <div className="explore-fetch-bar h-full w-1/3 rounded-full bg-primary-500" />
    </div>

    <div className="animate-pulse space-y-4">
      <div className="h-40 rounded-2xl bg-muted/80" />
      <div className="space-y-2">
        <div className="ms-auto h-4 w-2/3 rounded-md bg-muted" />
        <div className="ms-auto h-3 w-1/2 rounded-md bg-muted/70" />
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="aspect-[2/3] rounded-xl bg-muted/80" />
        <div className="aspect-[2/3] rounded-xl bg-muted/80" />
        <div className="aspect-[2/3] rounded-xl bg-muted/80" />
      </div>
    </div>
  </div>
)
