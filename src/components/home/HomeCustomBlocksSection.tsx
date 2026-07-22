import { memo } from 'react'
import { Button } from '@/components/ui/button'
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

export const HomeCustomBlocksSection = memo(() => {
  const query = useHomeCustomBlocksQuery()
  const blocks = query.data ?? []

  if (query.isLoading && blocks.length === 0) {
    return <CustomBlocksSkeleton />
  }

  if (query.isError && blocks.length === 0) {
    const message =
      query.error instanceof Error ? query.error.message : 'خطا در بارگذاری بلاک‌های سفارشی'
    return (
      <div className="px-4 py-4 text-center space-y-3">
        <p className="text-sm text-red-500">{message}</p>
        <Button type="button" variant="secondary" size="sm" onClick={() => void query.refetch()}>
          تلاش مجدد
        </Button>
      </div>
    )
  }

  if (blocks.length === 0) return null

  return <HomeCustomBlocks blocks={blocks} />
})

HomeCustomBlocksSection.displayName = 'HomeCustomBlocksSection'
