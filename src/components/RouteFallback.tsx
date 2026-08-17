import { useLocation } from 'react-router-dom'
import { AppHeader } from '@/components/AppHeader'
import { DetailSkeleton } from '@/components/anime-detail/AnimeDetailSkeletons'
import { AnimePosterSkeletonGrid } from '@/components/anime/AnimePosterCard'
import { MyListSkeletonCards } from '@/components/my-list/MyListUi'

const Pulse = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} aria-hidden />
)

const HomePageSkeleton = () => (
  <div className="overflow-x-hidden pb-24" aria-busy="true" aria-label="در حال بارگذاری خانه">
    <AppHeader />
    <div className="px-4">
      <Pulse className="h-12 rounded-xl" />
    </div>
    <div className="mt-4 px-4">
      <div className="mb-3 flex items-center justify-between">
        <Pulse className="h-4 w-28" />
        <Pulse className="h-3 w-16" />
      </div>
      <Pulse className="h-52 rounded-2xl" />
    </div>
    {Array.from({ length: 3 }).map((_, section) => (
      <section key={section} className="mt-6 space-y-3">
        <div className="flex items-center justify-between gap-3 px-4">
          <Pulse className="h-4 w-32" />
          <Pulse className="h-3 w-16" />
        </div>
        <div className="flex gap-3 overflow-hidden px-4">
          {Array.from({ length: 4 }).map((__, i) => (
            <div key={i} className="w-[9.25rem] shrink-0 animate-pulse">
              <div className="aspect-[2/3] rounded-xl bg-muted" />
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
)

const ExplorePageSkeleton = () => (
  <div className="overflow-x-hidden pb-24" aria-busy="true" aria-label="در حال بارگذاری گشت‌و‌گذار">
    <AppHeader />
    <div className="px-4">
      <Pulse className="h-11 rounded-xl" />
    </div>
    <div className="mt-3 px-4">
      <Pulse className="h-10 rounded-xl" />
    </div>
    <AnimePosterSkeletonGrid className="px-4 pt-4" />
  </div>
)

const SchedulePageSkeleton = () => (
  <div className="animate-pulse pb-24" aria-busy="true" aria-label="در حال بارگذاری برنامه پخش">
    <div className="flex items-center justify-between gap-3 px-4 pt-4">
      <div className="h-6 w-28 rounded bg-muted" />
      <div className="h-5 w-32 rounded bg-muted" />
    </div>
    <div className="flex justify-between gap-1 px-4 pt-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex flex-1 justify-center">
          <div className="h-10 w-10 rounded-full bg-muted" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-3 px-4 pt-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-[2/3] rounded-2xl bg-muted" />
      ))}
    </div>
  </div>
)

const MyListPageSkeleton = () => (
  <div className="px-4 pb-24 pt-4" aria-busy="true" aria-label="در حال بارگذاری لیست">
    <Pulse className="mb-4 h-11 rounded-xl" />
    <MyListSkeletonCards />
  </div>
)

const ProfilePageSkeleton = () => (
  <div className="px-4 pb-24 pt-24" aria-busy="true" aria-label="در حال بارگذاری پروفایل">
    <div className="flex flex-col items-center gap-3">
      <Pulse className="h-20 w-20 rounded-full" />
      <Pulse className="h-5 w-36" />
      <Pulse className="h-4 w-24" />
    </div>
    <div className="mt-8 space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Pulse key={i} className="h-14 rounded-xl" />
      ))}
    </div>
  </div>
)

const GenericPageSkeleton = () => (
  <div className="space-y-4 px-4 pb-24 pt-4" aria-busy="true" aria-label="در حال بارگذاری">
    <Pulse className="h-6 w-40" />
    <Pulse className="h-40 rounded-2xl" />
    <Pulse className="h-24 rounded-xl" />
    <Pulse className="h-24 rounded-xl" />
  </div>
)

/** In-layout placeholder while a lazy route chunk loads — never the boot splash. */
export const RouteFallback = () => {
  const { pathname } = useLocation()

  if (pathname === '/') return <HomePageSkeleton />
  if (pathname.startsWith('/anime/')) return <DetailSkeleton />
  if (pathname.startsWith('/explore')) return <ExplorePageSkeleton />
  if (pathname.startsWith('/schedule')) return <SchedulePageSkeleton />
  if (pathname.startsWith('/my-list')) return <MyListPageSkeleton />
  if (pathname.startsWith('/profile') || pathname.startsWith('/translators/')) {
    return <ProfilePageSkeleton />
  }
  if (pathname.startsWith('/studios/')) return <DetailSkeleton />

  return <GenericPageSkeleton />
}
