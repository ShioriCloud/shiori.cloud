import { useMemo, useState } from 'react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreTabBar } from '@/components/explore/ExploreUi'
import { MyListPoster } from '@/components/my-list/MyListUi'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { hasTrackedProgress, useUserAnimeList } from '@/hooks/useUserAnimeList'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { formatStatusDateFa } from '@/lib/formatStatusDate'
import {
  deriveWatchStatus,
  formatUserRatingFa,
  PROFILE_WATCH_STATUSES,
  WATCH_STATUS_LABELS,
  type WatchStatus,
} from '@/lib/myListUtils'
import { SOCIAL_DIVIDER_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import { PersonalSection } from './PersonalSection'

export const PersonalWatchArchive = ({ embedded = false }: { embedded?: boolean }) => {
  const { listAnimeIds, favoriteProgress } = useUserAnimeList()
  const { data: cards = [], isLoading } = useFavoriteAnimeCardsQuery(listAnimeIds)
  const [statusTab, setStatusTab] = useState<WatchStatus>('watching')

  const byId = useMemo(() => new Map(cards.map((c) => [String(c.id), c])), [cards])

  const rows = useMemo(() => {
    return listAnimeIds
      .map((id) => {
        const key = String(id)
        const progress = favoriteProgress[key]
        if (!progress || !hasTrackedProgress(progress)) return null
        const card = byId.get(key)
        if (!card) return null
        const episodesCount =
          typeof card.episodes_count === 'number' && card.episodes_count > 0
            ? card.episodes_count
            : 1
        const status = deriveWatchStatus(progress, episodesCount)
        return {
          id,
          card,
          progress,
          status,
          episodesCount,
          statusDate: formatStatusDateFa(progress.listStatusUpdatedAt),
        }
      })
      .filter((row): row is NonNullable<typeof row> => row != null)
  }, [listAnimeIds, favoriteProgress, byId])

  const counts = useMemo(() => {
    const map = new Map<WatchStatus, number>()
    for (const s of PROFILE_WATCH_STATUSES) map.set(s, 0)
    for (const row of rows) {
      map.set(row.status, (map.get(row.status) ?? 0) + 1)
    }
    return map
  }, [rows])

  const filtered = rows.filter((r) => r.status === statusTab)

  const tabs = PROFILE_WATCH_STATUSES.map((id) => ({
    id,
    label: WATCH_STATUS_LABELS[id],
  }))

  const body = (
    <>
      <ExploreTabBar
        tabs={tabs}
        active={statusTab}
        onChange={setStatusTab}
        className="!px-0"
      />

      <div className={cn(SOCIAL_SURFACE_CLASS, SOCIAL_DIVIDER_CLASS, 'mt-2 overflow-hidden')}>
        {isLoading && listAnimeIds.length > 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">در حال بارگذاری…</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            در این وضعیت انیمه‌ای نداری.
          </p>
        ) : (
          filtered.map((row) => {
            const routeRef = { id: row.card.id, slug: row.card.slug, title: row.card.title }
            return (
              <AnimePrefetchLink
                key={String(row.id)}
                animeId={animePublicSegment(routeRef)}
                to={animeDetailPath(routeRef)}
                className="flex gap-3 px-3 py-3 transition-colors hover:bg-muted/35 active:bg-muted/50"
              >
                <MyListPoster src={row.card.image} className="h-[4.5rem] w-12 shrink-0" />
                <div className="min-w-0 flex-1 text-right">
                  <BidiText as="p" className="text-sm font-semibold text-foreground line-clamp-2">
                    {row.card.title}
                  </BidiText>
                  <p className="mt-1 text-xs text-primary-400/90">
                    {WATCH_STATUS_LABELS[row.status]}
                    <span className="mx-1.5 text-muted-foreground/50">·</span>
                    {toPersianDigits(row.progress.episodesWatched)}/
                    {toPersianDigits(row.episodesCount)} قسمت
                  </p>
                  <div className="mt-1 flex flex-wrap items-center justify-end gap-2 text-[11px] text-muted-foreground">
                    {row.statusDate ? <span>ثبت: {row.statusDate}</span> : null}
                    {typeof row.progress.userRating === 'number' ? (
                      <span
                        className="rounded-md bg-amber-400/15 px-1.5 py-0.5 font-medium text-amber-700 dark:text-amber-200"
                      >
                        امتیاز {formatUserRatingFa(row.progress.userRating)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </AnimePrefetchLink>
            )
          })
        )}
      </div>

      <p className="text-[10px] text-muted-foreground/80 text-center">
        {PROFILE_WATCH_STATUSES.map((s) => `${WATCH_STATUS_LABELS[s]}: ${toPersianDigits(counts.get(s) ?? 0)}`).join(' · ')}
      </p>
    </>
  )

  if (embedded) return <div className="space-y-3">{body}</div>

  return (
    <PersonalSection
      title="آرشیو تماشای من"
      subtitle="بر اساس وضعیت ثبت‌شده در پیشرفت تماشا"
      accent="amber"
    >
      {body}
    </PersonalSection>
  )
}
