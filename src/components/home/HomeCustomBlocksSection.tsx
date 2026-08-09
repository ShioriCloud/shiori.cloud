import { memo } from 'react'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { useHomeCustomBlocksQuery } from '@/hooks/queries/useAnimeQueries'
import { HomeCustomBlocks } from './HomeCustomBlocks'

const CustomBlocksSkeleton = () => (
  <div className="space-y-8 px-4">
    <div className="space-y-3">
      <div className="h-5 w-40 animate-pulse rounded bg-muted ms-auto" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-[9.25rem] shrink-0">
            <div className="aspect-[2/3] animate-pulse rounded-2xl bg-muted" />
          </div>
        ))}
      </div>
    </div>
    <div className="h-28 animate-pulse rounded-2xl bg-muted" />
  </div>
)

export const HomeCustomBlocksSection = memo(({ enabled = true }: { enabled?: boolean }) => {
  const query = useHomeCustomBlocksQuery(enabled)
  const blocks = query.data ?? []

  const deferred = enabled === false && blocks.length === 0
  if ((query.isLoading || deferred) && blocks.length === 0) {
    return <CustomBlocksSkeleton />
  }

  if (query.isError && blocks.length === 0) {
    const message =
      query.error instanceof Error ? query.error.message : 'خطا در بارگذاری بلاک‌های سفارشی'
    return (
      <ExploreEmptyState
        title="خطا در بارگذاری"
        subtitle={message}
        showImage={false}
        compact
        actionLabel="تلاش مجدد"
        onAction={() => void query.refetch()}
      />
    )
  }

  if (blocks.length === 0) return null

  return <HomeCustomBlocks blocks={blocks} />
})

HomeCustomBlocksSection.displayName = 'HomeCustomBlocksSection'
