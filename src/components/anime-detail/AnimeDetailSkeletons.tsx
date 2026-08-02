import { cn } from '@/lib/utils'

export const PulseBlock = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-md bg-muted', className)} aria-hidden />
)

/** Full-page skeleton matching AnimeDetail layout (hero → stats → synopsis → tabs → info). */
export const DetailSkeleton = () => (
  <div className="pb-24 bg-background text-foreground" aria-busy="true" aria-label="در حال بارگذاری">
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-52 overflow-hidden">
        <PulseBlock className="h-full w-full rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 pb-2 pt-24">
        <div className="relative">
          <div className="aspect-[2/3] w-32 overflow-hidden rounded-2xl border-4 border-background bg-muted shadow-lg ring-2 ring-primary-400/25">
            <PulseBlock className="h-full w-full rounded-none" />
          </div>
          <PulseBlock className="absolute right-2 top-2 h-5 w-14 rounded-md" />
        </div>

        <div className="relative mt-3 flex w-full flex-col items-center space-y-2 px-10">
          <PulseBlock className="h-6 w-56" />
          <PulseBlock className="h-4 w-40" />
        </div>

        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          <PulseBlock className="h-5 w-14 rounded-md" />
          <PulseBlock className="h-5 w-16 rounded-md" />
          <PulseBlock className="h-5 w-16 rounded-md" />
          <PulseBlock className="h-5 w-14 rounded-md" />
        </div>

        <ScoreChipsSkeleton />

        <PulseBlock className="mt-3 h-14 w-full rounded-2xl" />
      </div>
    </div>

    <PulseBlock className="mx-4 mt-2 h-16 rounded-xl" />

    <StatsRowSkeleton />

    <PulseBlock className="mx-4 mt-2 h-10 w-full rounded-xl" />

    <SeriesSwitcherSkeleton />

    <SynopsisSkeleton />

    <div className="sticky top-[var(--app-header-offset)] z-30 border-b border-border/50 bg-background/90 px-4 pb-2 pt-5 backdrop-blur-md">
      <PulseBlock className="h-10 w-full rounded-xl" />
    </div>

    <div className="px-4 pt-4">
      <InfoTabSkeleton />
    </div>
  </div>
)

export const TELEGRAM_BLUE = '#229ED9'

export const StatsRowSkeleton = () => (
  <div className="mx-4 mt-2 flex items-stretch gap-2">
    <div className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-3">
      <PulseBlock className="h-5 w-5 shrink-0 rounded" />
      <PulseBlock className="h-3 w-28" />
    </div>
    <PulseBlock className="h-12 w-12 shrink-0 rounded-xl" />
  </div>
)

export const ScoreChipsSkeleton = () => (
  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-2 py-1.5"
      >
        <PulseBlock className="h-5 w-5 shrink-0 rounded" />
        <PulseBlock className="h-4 w-9" />
      </div>
    ))}
  </div>
)

export const SeriesSwitcherSkeleton = () => (
  <div className="mx-4 mt-4">
    <PulseBlock className="mx-auto mb-3 h-4 w-24" />
    <div className="flex gap-2 overflow-hidden px-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <PulseBlock key={i} className="h-[4.5rem] w-[7rem] shrink-0 rounded-xl" />
      ))}
    </div>
  </div>
)

export const InfoTabSkeleton = () => (
  <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card/60">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between gap-3 px-4 py-3.5">
        <PulseBlock className="h-4 w-24" />
        <PulseBlock className="h-4 w-28" />
      </div>
    ))}
  </div>
)

/** Matches launch download tab: kind tabs + quality note + episode rows. */
export const EpisodesTabSkeleton = () => (
  <div className="space-y-3">
    <PulseBlock className="h-10 w-full rounded-xl" />
    <div className="flex items-center gap-2 px-0.5">
      <PulseBlock className="h-3.5 w-0.5 shrink-0 rounded-full" />
      <PulseBlock className="h-3 w-40" />
      <PulseBlock className="ms-auto h-3 w-28" />
    </div>
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <PulseBlock key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  </div>
)

export const SynopsisSkeleton = () => (
  <div className="mx-4 mt-4 space-y-3 rounded-xl border border-border bg-card/60 p-4">
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
  <div className="relative mt-3 flex w-full flex-col items-center space-y-2 px-10">
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
        <PulseBlock className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <PulseBlock className="h-4 w-32" />
          <PulseBlock className="h-3 w-20" />
        </div>
      </div>
    ))}
  </div>
)
