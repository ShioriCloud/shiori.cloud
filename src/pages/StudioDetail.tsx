import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { AnimePosterCard, AnimePosterSkeletonGrid } from '@/components/anime/AnimePosterCard'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import * as catalog from '../services/catalogSource'
import type { StudioPublicItem } from '../services/catalogSource'
import { fetchAnimeByStudioSlug, type UiAnimeCard } from '../utils/api'

const StudioDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const nameParam = searchParams.get('name')?.trim() || null
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studio, setStudio] = useState<StudioPublicItem | null>(null)
  const [anime, setAnime] = useState<UiAnimeCard[]>([])
  const [reloadKey, setReloadKey] = useState(0)

  const load = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    setError(null)
    try {
      const s = await catalog.getStudioBySlug(slug)
      setStudio(s)
      const list = await fetchAnimeByStudioSlug(slug)
      setAnime(list)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'خطا در بارگذاری'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load, reloadKey])

  const studioDisplayName = nameParam || studio?.name || null
  const showTitleSkeleton = loading && !nameParam

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

      {loading ? (
        <AnimePosterSkeletonGrid />
      ) : error ? (
        <ExploreEmptyState
          title="خطا در بارگذاری استودیو"
          subtitle={error}
          showImage
          actionLabel="تلاش مجدد"
          onAction={() => setReloadKey((k) => k + 1)}
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
