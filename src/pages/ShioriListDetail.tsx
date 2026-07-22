import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Add01Icon, ArrowRight01Icon, Delete02Icon, Edit02Icon } from 'hugeicons-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { Button } from '@/components/ui/button'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { useMyListStore } from '@/store/myListStore'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianNumber } from '@/lib/myListUtils'
import { getListIcon } from '@/components/my-list/listIcons'
import { MyListAnimeRow } from '@/components/my-list/MyListAnimeRow'
import {
  MyListEmptyState,
  MyListGhostButton,
  MyListPoster,
  MyListSkeletonCards,
  MyListTabHeader,
} from '@/components/my-list/MyListUi'
import { EditListSheet } from '@/components/my-list/ShioriListEditSheet'
import { cn } from '@/lib/utils'

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
          <Link to="/my-list?tab=lists">بازگشت</Link>
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
          'sticky top-16 z-20 px-4 py-2.5',
          'bg-background/95 backdrop-blur-md border-b border-border/60'
        )}
      >
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="بازگشت"
            onClick={() => navigate('/my-list?tab=lists')}
          >
            <ArrowRight01Icon className="h-5 w-5" />
          </Button>

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
              <div className="text-center py-8 space-y-3">
                <p className="text-sm text-red-400">خطا در بارگذاری</p>
                <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
                  تلاش مجدد
                </Button>
              </div>
            )}

            {!loading && items.length > 0 && (
              <div className="space-y-2">
                {items.map((anime) => (
                  <MyListAnimeRow
                    key={anime.id}
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
                          className="text-sm font-semibold text-foreground line-clamp-1 text-right leading-5"
                        >
                          {anime.title}
                        </BidiText>
                      </AnimePrefetchLink>
                    }
                    trailing={
                      <MyListGhostButton
                        aria-label="حذف از لیست"
                        destructive
                        onClick={() => removeAnimeFromList(list.id, anime.id)}
                      >
                        <Delete02Icon className="h-4 w-4" />
                      </MyListGhostButton>
                    }
                  />
                ))}
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
