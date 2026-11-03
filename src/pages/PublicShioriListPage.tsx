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

const PublicShioriListPage = () => {
  const { telegramUserId: rawUserId, listId: rawListId } = useParams<{
    telegramUserId: string
    listId: string
  }>()
  const telegramUserId = rawUserId?.trim() ?? ''
  const listId = rawListId?.trim() ?? ''
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
    list != null ? `${toPersianDigits(list.item_count)} انیمه` : undefined

  return (
    <ProfilePersonalSubpageLayout
      title={pageTitle}
      description={pageDescription}
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
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-muted/35 text-muted-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-sm font-semibold text-foreground">{list.name}</p>
              <p className="text-xs text-muted-foreground">
                پلی‌لیست عمومی · {toPersianDigits(list.item_count)} انیمه
              </p>
            </div>
          </div>

          {list.items.length === 0 ? (
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
        </>
      )}
    </ProfilePersonalSubpageLayout>
  )
}

export default PublicShioriListPage
