import { useEffect, useRef } from 'react'

type UseInfiniteScrollSentinelOptions = {
  hasNextPage?: boolean
  isFetching?: boolean
  onLoadMore?: () => void
  rootMargin?: string
}

/** Triggers onLoadMore when sentinel enters viewport (infinite scroll). */
export const useInfiniteScrollSentinel = ({
  hasNextPage,
  isFetching,
  onLoadMore,
  /** Start fetch well before the user hits the bottom (Telegram WebView is slow). */
  rootMargin = '1200px 0px',
}: UseInfiniteScrollSentinelOptions) => {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage || !onLoadMoreRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && !isFetching) {
          onLoadMoreRef.current?.()
        }
      },
      { rootMargin, threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetching, rootMargin])

  return sentinelRef
}
