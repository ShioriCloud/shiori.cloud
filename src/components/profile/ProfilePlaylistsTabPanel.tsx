import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { CreateShioriListSheet } from '@/components/my-list/CreateShioriListSheet'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { usePublicCustomListQuery, usePublicCustomListsQuery } from '@/hooks/usePublicCustomLists'
import { toPersianDigits } from '@/lib/persianDigits'
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
        'min-w-0 rounded-2xl border border-border/70 bg-card p-2.5 text-right',
        'dark:border-[#1e1e24] dark:bg-[#141418]',
        'active:opacity-85'
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

export const ProfilePlaylistsTabPanel = ({
  profileUserId,
  variant,
}: ProfilePlaylistsTabPanelProps) => {
  const { data, isLoading } = usePublicCustomListsQuery(profileUserId, true)
  const lists = data?.lists ?? []
  const [createOpen, setCreateOpen] = useState(false)
  const title = variant === 'own' ? 'پلی‌لیست‌های من' : 'پلی‌لیست‌ها'

  return (
    <section className="mx-4 mt-5 min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[15.5px] font-bold text-foreground">{title}</h2>
        {variant === 'own' ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#3a2766] bg-primary-500/15 px-3 py-1 text-xs font-semibold text-[#a78bfa] active:opacity-80"
          >
            <Plus className="size-3.5" aria-hidden />
            جدید
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <SocialListSkeleton rows={3} />
      ) : lists.length === 0 ? (
        <ExploreEmptyState
          compact
          showImage={false}
          title="پلی‌لیست عمومی نیست"
          subtitle={
            variant === 'own'
              ? 'با دکمهٔ جدید یک لیست بساز و عمومی‌اش کن تا اینجا دیده شود.'
              : 'این کاربر هنوز لیست عمومی ندارد.'
          }
        />
      ) : (
        <div className="grid min-w-0 grid-cols-2 gap-3">
          {lists.map((list) => (
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
