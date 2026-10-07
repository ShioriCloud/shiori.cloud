import { useMemo } from 'react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { HomeRailScroller, HomeRailSlide } from '@/components/home/HomeRailScroller'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { useUserAnimeList } from '@/hooks/useUserAnimeList'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { deriveWatchStatus } from '@/lib/myListUtils'
import { toPersianDigits } from '@/lib/persianDigits'

const MAX_ITEMS = 5

export const ProfileWatchingRail = () => {
  const { favoriteAnime, getProgress } = useUserAnimeList()
  const { data: cards = [], isLoading } = useFavoriteAnimeCardsQuery(favoriteAnime)

  const watching = useMemo(() => {
    const byId = new Map(cards.map((c) => [String(c.id), c]))
    const picked: Array<{
      id: string | number
      title: string
      image: string
      slug: string | null
      episodesCount: number
      episodesWatched: number
    }> = []

    for (const id of favoriteAnime) {
      if (picked.length >= MAX_ITEMS) break
      const card = byId.get(String(id))
      if (!card) continue
      const episodesCount =
        typeof card.episodes_count === 'number' && card.episodes_count > 0
          ? card.episodes_count
          : 1
      const progress = getProgress(id)
      if (deriveWatchStatus(progress, episodesCount) !== 'watching') continue
      picked.push({
        id: card.id,
        title: card.title,
        image: card.image,
        slug: card.slug ?? null,
        episodesCount,
        episodesWatched: progress.episodesWatched,
      })
    }
    return picked
  }, [favoriteAnime, cards, getProgress])

  if (!isLoading && watching.length === 0) return null

  return (
    <div>
      <h2 className="mb-3 px-4 text-sm font-semibold text-foreground">در حال تماشا</h2>
      {isLoading && watching.length === 0 ? (
        <div className="mx-4 flex gap-2 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[148px] w-[100px] shrink-0 animate-pulse rounded-xl bg-muted/70"
            />
          ))}
        </div>
      ) : (
        <HomeRailScroller restoreKey="profile-watching" className="px-4">
          {watching.map((item) => {
            const routeRef = { id: item.id, slug: item.slug, title: item.title }
            const progressLabel = `${toPersianDigits(item.episodesWatched)}/${toPersianDigits(item.episodesCount)}`
            return (
              <HomeRailSlide key={String(item.id)} className="w-[100px]">
                <AnimePrefetchLink
                  animeId={animePublicSegment(routeRef)}
                  to={animeDetailPath(routeRef)}
                  className="group block active:scale-[0.98] transition-transform"
                  aria-label={`مشاهده ${item.title}`}
                >
                  <div className="media-card-skeuo rounded-xl">
                    <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                      <span
                        className="absolute left-1.5 top-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-medium text-white tabular-nums"
                      >
                        {progressLabel}
                      </span>
                      <div className="absolute bottom-0 left-0 right-0 p-2 pt-6">
                        <BidiText
                          as="p"
                          className="text-[10px] font-semibold text-white line-clamp-2 text-left"
                        >
                          {item.title}
                        </BidiText>
                      </div>
                    </div>
                  </div>
                </AnimePrefetchLink>
              </HomeRailSlide>
            )
          })}
        </HomeRailScroller>
      )}
    </div>
  )
}
