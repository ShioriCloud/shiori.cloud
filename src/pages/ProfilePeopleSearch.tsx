import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { SocialPeopleSearchField } from '@/components/profile/social/SocialPeopleSearchField'
import { SocialUserRow } from '@/components/profile/social/SocialUserRow'
import { SOCIAL_DIVIDER_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { cn } from '@/lib/utils'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialProfileMe, useSocialUserSearch } from '@/hooks/useSocialProfile'

const ProfilePeopleSearch = () => {
  const { user } = useAppAuth()
  const { data: socialMe } = useSocialProfileMe(Boolean(user))
  const [query, setQuery] = useState('')
  const enabled = socialMe?.enabled === true
  const { data, isFetching, isError } = useSocialUserSearch(query, enabled && Boolean(user))

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <Link
            to="/feed"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            فید
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold">جست‌وجوی کاربران</h1>
          <span className="w-12" aria-hidden />
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        {!enabled ? (
          <ExploreEmptyState
            compact
            showImage={false}
            title="سوشال فعال نیست"
            subtitle="جست‌وجوی کاربران وقتی پروفایل اجتماعی برایت باز شود در دسترس است."
          />
        ) : (
          <>
            <SocialPeopleSearchField
              value={query}
              onChange={setQuery}
              autoFocus
            />

            {query.trim().length > 0 && query.trim().length < 2 ? (
              <p className="text-center text-xs text-muted-foreground">حداقل ۲ حرف بنویس</p>
            ) : null}

            {isFetching ? (
              <SocialListSkeleton rows={3} />
            ) : isError ? (
              <ExploreEmptyState compact showImage={false} title="خطا در جست‌وجو" subtitle="دوباره تلاش کن." />
            ) : data?.items.length ? (
              <div className={cn(SOCIAL_SURFACE_CLASS, SOCIAL_DIVIDER_CLASS)}>
                {data.items.map((row) => (
                  <SocialUserRow key={row.telegram_user_id} user={row} />
                ))}
              </div>
            ) : query.trim().length >= 2 ? (
              <ExploreEmptyState
                compact
                title="کسی پیدا نشد"
                subtitle="نام یا آیدی دیگری را امتحان کن."
              />
            ) : (
              <div className={cn(SOCIAL_SURFACE_CLASS, 'px-4 py-6 text-center')}>
                <p className="text-sm font-medium text-foreground">پیدا کردن دوستان</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  نام نمایشی یا آیدی تلگرام را جست‌وجو کن و از پروفایلشان دنبال کن.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProfilePeopleSearch
