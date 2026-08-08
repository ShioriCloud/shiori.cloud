import logo from '@/assets/images/shiori-logo.svg'

/** Full-screen branded boot / route suspense — matches app chrome, not a bare spinner. */
export const BrandBootScreen = () => (
  <div className="flex h-screen flex-col items-center justify-center gap-5 bg-background px-6">
    <img src={logo} alt="" className="h-7 w-auto max-w-[7.5rem] opacity-90" />
    <div
      className="h-1 w-28 overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-label="در حال بارگذاری"
    >
      <div className="explore-fetch-bar h-full w-1/3 rounded-full bg-primary-500" />
    </div>
  </div>
)
