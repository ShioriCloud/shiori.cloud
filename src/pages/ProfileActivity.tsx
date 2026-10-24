import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useMyAnimeCommentsQuery } from '@/hooks/useAnimeComments'
import { useSocialProfileMe } from '@/hooks/useSocialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianDigits } from '@/lib/persianDigits'

const ProfileActivity = () => {
  const { user } = useAppAuth()
  const { data: socialMe } = useSocialProfileMe(Boolean(user))
  const enabled = socialMe?.enabled === true
  const { data, isLoading, isError, refetch } = useMyAnimeCommentsQuery(Boolean(user) && enabled)

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <Link
            to="/profile?tab=personal"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            پروفایل
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold">نظرات و فعالیت</h1>
          <span className="w-12" aria-hidden />
        </div>
      </div>

      <div className="space-y-3 px-4 pt-4">
        {!enabled ? (
          <ExploreEmptyState
            compact
            showImage={false}
            title="به‌زودی"
            subtitle="وقتی سوشال برایت فعال شود، نظراتت اینجا جمع می‌شود."
          />
        ) : isLoading ? (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/70" />
            ))}
          </div>
        ) : isError ? (
          <ExploreEmptyState
            title="بارگذاری ناموفق بود"
            actionLabel="تلاش مجدد"
            onAction={() => void refetch()}
          />
        ) : !data?.items.length ? (
          <ExploreEmptyState
            compact
            showImage={false}
            title="هنوز نظری نداری"
            subtitle="از صفحهٔ انیمه اولین نظرت را بنویس."
          />
        ) : (
          data.items.map((item) => {
            const anime = item.anime
            const routeRef = anime
              ? { id: anime.id, slug: anime.slug, title: anime.title }
              : null
            const inner = (
              <MyListCompactCard className="flex gap-3 overflow-hidden px-3 py-3">
                <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {anime?.image ? (
                    <img src={anime.image} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[11px] text-muted-foreground">
                    {item.parent_id ? 'پاسخ دادی' : 'نظر گذاشتی'}
                    {item.like_count > 0
                      ? ` · ${toPersianDigits(item.like_count)} پسند`
                      : ''}
                  </p>
                  <BidiText as="p" className="mt-0.5 line-clamp-2 text-sm font-semibold text-foreground">
                    {anime?.title ?? 'انیمه'}
                  </BidiText>
                  <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </MyListCompactCard>
            )

            if (!routeRef) return <div key={item.id}>{inner}</div>

            return (
              <AnimePrefetchLink
                key={item.id}
                animeId={animePublicSegment(routeRef)}
                to={`${animeDetailPath(routeRef)}?tab=comments`}
                className="block active:scale-[0.99] transition-transform"
              >
                {inner}
              </AnimePrefetchLink>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ProfileActivity
