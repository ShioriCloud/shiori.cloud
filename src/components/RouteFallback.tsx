import logo from '@/assets/images/shiori-logo.svg'

/** In-layout placeholder while a lazy route chunk loads — never the boot splash. */
export const RouteFallback = () => (
  <div
    className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-background px-6"
    role="status"
    aria-busy="true"
    aria-live="polite"
  >
    <img src={logo} alt="" className="h-6 w-auto max-w-[6.5rem] opacity-80" />
    <div
      className="h-0.5 w-24 overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-label="در حال بارگذاری"
    >
      <div className="explore-fetch-bar h-full w-1/3 rounded-full bg-primary-500" />
    </div>
  </div>
)
