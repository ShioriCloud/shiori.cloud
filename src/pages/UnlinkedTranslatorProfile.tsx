import { useMemo } from 'react'
import AnimePrefetchLink from '../components/AnimePrefetchLink'
import { BidiText } from '../components/BidiText'
import { UserIcon } from 'hugeicons-react'
import type { AnimeCard, GenreItem } from '../types/catalog'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfilePageSkeleton } from '@/components/profile/ProfilePageSkeleton'
import { useTranslatorProfileQuery } from '@/hooks/queries/useAnimeQueries'
import { animeDetailPath, animePublicSegment } from '../lib/animePaths'
import { Badge } from '@/components/ui/badge'
import { TranslatorBioQuote } from '@/components/profile/TranslatorBioQuote'
import { toPersianDigits } from '@/lib/persianDigits'
const genreLabel = (g: GenreItem) => g.name_fa || g.name_en || g.slug

const AnimeGridCard = ({ anime }: { anime: AnimeCard }) => {
  const genres = (anime.genres || []).slice(0, 2)

  return (
    <AnimePrefetchLink
      animeId={animePublicSegment(anime)}
      to={animeDetailPath(anime)}
      className="group block active:scale-[0.98] transition-transform"
      aria-label={`مشاهده ${anime.title}`}
    >
      <div className="media-card-skeuo rounded-xl">
        <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
          <img
            src={anime.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute left-0 bottom-0 p-2.5 pt-10">
            <BidiText as="h3" className="text-xs font-semibold text-white text-left line-clamp-2">
              {anime.title}
            </BidiText>
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-0.5 mt-1 justify-end">
                {genres.map((g) => (
                  <span
                    key={g.slug}
                    className="text-[8px] leading-none px-1 py-0.5 rounded-md bg-white/15 text-white/90 border border-white/10 truncate max-w-full"
                  >
                    {genreLabel(g)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimePrefetchLink>
  )
}

/** Catalog-only translator (no linked Telegram user) — same hero metrics as public profile. */
export default function UnlinkedTranslatorProfile({ slug }: { slug: string }) {
  const { data, isLoading, isError, refetch } = useTranslatorProfileQuery(slug)

  const translator = data?.translator ?? null
  const animeList = data?.animeList ?? []

  const animeCount = useMemo(() => {
    const ids = new Set(animeList.map((a) => String(a.id)))
    return ids.size
  }, [animeList])

  const coverImage = useMemo(() => {
    return (
      translator?.cover_url ||
      translator?.avatar_url ||
      animeList[0]?.featuredImage ||
      animeList[0]?.image ||
      null
    )
  }, [translator?.cover_url, translator?.avatar_url, animeList])

  if (isLoading) return <ProfilePageSkeleton />

  if (isError || !translator) {
    return (
      <div className="pb-24">
        <ExploreEmptyState
          title="خطا در بارگذاری مترجم"
          subtitle={isError ? 'خطا در بارگذاری پروفایل مترجم' : 'مترجم یافت نشد.'}
          actionLabel="تلاش مجدد"
          onAction={() => void refetch()}
        />
      </div>
    )
  }

  const experienceLabel =
    translator.experience && translator.experience.trim().length > 0
      ? translator.experience
      : '—'

  const avatarUrl = translator.avatar_url?.trim() || null

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-44 overflow-hidden">
          {coverImage ? (
            <>
              <img
                src={coverImage}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-md"
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-primary-400/30 via-primary-400/10 to-background" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-400/20 via-transparent to-transparent" />
            </>
          )}
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 pb-2 pt-24">
          <div className="media-card-skeuo h-24 w-24 rounded-2xl">
            <div className="media-card-skeuo-face bg-muted">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={translator.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-400/15">
                  <UserIcon className="h-10 w-10 text-muted-foreground/50" />
                </div>
              )}
            </div>
          </div>

          <h1 className="mt-3 line-clamp-2 px-2 text-center text-lg font-bold text-foreground">
            {translator.name}
          </h1>

          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            <Badge variant={translator.is_active !== false ? 'success' : 'secondary'}>
              مترجم
            </Badge>
            {translator.is_active === false ? (
              <Badge variant="secondary">غیرفعال</Badge>
            ) : null}
          </div>

          {translator.bio ? (
            <TranslatorBioQuote
              bio={translator.bio}
              attribution={translator.name}
              className="mt-4 w-full max-w-sm text-right"
            />
          ) : null}
        </div>
      </div>

      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        {[
          { value: toPersianDigits(animeCount), label: 'انیمه' },
          { value: experienceLabel, label: 'سابقه' },
          { value: '—', label: 'دنبال‌کننده' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="surface-skeuo rounded-xl py-3 px-2 text-center"
          >
            <p className="text-base font-bold text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="px-4 pt-6 pb-2 flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-foreground">آثار</h2>
        <span className="text-xs text-muted-foreground">
          {animeCount > 0 ? `${toPersianDigits(animeCount)} عنوان` : 'خالی'}
        </span>
      </div>

      {animeList.length === 0 ? (
        <div className="mx-4 rounded-2xl border border-dashed border-border bg-muted/20 py-12 text-center">
          <p className="text-sm text-muted-foreground">اثری برای این مترجم ثبت نشده.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 px-4">
          {animeList.map((a) => (
            <AnimeGridCard key={String(a.id)} anime={a} />
          ))}
        </div>
      )}
    </div>
  )
}
