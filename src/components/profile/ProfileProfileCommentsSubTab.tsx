import { Link } from 'react-router-dom'
import { MessageSquareText } from 'lucide-react'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileCommentActivityList } from '@/components/profile/ProfileCommentActivityList'
import {
  profileHighlightGlowClass,
  profileHighlightSectionClass,
} from '@/components/profile/profileHighlightCard'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useMyAnimeCommentsQuery, useUserAnimeCommentsQuery } from '@/hooks/useAnimeComments'
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

  return (
    <div className="mx-4 mt-2 space-y-3">
      <section className={profileHighlightSectionClass('emerald')}>
        <div className={profileHighlightGlowClass('right', 'emerald')} aria-hidden />
        <div className={cn(profileHighlightGlowClass('left', 'primary'), 'opacity-40')} aria-hidden />
        <div className="relative px-3.5 py-3 text-right" dir="rtl">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                'border border-emerald-400/30 bg-emerald-400/12 text-emerald-700 dark:text-emerald-200'
              )}
            >
              <MessageSquareText className="h-4 w-4" aria-hidden />
            </span>
            <h2 className="text-sm font-semibold text-foreground">{sectionTitle}</h2>
          </div>
        </div>
      </section>

      <ProfileCommentActivityList items={items} tone={variant === 'own' ? 'self' : 'public'} />
      {variant === 'own' ? (
        <Link to="/profile/activity" className="block text-center text-xs font-medium text-primary-400">
          همه نظرات
        </Link>
      ) : (
        <Link
          to={`/u/${encodeURIComponent(profileUserId)}/activity`}
          className="block text-center text-xs font-medium text-primary-400"
        >
          همه نظرات
        </Link>
      )}
    </div>
  )
}
