import { Link } from 'react-router-dom'
import { ChevronLeft, Heart } from 'lucide-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { FavoriteRankBadge } from '@/components/profile/FavoriteRankBadge'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { useUserAnimeList } from '@/hooks/useUserAnimeList'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import { PersonalSection } from './PersonalSection'

export const PersonalFavoritesTeaser = () => {
  const { favoriteAnime } = useUserAnimeList()
  const { data: cards = [] } = useFavoriteAnimeCardsQuery(favoriteAnime)
  const byId = new Map(cards.map((c) => [String(c.id), c]))
  const preview = favoriteAnime.slice(0, 4)

  return (
    <PersonalSection
      title="علاقه‌مندی‌ها"
      subtitle="ترتیب نمایش در پروفایل — سه تای اول با مدال"
      accent="rose"
      action={
        <Link
          to="/profile/favorites"
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-600 dark:text-rose-300"
        >
          مرتب‌سازی
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {favoriteAnime.length === 0 ? (
        <Link
          to="/profile/favorites"
          className={cn(
            SOCIAL_SURFACE_CLASS,
            'flex items-center gap-3 px-4 py-6 text-sm text-muted-foreground'
          )}
        >
          <Heart className="h-5 w-5 text-rose-400/80" />
          با قلب در جزئیات انیمه اضافه کن
        </Link>
      ) : (
        <div className={cn(SOCIAL_SURFACE_CLASS, 'space-y-2 p-2')}>
          {preview.map((id, index) => {
            const card = byId.get(String(id))
            if (!card) return null
            const rank = index + 1
            const routeRef = { id: card.id, slug: card.slug, title: card.title }
            return (
              <AnimePrefetchLink
                key={String(id)}
                animeId={animePublicSegment(routeRef)}
                to={animeDetailPath(routeRef)}
                className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/40"
              >
                <FavoriteRankBadge rank={rank} size={rank <= 3 ? 'md' : 'sm'} />
                <div className="h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {card.image ? (
                    <img src={card.image} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {card.title}
                </span>
              </AnimePrefetchLink>
            )
          })}
          {favoriteAnime.length > preview.length ? (
            <Link
              to="/profile/favorites"
              className="block py-2 text-center text-xs font-medium text-muted-foreground"
            >
              و {toPersianDigits(favoriteAnime.length - preview.length)} مورد دیگر…
            </Link>
          ) : null}
        </div>
      )}
    </PersonalSection>
  )
}
