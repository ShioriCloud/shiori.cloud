import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileUserListRow } from '@/components/profile/ProfileUserListRow'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { Input } from '@/components/ui/input'
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
            to="/profile?tab=feed"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            فید
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold">جست‌وجوی کاربران</h1>
          <span className="w-12" aria-hidden />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {!enabled ? (
          <ExploreEmptyState
            compact
            showImage={false}
            title="سوشال فعال نیست"
            subtitle="جست‌وجوی کاربران وقتی پروفایل اجتماعی برایت باز شود در دسترس است."
          />
        ) : (
          <>
            <div className="relative">
              <Search
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="نام یا آیدی تلگرام…"
                className="h-11 pr-10 text-right"
                autoFocus
              />
            </div>

            {query.trim().length > 0 && query.trim().length < 2 ? (
              <p className="text-center text-xs text-muted-foreground">حداقل ۲ حرف بنویس</p>
            ) : null}

            {isFetching ? (
              <div className="space-y-2 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted/70" />
                ))}
              </div>
            ) : isError ? (
              <ExploreEmptyState compact showImage={false} title="خطا در جست‌وجو" subtitle="دوباره تلاش کن." />
            ) : data?.items.length ? (
              <MyListCompactCard className="overflow-hidden divide-y divide-border/40">
                {data.items.map((row) => (
                  <ProfileUserListRow key={row.telegram_user_id} user={row} />
                ))}
              </MyListCompactCard>
            ) : query.trim().length >= 2 ? (
              <ExploreEmptyState
                compact
                showImage={false}
                title="کسی پیدا نشد"
                subtitle="نام یا آیدی دیگری را امتحان کن."
              />
            ) : (
              <p className="px-2 text-center text-xs leading-6 text-muted-foreground">
                برای پیدا کردن دوستان، نام یا آیدی تلگرامشان را جست‌وجو کن.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProfilePeopleSearch
