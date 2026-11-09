import { useParams } from 'react-router-dom'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import { getListIcon } from '@/components/my-list/listIcons'
import { isShioriListIcon } from '@/store/myListStore'
import { MyListAnimeRow } from '@/components/my-list/MyListAnimeRow'
import { MyListPoster } from '@/components/my-list/MyListUi'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { useAppAuth } from '@/hooks/useAppAuth'
import { usePublicCustomListQuery } from '@/hooks/usePublicCustomLists'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import { profileScrollKey, useTabScrollRestoration } from '@/hooks/useTabScrollRestoration'

const PublicShioriListPage = () => {
  const { telegramUserId: rawUserId, listId: rawListId } = useParams<{
    telegramUserId: string
    listId: string
  }>()
  const telegramUserId = rawUserId?.trim() ?? ''
  const listId = rawListId?.trim() ?? ''
  useTabScrollRestoration(profileScrollKey('list', telegramUserId, listId))
  const { user } = useAppAuth()
  const { data, isLoading, isError, refetch } = usePublicCustomListQuery(
    telegramUserId,
    listId,
    Boolean(user)
  )

  const list = data?.list
  const listIcon = list?.icon && isShioriListIcon(list.icon) ? list.icon : 'heart'
  const { Icon } = getListIcon(listIcon)
  const pageTitle = list?.name ?? 'پلی‌لیست'
  const pageDescription =
    list != null
      ? `پلی‌لیست عمومی · ${toPersianDigits(list.item_count)} انیمه`
      : undefined

  const titleLeading =
    list != null ? (
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl border border-border/50',
          'bg-muted/35 text-muted-foreground'
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
    ) : undefined

  return (
    <ProfilePersonalSubpageLayout
      title={pageTitle}
      description={pageDescription}
      titleLeading={titleLeading}
      contentClassName="space-y-4"
    >
      {!data?.enabled ? (
        <ExploreEmptyState
          compact
          showImage={false}
          title="لیست در دسترس نیست"
          subtitle="این پلی‌لیست عمومی فعلاً قابل مشاهده نیست."
        />
      ) : isLoading ? (
        <SocialListSkeleton rows={4} />
      ) : isError || !list ? (
        <ExploreEmptyState
          title="لیست پیدا نشد"
          subtitle="ممکن است خصوصی شده باشد."
          actionLabel="تلاش مجدد"
          onAction={() => void refetch()}
        />
      ) : list.items.length === 0 ? (
        <MyListCompactCard className="p-4 text-center text-sm text-muted-foreground">
          این لیست هنوز خالی است.
        </MyListCompactCard>
      ) : (
        <MyListCompactCard className="overflow-hidden divide-y divide-border/40">
          {list.items.map((item) => {
            const routeRef = {
              id: item.anime_id,
              slug: item.slug,
              title: item.title,
            }
            return (
              <MyListAnimeRow
                key={item.anime_id}
                image={item.image}
                link={
                  <AnimePrefetchLink
                    animeId={animePublicSegment(routeRef)}
                    to={animeDetailPath(routeRef)}
                    className="shrink-0 transition-transform active:scale-[0.97]"
                  >
                    <MyListPoster src={item.image} />
                  </AnimePrefetchLink>
                }
                title={
                  <AnimePrefetchLink
                    animeId={animePublicSegment(routeRef)}
                    to={animeDetailPath(routeRef)}
                    className="block text-right"
                  >
                    <BidiText className="line-clamp-2 text-sm font-semibold text-foreground">
                      {item.title}
                    </BidiText>
                  </AnimePrefetchLink>
                }
              />
            )
          })}
        </MyListCompactCard>
      )}
    </ProfilePersonalSubpageLayout>
  )
}

export default PublicShioriListPage
