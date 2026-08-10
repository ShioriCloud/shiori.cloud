import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Delete02Icon, Edit02Icon } from 'hugeicons-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { Button } from '@/components/ui/button'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useMyListStore } from '@/store/myListStore'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianNumber } from '@/lib/myListUtils'
import { getListIcon } from '@/components/my-list/listIcons'
import { MyListAnimeRow, MyListBadge } from '@/components/my-list/MyListAnimeRow'
import {
  MyListDeleteChip,
  MyListEmptyState,
  MyListPoster,
  MyListSkeletonCards,
} from '@/components/my-list/MyListUi'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { EditListSheet } from '@/components/my-list/ShioriListEditSheet'
import { cn } from '@/lib/utils'
import type { GenreItem } from '@/types/catalog'

const genreLabel = (g: GenreItem) => g.name_fa || g.name_en || g.slug

const ShioriListDetail = () => {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const { showAlert, showConfirm } = useAppAuth()
  const list = useMyListStore((s) => s.customLists.find((l) => l.id === listId))
  const removeAnimeFromList = useMyListStore((s) => s.removeAnimeFromList)
  const deleteList = useMyListStore((s) => s.deleteList)
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
      <div className="space-y-4 px-4 py-16 pb-24 text-center">
        <p className="text-sm text-muted-foreground">لیست پیدا نشد</p>
        <Button asChild type="button" variant="secondary" size="sm">
          <Link to="/my-list?tab=lists">لیست‌های من</Link>
        </Button>
      </div>
    )
  }

  const { Icon } = getListIcon(list.icon)
  const loading = animeIds.length > 0 && items.length === 0 && isLoading

  const handleDeleteList = async () => {
    const confirmed = await showConfirm({
      title: 'حذف لیست',
      message: `لیست «${list.name}» حذف شود؟ این کار قابل بازگشت نیست.`,
      confirmLabel: 'حذف',
      cancelLabel: 'انصراف',
      destructive: true,
    })
    if (!confirmed) return
    deleteList(list.id)
    showAlert('لیست حذف شد')
    navigate('/my-list?tab=lists', { replace: true })
  }

  return (
    <div className="pb-24">
      <div
        className={cn(
          'sticky top-[var(--app-header-offset)] z-20 px-4 py-2.5',
          'border-b border-border/60 bg-background/95 backdrop-blur-md'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary-400/30 bg-primary-400/10 text-primary-400">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="line-clamp-1 text-sm font-semibold text-foreground">{list.name}</h1>
              <p className="text-[11px] tabular-nums text-muted-foreground">
                {toPersianNumber(animeIds.length)} انیمه
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              aria-label="ویرایش لیست"
              onClick={() => setEditOpen(true)}
            >
              <Edit02Icon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              className="border-red-500/25 text-red-400 hover:text-red-400"
              aria-label="حذف لیست"
              onClick={() => {
                void handleDeleteList()
              }}
            >
              <Delete02Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="my-list-enter px-4 pt-3">
        {animeIds.length === 0 ? (
          <MyListEmptyState
            title="این مجموعه خالیه"
            description="از صفحهٔ جزئیات انیمه، با «افزودن به لیست» انیمه رو به این مجموعه اضافه کن."
            actionLabel="افزودن انیمه"
            actionTo="/explore"
          />
        ) : (
          <>
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
                  const genres = (anime.genres ?? []).slice(0, 2)

                  return (
                    <MyListAnimeRow
                      key={String(anime.id)}
                      image={anime.image}
                      link={
                        <AnimePrefetchLink
                          animeId={animePublicSegment(anime)}
                          to={animeDetailPath(anime)}
                          className="shrink-0 transition-transform active:scale-[0.97]"
                        >
                          <MyListPoster src={anime.image} />
                        </AnimePrefetchLink>
                      }
                      title={
                        <AnimePrefetchLink
                          animeId={animePublicSegment(anime)}
                          to={animeDetailPath(anime)}
                          className="block transition-transform active:scale-[0.99]"
                        >
                          <BidiText
                            as="h3"
                            className="line-clamp-2 break-words text-end text-sm font-semibold leading-snug text-foreground"
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
      />
    </div>
  )
}

export default ShioriListDetail
