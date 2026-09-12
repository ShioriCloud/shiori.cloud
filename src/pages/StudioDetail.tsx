import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { AnimePosterCard, AnimePosterSkeletonGrid } from '@/components/anime/AnimePosterCard'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { useStudioPageQuery } from '@/hooks/queries/useAnimeQueries'

const StudioDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const nameParam = searchParams.get('name')?.trim() || null
  const { data, isLoading, isError, error, refetch } = useStudioPageQuery(slug)

  const studio = data?.studio ?? null
  const anime = data?.anime ?? []
  const studioDisplayName = nameParam || studio?.name || null
  const showTitleSkeleton = isLoading && !nameParam
  const errorMessage = error instanceof Error ? error.message : 'خطا در بارگذاری'

  const pageTitle = useMemo(() => {
    if (!studioDisplayName) return null
    return `انیمه‌های استودیو ${studioDisplayName}`
  }, [studioDisplayName])

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-2">
        {showTitleSkeleton ? (
          <div className="h-6 w-56 max-w-full bg-muted animate-pulse rounded" aria-hidden />
        ) : (
          <h2 className="text-base font-semibold text-foreground">
            {pageTitle ?? `انیمه‌های استودیو ${slug}`}
          </h2>
        )}
      </div>

      {isLoading ? (
        <AnimePosterSkeletonGrid />
      ) : isError ? (
        <ExploreEmptyState
          title="خطا در بارگذاری استودیو"
          subtitle={errorMessage}
          showImage
          actionLabel="تلاش مجدد"
          onAction={() => void refetch()}
        />
      ) : anime.length === 0 ? (
        <ExploreEmptyState title="انیمه‌ای پیدا نشد" subtitle="برای این استودیو عنوانی ثبت نشده." />
      ) : (
        <div className="grid grid-cols-3 gap-3 px-4 pt-2">
          {anime.map((a) => (
            <AnimePosterCard key={String(a.id)} anime={a} />
          ))}
        </div>
      )}
    </div>
  )
}

export default StudioDetail
