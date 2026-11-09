import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ExploreEmptyState, SHIORI_PRIMARY_BUTTON_CLASS } from '@/components/explore/ExploreUi'
import { CreateShioriListSheet } from '@/components/my-list/CreateShioriListSheet'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { useCustomLists } from '@/hooks/useCustomLists'
import { usePublicCustomListQuery, usePublicCustomListsQuery } from '@/hooks/usePublicCustomLists'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import type { ShioriCustomList } from '@/store/myListStore'
import { toPersianDigits } from '@/lib/persianDigits'
import { PROFILE_PANEL_CLASS } from '@/components/profile/profileStatsCard'
import { cn } from '@/lib/utils'

type ProfilePlaylistsTabPanelProps = {
  profileUserId: string
  profileBase?: string
  variant: 'own' | 'public'
}

const ListPosterGrid = ({ images }: { images: string[] }) => {
  const cells = Array.from({ length: 4 }, (_, i) => images[i] ?? null)
  return (
    <div className="grid aspect-square w-full grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl bg-muted/50">
      {cells.map((src, i) => (
        <div key={src ? `${src}-${i}` : `empty-${i}`} className="relative min-h-0 min-w-0 overflow-hidden">
          {src ? (
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 bg-muted/80" />
          )}
        </div>
      ))}
    </div>
  )
}

const PlaylistCard = ({
  profileUserId,
  listId,
  name,
  itemCount,
}: {
  profileUserId: string
  listId: string
  name: string
  itemCount: number
}) => {
  const detail = usePublicCustomListQuery(profileUserId, listId, true)
  const images = useMemo(() => {
    const items = detail.data?.list?.items ?? []
    return items
      .map((item) => item.image)
      .filter((src): src is string => Boolean(src))
      .slice(0, 4)
  }, [detail.data?.list?.items])

  return (
    <Link
      to={`/u/${encodeURIComponent(profileUserId)}/lists/${encodeURIComponent(listId)}`}
      className={cn(
        PROFILE_PANEL_CLASS,
        'min-w-0 rounded-2xl p-2.5 text-right active:opacity-90'
      )}
    >
      <ListPosterGrid images={images} />
      <p className="mt-2 line-clamp-1 text-sm font-semibold text-foreground">{name}</p>
      <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
        {toPersianDigits(itemCount)} انیمه
      </p>
    </Link>
  )
}

const OwnPlaylistCard = ({ list }: { list: ShioriCustomList }) => {
  const { data: cards = [] } = useFavoriteAnimeCardsQuery(list.animeIds.slice(0, 8))
  const images = useMemo(
    () => cards.map((card) => card.image).filter((src): src is string => Boolean(src)).slice(0, 4),
    [cards]
  )

  return (
    <Link
      to={`/my-list/lists/${encodeURIComponent(list.id)}`}
      className={cn(
        PROFILE_PANEL_CLASS,
        'min-w-0 rounded-2xl p-2.5 text-right active:opacity-90'
      )}
    >
      <ListPosterGrid images={images} />
      <p className="mt-2 line-clamp-1 text-sm font-semibold text-foreground">{list.name}</p>
      <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
        {toPersianDigits(list.animeIds.length)} انیمه
      </p>
    </Link>
  )
}

export const ProfilePlaylistsTabPanel = ({
  profileUserId,
  variant,
}: ProfilePlaylistsTabPanelProps) => {
  const { data, isLoading } = usePublicCustomListsQuery(profileUserId, variant === 'public')
  const { customLists } = useCustomLists({ syncRemote: variant === 'own' })
  const publicLists = data?.lists ?? []
  const ownLists = useMemo(
    () => [...customLists].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [customLists]
  )
  const [createOpen, setCreateOpen] = useState(false)
  const title = variant === 'own' ? 'پلی‌لیست‌های من' : 'پلی‌لیست‌ها'
  const publicVisibility =
    publicLists.length > 0 ? 'public' : (data?.visibility ?? 'none')

  return (
    <section className="mx-4 mt-5 min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[15.5px] font-bold text-foreground">{title}</h2>
        {variant === 'own' ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className={cn(
              SHIORI_PRIMARY_BUTTON_CLASS,
              'inline-flex h-[38px] shrink-0 items-center gap-1 rounded-xl px-3 text-sm font-medium text-white active:opacity-90'
            )}
          >
            <Plus className="size-3.5" aria-hidden />
            جدید
          </button>
        ) : null}
      </div>

      {variant === 'own' ? (
        ownLists.length === 0 ? (
          <ExploreEmptyState
            compact
            showImage={false}
            title="پلی‌لیستی نداری"
            subtitle="اولین پلی‌لیستت را بساز."
            actionLabel="ایجاد پلی‌لیست"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <div className="grid min-w-0 grid-cols-2 gap-3">
            {ownLists.map((list) => (
              <OwnPlaylistCard key={list.id} list={list} />
            ))}
          </div>
        )
      ) : isLoading ? (
        <SocialListSkeleton rows={3} />
      ) : publicLists.length === 0 ? (
        <ExploreEmptyState
          compact
          showImage={false}
          title={
            publicVisibility === 'private'
              ? 'لیست‌های این کاربر خصوصی است'
              : 'پلی‌لیستی وجود ندارد'
          }
        />
      ) : (
        <div className="grid min-w-0 grid-cols-2 gap-3">
          {publicLists.map((list) => (
            <PlaylistCard
              key={list.id}
              profileUserId={profileUserId}
              listId={list.id}
              name={list.name}
              itemCount={list.item_count}
            />
          ))}
        </div>
      )}

      {variant === 'own' ? (
        <CreateShioriListSheet open={createOpen} onOpenChange={setCreateOpen} />
      ) : null}
    </section>
  )
}
