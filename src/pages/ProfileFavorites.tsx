import { ChevronDown, ChevronUp } from 'lucide-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { RouteFallback } from '@/components/RouteFallback'
import { FavoriteRankBadge } from '@/components/profile/FavoriteRankBadge'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import { SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { useUserAnimeList } from '@/hooks/useUserAnimeList'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import { hapticSelection } from '@/lib/telegramHaptics'

const ProfileFavorites = () => {
  const { isReady } = useAppAuth()
  const { favoriteAnime, moveFavoriteUp, moveFavoriteDown } = useUserAnimeList()
  const { data: cards = [], isLoading } = useFavoriteAnimeCardsQuery(favoriteAnime)

  if (!isReady) {
    return <RouteFallback />
  }

  const byId = new Map(cards.map((c) => [String(c.id), c]))
  const items = favoriteAnime
    .map((id) => ({ id, card: byId.get(String(id)) }))
    .filter((row): row is { id: number | string; card: NonNullable<typeof row.card> } =>
      Boolean(row.card)
    )

  return (
    <ProfilePersonalSubpageLayout
      title="علاقه‌مندی‌ها"
      description="با دکمه‌های بالا و پایین ترتیب را عوض کن — در پروفایل با مدال نمایش داده می‌شود."
    >
        {isLoading && favoriteAnime.length > 0 ? (
          <p className="text-center text-sm text-muted-foreground">در حال بارگذاری…</p>
        ) : items.length === 0 ? (
          <ExploreEmptyState
            title="هنوز علاقه‌مندی نداری"
            subtitle="از صفحهٔ جزئیات انیمه با دکمهٔ قلب اضافه کن."
          />
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground">
              {toPersianDigits(items.length)} انیمه
            </p>
            <div className={cn(SOCIAL_SURFACE_CLASS, 'divide-y divide-border/40 overflow-hidden')}>
              {items.map((row, index) => {
                const rank = index + 1
                const routeRef = { id: row.card.id, slug: row.card.slug, title: row.card.title }
                return (
                  <div
                    key={String(row.id)}
                    className="flex items-stretch gap-2 px-2 py-2 sm:gap-3"
                  >
                    <div className="flex flex-col items-center justify-center gap-0.5 py-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => {
                          hapticSelection()
                          moveFavoriteUp(row.id)
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground enabled:active:bg-muted/60 disabled:opacity-25"
                        aria-label="بالا"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <FavoriteRankBadge rank={rank} size={rank <= 3 ? 'md' : 'sm'} />
                      <button
                        type="button"
                        disabled={index === items.length - 1}
                        onClick={() => {
                          hapticSelection()
                          moveFavoriteDown(row.id)
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground enabled:active:bg-muted/60 disabled:opacity-25"
                        aria-label="پایین"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    <AnimePrefetchLink
                      animeId={animePublicSegment(routeRef)}
                      to={animeDetailPath(routeRef)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-1 active:bg-muted/30"
                    >
                      <div className="relative h-[5.5rem] w-10 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/40">
                        {row.card.image ? (
                          <img
                            src={row.card.image}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                        {rank <= 3 ? (
                          <div
                            className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-white/20"
                            aria-hidden
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 text-right">
                        <BidiText as="p" className="text-sm font-semibold text-foreground line-clamp-2">
                          {row.card.title}
                        </BidiText>
                        {rank <= 3 ? (
                          <p className="mt-1 text-[11px] font-medium text-amber-700/90 dark:text-amber-200/90">
                            {rank === 1 ? 'رتبه طلایی پروفایل' : rank === 2 ? 'رتبه نقره‌ای' : 'رتبه برنزی'}
                          </p>
                        ) : (
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            رتبه {toPersianDigits(rank)} در پروفایل
                          </p>
                        )}
                      </div>
                    </AnimePrefetchLink>
                  </div>
                )
              })}
            </div>
          </>
        )}
    </ProfilePersonalSubpageLayout>
  )
}

export default ProfileFavorites
