import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { usePublicCustomListQuery, usePublicCustomListsQuery } from '@/hooks/usePublicCustomLists'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

type ProfilePlaylistsTabPanelProps = {
  profileUserId: string
  profileBase: string
  variant: 'own' | 'public'
}

const ListPosterGrid = ({ images }: { images: string[] }) => {
  const cells = Array.from({ length: 4 }, (_, i) => images[i] ?? null)
  return (
    <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-lg bg-muted/60">
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
            <div className="absolute inset-0 bg-background/80" />
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
        'w-[7.25rem] shrink-0 rounded-xl border border-border/70 bg-card p-2 text-start',
        'transition-colors active:bg-muted/30'
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
  profileBase,
  variant,
}: ProfilePlaylistsTabPanelProps) => {
  const { data, isLoading } = usePublicCustomListsQuery(profileUserId, true)
  const lists = data?.lists ?? []

  if (isLoading) {
    return <SocialListSkeleton rows={3} />
  }

  if (lists.length === 0) {
    return (
      <ExploreEmptyState
        title="پلی‌لیست عمومی نیست"
        subtitle={
          variant === 'own'
            ? 'از تب شخصی یک لیست را عمومی کن تا اینجا دیده شود.'
            : 'این کاربر هنوز لیست عمومی ندارد.'
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-none">
        <div className="flex w-max gap-2.5">
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
      </div>

      {variant === 'own' ? (
        <Link
          to="/profile?tab=personal"
          className="block text-center text-sm font-medium text-primary-400"
        >
          مدیریت پلی‌لیست‌ها در تب شخصی
        </Link>
      ) : (
        <span className="sr-only">{profileBase}</span>
      )}
    </div>
  )
}
