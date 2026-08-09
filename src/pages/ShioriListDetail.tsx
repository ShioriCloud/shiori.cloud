import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Add01Icon, Edit02Icon } from 'hugeicons-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { Button } from '@/components/ui/button'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { useMyListStore } from '@/store/myListStore'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianNumber } from '@/lib/myListUtils'
import { translateSeason } from '@/lib/searchFilters'
import { getListIcon } from '@/components/my-list/listIcons'
import { MyListAnimeRow, MyListBadge } from '@/components/my-list/MyListAnimeRow'
import {
  MyListDeleteChip,
  MyListEmptyState,
  MyListPoster,
  MyListSkeletonCards,
  MyListTabHeader,
} from '@/components/my-list/MyListUi'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { EditListSheet } from '@/components/my-list/ShioriListEditSheet'
import { cn } from '@/lib/utils'
import type { GenreItem } from '@/types/catalog'

const genreLabel = (g: GenreItem) => g.name_fa || g.name_en || g.slug

const ShioriListDetail = () => {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const list = useMyListStore((s) => s.customLists.find((l) => l.id === listId))
  const removeAnimeFromList = useMyListStore((s) => s.removeAnimeFromList)
  const [editOpen, setEditOpen] = useState(false)

  const animeIds = list?.animeIds ?? []

  const {
    data: cards = [],
    isLoading,
    isError,
    refetch,
  } = useFavoriteAnimeCardsQuery(animeIds)

  const items = useMemo(() => {
    const byId = new Map<string, (typeof cards)[number]>()
    for (const card of cards) byId.set(String(card.id), card)
    return animeIds
      .map((id) => byId.get(id))
      .filter((card): card is (typeof cards)[number] => card != null)
  }, [animeIds, cards])

  if (!list) {
    return (
      <div className="px-4 py-16 text-center space-y-4 pb-24">
        <p className="text-sm text-muted-foreground">لیست پیدا نشد</p>
        <Button asChild type="button" variant="secondary" size="sm">
          <Link to="/my-list?tab=lists">لیست‌های من</Link>
        </Button>
      </div>
    )
  }

  const { Icon } = getListIcon(list.icon)
  const loading = animeIds.length > 0 && items.length === 0 && isLoading

  return (
    <div className="pb-24">
      <div
        className={cn(
          'sticky top-[var(--app-header-offset)] z-20 px-4 py-2.5',
          'bg-background/95 backdrop-blur-md border-b border-border/60'
        )}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-2.5 text-start active:opacity-80 transition-opacity"
            aria-label="ویرایش نام لیست"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary-400/30 bg-primary-400/10 text-primary-400">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-semibold text-foreground line-clamp-1">{list.name}</h1>
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {toPersianNumber(animeIds.length)} انیمه · مجموعه شخصی
              </p>
            </div>
            <Edit02Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>

          <Button asChild type="button" size="icon-sm" variant="secondary" aria-label="افزودن انیمه">
            <Link to="/explore">
              <Add01Icon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="px-4 pt-3 my-list-enter">
        {animeIds.length === 0 ? (
          <MyListEmptyState
            title="این مجموعه خالیه"
            description="از صفحهٔ جزئیات انیمه، با «افزودن به لیست» انیمه رو به این مجموعه اضافه کن."
            actionLabel="افزودن انیمه"
            actionTo="/explore"
          />
        ) : (
          <>
            <MyListTabHeader title="انیمه‌های مجموعه" meta={`${toPersianNumber(items.length)} انیمه`} />

            {loading && <MyListSkeletonCards />}

            {isError && (
              <ExploreEmptyState
                title="خطا در بارگذاری"
                subtitle="محتوای این مجموعه بارگذاری نشد."
                showImage={false}
                compact
                actionLabel="تلاش مجدد"
                onAction={() => void refetch()}
              />
            )}

            {!loading && items.length > 0 && (
              <div className="space-y-2">
                {items.map((anime) => {
                  const episodes =
                    typeof anime.episodes_count === 'number' && anime.episodes_count > 0
                      ? anime.episodes_count
                      : null
                  const seasonKey = anime.season ? String(anime.season).toUpperCase() : ''
                  const seasonYearLabel =
                    seasonKey && typeof anime.year === 'number'
                      ? `${translateSeason(seasonKey)} ${toPersianNumber(anime.year)}`
                      : typeof anime.year === 'number'
                        ? toPersianNumber(anime.year)
                        : seasonKey
                          ? translateSeason(seasonKey)
                          : null
                  const genres = (anime.genres ?? []).slice(0, 2)

                  return (
                    <MyListAnimeRow
                      key={String(anime.id)}
                      image={anime.image}
                      link={
                        <AnimePrefetchLink
                          animeId={animePublicSegment(anime)}
                          to={animeDetailPath(anime)}
                          className="shrink-0 active:scale-[0.97] transition-transform"
                        >
                          <MyListPoster src={anime.image} />
                        </AnimePrefetchLink>
                      }
                      title={
                        <AnimePrefetchLink
                          animeId={animePublicSegment(anime)}
                          to={animeDetailPath(anime)}
                          className="block active:scale-[0.99] transition-transform"
                        >
                          <BidiText
                            as="h3"
                            className="text-sm font-semibold text-foreground text-end leading-snug line-clamp-2 break-words"
                          >
                            {anime.title}
                          </BidiText>
                        </AnimePrefetchLink>
                      }
                      badges={
                        <>
                          {genres.map((g) => (
                            <MyListBadge key={g.slug} tone="muted">
                              {genreLabel(g)}
                            </MyListBadge>
                          ))}
                          {episodes != null ? (
                            <MyListBadge tone="default">
                              {toPersianNumber(episodes)} قسمت
                            </MyListBadge>
                          ) : null}
                          {seasonYearLabel ? (
                            <MyListBadge tone="default">{seasonYearLabel}</MyListBadge>
                          ) : null}
                        </>
                      }
                      trailing={
                        <MyListDeleteChip
                          aria-label="حذف از لیست"
                          onClick={() => removeAnimeFromList(list.id, String(anime.id))}
                        />
                      }
                    />
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <EditListSheet
        listId={list.id}
        open={editOpen}
        onOpenChange={setEditOpen}
        onDeleted={() => navigate('/my-list?tab=lists', { replace: true })}
      />
    </div>
  )
}

export default ShioriListDetail
