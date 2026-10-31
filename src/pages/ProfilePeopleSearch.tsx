import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { SocialPeopleSearchField } from '@/components/profile/social/SocialPeopleSearchField'
import { SocialUserRow } from '@/components/profile/social/SocialUserRow'
import { SOCIAL_DIVIDER_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { cn } from '@/lib/utils'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialUserSearch } from '@/hooks/useSocialProfile'

const ProfilePeopleSearch = () => {
  const { user } = useAppAuth()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q')?.trim() ?? '')
  const { data, isFetching, isError } = useSocialUserSearch(query, Boolean(user))

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="space-y-4 px-4 pt-4">
        <h1 className="text-lg font-semibold">جست‌وجوی کاربران</h1>
        <SocialPeopleSearchField value={query} onChange={setQuery} autoFocus />

        {query.trim().length > 0 && query.trim().length < 2 ? (
          <p className="text-center text-xs text-muted-foreground">حداقل ۲ حرف بنویس</p>
        ) : null}

        {isFetching ? (
          <SocialListSkeleton rows={3} />
        ) : isError ? (
          <ExploreEmptyState
            compact
            showImage={false}
            title="خطا در جست‌وجو"
            subtitle="دوباره تلاش کن."
          />
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
      </div>
    </div>
  )
}

export default ProfilePeopleSearch
