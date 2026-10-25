import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { ProfileCommentActivityList } from '@/components/profile/ProfileCommentActivityList'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { useAnimeCommentsAccess, useMyAnimeCommentsQuery } from '@/hooks/useAnimeComments'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialProfileMe } from '@/hooks/useSocialProfile'
import { SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import { PersonalSection } from './PersonalSection'

export const PersonalSocialBlock = () => {
  const { user, isReady, inTelegram } = useAppAuth()
  const { data: commentsAccess } = useAnimeCommentsAccess(isReady && (inTelegram || Boolean(user)))
  const { data: socialMe } = useSocialProfileMe(Boolean(user))
  const enabled = commentsAccess?.enabled === true && socialMe?.enabled === true
  const { data, isLoading } = useMyAnimeCommentsQuery(Boolean(user) && enabled, 1, 5)

  if (!enabled) return null

  const total = data?.total ?? 0
  const items = data?.items ?? []

  return (
    <PersonalSection
      title="اجتماعی"
      subtitle="نظرها و فعالیت‌هایت در انیمه‌ها"
      accent="emerald"
      action={
        <Link
          to="/profile/activity"
          className="text-xs font-medium text-primary-400"
        >
          همه
        </Link>
      }
    >
      {isLoading ? (
        <SocialListSkeleton rows={2} />
      ) : items.length === 0 ? (
        <div className={cn(SOCIAL_SURFACE_CLASS, 'px-4 py-8 text-center text-sm text-muted-foreground')}>
          هنوز نظری ننوشتی.
        </div>
      ) : (
        <>
          <ProfileCommentActivityList items={items} tone="self" />
          {total > items.length ? (
            <Link
              to="/profile/activity"
              className="flex h-11 w-full items-center justify-center gap-1 rounded-xl border border-emerald-400/25 bg-emerald-400/5 text-sm font-medium text-emerald-800 dark:text-emerald-200"
            >
              {toPersianDigits(total)} نظر
              <ChevronLeft className="h-4 w-4 opacity-70" />
            </Link>
          ) : null}
        </>
      )}
    </PersonalSection>
  )
}
