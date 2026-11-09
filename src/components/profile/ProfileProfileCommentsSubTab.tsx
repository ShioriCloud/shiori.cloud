import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileCommentActivityList } from '@/components/profile/ProfileCommentActivityList'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useMyAnimeCommentsQuery, useUserAnimeCommentsQuery } from '@/hooks/useAnimeComments'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

type ProfileProfileCommentsSubTabProps = {
  variant: 'own' | 'public'
  profileUserId: string
}

export const ProfileProfileCommentsSubTab = ({
  variant,
  profileUserId,
}: ProfileProfileCommentsSubTabProps) => {
  const { user, isReady, inTelegram } = useAppAuth()
  const canLoad = isReady && (inTelegram || Boolean(user))

  const ownQuery = useMyAnimeCommentsQuery(variant === 'own' && canLoad, 1, 20)
  const publicQuery = useUserAnimeCommentsQuery(
    profileUserId,
    variant === 'public' && canLoad && profileUserId.length > 0,
    1,
    20
  )

  const query = variant === 'own' ? ownQuery : publicQuery
  const items = query.data?.items ?? []
  const sectionTitle = variant === 'own' ? 'نظرات اخیر من' : 'نظرات اخیر'

  if (!canLoad || query.isPending) {
    return <p className="px-4 py-6 text-center text-sm text-muted-foreground">در حال بارگذاری…</p>
  }

  if (query.isError) {
    return (
      <ExploreEmptyState
        compact
        showImage={false}
        title="بارگذاری ناموفق بود"
        actionLabel="تلاش مجدد"
        onAction={() => void query.refetch()}
      />
    )
  }

  if (items.length === 0) {
    return (
      <ExploreEmptyState
        compact
        showImage={false}
        title="هنوز نظری نیست"
        subtitle={variant === 'own' ? 'اولین نظرت را زیر یک انیمه بنویس.' : 'این کاربر هنوز نظری نگذاشته.'}
      />
    )
  }

  const total = query.data?.total ?? items.length

  return (
    <section className="mx-4 mt-5">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[15.5px] font-bold leading-snug text-foreground">{sectionTitle}</h2>
        <span
          className={cn(
            'shrink-0 rounded-full border border-violet-400/25 bg-violet-400/15',
            'px-2 py-0.5 text-xs font-medium text-violet-800 dark:text-violet-200'
          )}
        >
          {toPersianDigits(total)}
        </span>
      </div>
      <ProfileCommentActivityList items={items} />
    </section>
  )
}
