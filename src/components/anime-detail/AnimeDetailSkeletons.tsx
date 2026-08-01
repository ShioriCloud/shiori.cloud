import { cn } from '@/lib/utils'

export const PulseBlock = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-md bg-muted', className)} aria-hidden />
)

export const DetailSkeleton = () => (
  <div className="pb-24 animate-pulse">
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-52 bg-muted" />
      <div className="relative z-10 pt-24 px-4 pb-2 flex flex-col items-center">
        <div className="w-32 aspect-[2/3] rounded-2xl bg-muted border-4 border-background" />
        <div className="h-6 w-56 bg-muted rounded mt-4" />
        <div className="flex gap-2 mt-3">
          <div className="h-6 w-16 bg-muted rounded-md" />
          <div className="h-6 w-16 bg-muted rounded-md" />
          <div className="h-6 w-16 bg-muted rounded-md" />
        </div>
      </div>
    </div>
    <div className="mx-4 mt-5 grid grid-cols-3 gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-muted" />
      ))}
    </div>
    <div className="mx-4 mt-4 h-24 rounded-xl bg-muted" />
    <div className="mx-4 mt-5 h-10 rounded-xl bg-muted" />
    <div className="mx-4 mt-4 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-muted" />
      ))}
    </div>
  </div>
)

export const TELEGRAM_BLUE = '#229ED9'

export const StatsRowSkeleton = () => (
  <div className="mx-4 mt-5 flex items-stretch gap-2">
    <div className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-3">
      <PulseBlock className="h-5 w-5 shrink-0 rounded" />
      <PulseBlock className="h-3 w-28" />
    </div>
    <PulseBlock className="h-12 w-12 shrink-0 rounded-xl" />
  </div>
)

export const ScoreChipsSkeleton = () => (
  <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-2 py-1.5"
      >
        <PulseBlock className="w-5 h-5 rounded shrink-0" />
        <PulseBlock className="h-4 w-9" />
      </div>
    ))}
  </div>
)

export const SeriesSwitcherSkeleton = () => (
  <div className="mx-4 mt-4">
    <PulseBlock className="h-4 w-24 mb-3 mx-auto" />
    <div className="flex gap-2 overflow-hidden px-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <PulseBlock key={i} className="h-[4.5rem] w-[7rem] shrink-0 rounded-xl" />
      ))}
    </div>
  </div>
)

export const InfoTabSkeleton = () => (
  <div className="rounded-xl border border-border bg-card/60 divide-y divide-border overflow-hidden">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between gap-3 px-4 py-3.5">
        <PulseBlock className="h-4 w-24" />
        <PulseBlock className="h-4 w-28" />
      </div>
    ))}
  </div>
)

export const EpisodesTabSkeleton = () => (
  <div className="space-y-4">
    <PulseBlock className="h-10 w-full rounded-xl" />
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <PulseBlock key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  </div>
)

export const SynopsisSkeleton = () => (
  <div className="mx-4 mt-4 rounded-xl border border-border bg-card/60 p-4 space-y-3">
    <PulseBlock className="h-4 w-24" />
    <div className="space-y-2">
      <PulseBlock className="h-3 w-full" />
      <PulseBlock className="h-3 w-full" />
      <PulseBlock className="h-3 w-11/12" />
      <PulseBlock className="h-3 w-4/5" />
    </div>
  </div>
)

export const HeroTitleSkeleton = () => (
  <div className="relative w-full mt-3 px-10 space-y-2 flex flex-col items-center">
    <PulseBlock className="h-6 w-56" />
    <PulseBlock className="h-4 w-40" />
  </div>
)

export const TranslatorsTabSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3"
      >
        <PulseBlock className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <PulseBlock className="h-4 w-32" />
          <PulseBlock className="h-3 w-20" />
        </div>
      </div>
    ))}
  </div>
)
