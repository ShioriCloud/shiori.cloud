/** In-layout placeholder while a lazy route chunk loads — never the boot splash. */
export const RouteFallback = () => (
  <div
    className="flex min-h-[40vh] flex-col items-center bg-background pt-10"
    aria-busy="true"
    aria-live="polite"
  >
    <div
      className="h-0.5 w-28 overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-label="در حال بارگذاری"
    >
      <div className="explore-fetch-bar h-full w-1/3 rounded-full bg-primary-500" />
    </div>
  </div>
)
