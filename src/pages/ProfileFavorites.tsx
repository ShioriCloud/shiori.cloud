import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { RouteFallback } from '@/components/RouteFallback'
import { SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { useUserAnimeList } from '@/hooks/useUserAnimeList'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

const ProfileFavorites = () => {
  const { isReady } = useAppAuth()
  const { favoriteAnime } = useUserAnimeList()
  const { data: cards = [], isLoading } = useFavoriteAnimeCardsQuery(favoriteAnime)

  if (!isReady) {
    return <RouteFallback />
  }

  const byId = new Map(cards.map((c) => [String(c.id), c]))
  const items = favoriteAnime
    .map((id) => byId.get(String(id)))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <Link
            to="/profile?tab=personal"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            شخصی
          </Link>
          <span className="text-sm font-semibold text-foreground">علاقه‌مندی‌ها</span>
        </div>
      </div>

      <div className="px-4 pt-4">
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
            <div className={cn(SOCIAL_SURFACE_CLASS, 'grid grid-cols-3 gap-2 p-2')}>
              {items.map((item) => {
                const routeRef = { id: item.id, slug: item.slug, title: item.title }
                return (
                  <AnimePrefetchLink
                    key={String(item.id)}
                    animeId={animePublicSegment(routeRef)}
                    to={animeDetailPath(routeRef)}
                    className="group block overflow-hidden rounded-xl active:scale-[0.98] transition-transform"
                  >
                    <div className="relative aspect-[2/3] bg-muted">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <BidiText
                          as="p"
                          className="text-[10px] font-semibold text-white line-clamp-2 text-left"
                        >
                          {item.title}
                        </BidiText>
                      </div>
                    </div>
                  </AnimePrefetchLink>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ProfileFavorites
