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
  rootMargin = '320px',
}: UseInfiniteScrollSentinelOptions) => {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage || !onLoadMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && !isFetching) {
          onLoadMore()
        }
      },
      { rootMargin, threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetching, onLoadMore, rootMargin])

  return sentinelRef
}
