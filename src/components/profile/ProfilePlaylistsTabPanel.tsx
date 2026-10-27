import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { getListIcon } from '@/components/my-list/listIcons'
import { usePublicCustomListQuery, usePublicCustomListsQuery } from '@/hooks/usePublicCustomLists'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { SOCIAL_DIVIDER_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type ProfilePlaylistsTabPanelProps = {
  profileUserId: string
  profileBase: string
  variant: 'own' | 'public'
}

export const ProfilePlaylistsTabPanel = ({
  profileUserId,
  profileBase,
  variant,
}: ProfilePlaylistsTabPanelProps) => {
  const { data, isLoading } = usePublicCustomListsQuery(profileUserId, true)
  const lists = data?.lists ?? []
  const [expandedId, setExpandedId] = useState<string | null>(lists[0]?.id ?? null)

  const detail = usePublicCustomListQuery(profileUserId, expandedId ?? '', Boolean(expandedId))

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
      <div className={cn(SOCIAL_SURFACE_CLASS, SOCIAL_DIVIDER_CLASS, 'overflow-hidden')}>
        {lists.map((list) => {
          const { Icon } = getListIcon(
            (list.icon as 'heart' | 'star' | 'fire' | 'bookmark' | 'sparkle') ?? 'heart'
          )
          const active = expandedId === list.id
          return (
            <button
              key={list.id}
              type="button"
              onClick={() => setExpandedId(list.id)}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-3 text-right transition-colors',
                active ? 'bg-violet-400/10' : 'hover:bg-muted/30'
              )}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-400/10 text-violet-600 dark:text-violet-300"
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{list.name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {toPersianDigits(list.item_count)} انیمه
                </span>
              </span>
              <ChevronLeft
                className={cn('h-4 w-4 shrink-0 transition-transform', active && 'rotate-90')}
              />
            </button>
          )
        })}
      </div>

      {expandedId && detail.data?.list?.items?.length ? (
        <div className={cn(SOCIAL_SURFACE_CLASS, 'grid grid-cols-3 gap-2 p-2')}>
          {detail.data.list.items.map((item) => {
            const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
            return (
              <AnimePrefetchLink
                key={item.anime_id}
                animeId={animePublicSegment(routeRef)}
                to={animeDetailPath(routeRef)}
                className="block overflow-hidden rounded-xl active:scale-[0.98]"
              >
                <div className="relative aspect-[2/3] bg-muted">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-1.5">
                    <BidiText as="p" className="line-clamp-2 text-[9px] font-semibold text-white">
                      {item.title}
                    </BidiText>
                  </div>
                </div>
              </AnimePrefetchLink>
            )
          })}
        </div>
      ) : null}

      {variant === 'own' ? (
        <Link
          to="/profile"
          className="block text-center text-sm font-medium text-primary-400"
        >
          مدیریت پلی‌لیست‌ها در تب شخصی
        </Link>
      ) : (
        <Link
          to={`${profileBase}?tab=library&lib=playlists`}
          className="sr-only"
        >
          playlists
        </Link>
      )}
    </div>
  )
}
