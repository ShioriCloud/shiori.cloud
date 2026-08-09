import logo from '@/assets/images/shiori-logo.svg'
import { cn } from '@/lib/utils'

/** Branded boot / gate loading — fixed to the viewport so it never scrolls away. */
export const BrandBootScreen = ({ className }: { className?: string } = {}) => (
  <div
    className={cn(
      'fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background px-6',
      className
    )}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
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
