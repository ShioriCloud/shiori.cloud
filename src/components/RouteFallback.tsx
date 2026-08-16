/** In-layout placeholder while a lazy route chunk loads — never the boot splash. */
export const RouteFallback = () => (
  <div className="min-h-[40vh] bg-background" aria-busy="true" aria-live="polite" />
)
