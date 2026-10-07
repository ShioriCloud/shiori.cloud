import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Users } from 'lucide-react'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'

const ProfileFollowList = () => {
  const { pathname } = useLocation()
  const isFollowing = pathname.endsWith('/following')
  const title = isFollowing ? 'دنبال‌شده‌ها' : 'دنبال‌کننده‌ها'

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            پروفایل
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold">{title}</h1>
          <span className="w-12" aria-hidden />
        </div>
      </div>

      <div className="px-4 pt-6">
        <MyListCompactCard className="overflow-hidden">
          <ExploreEmptyState
            compact
            showImage={false}
            title={
              isFollowing ? 'هنوز کسی را دنبال نکرده‌ای' : 'هنوز دنبال‌کننده‌ای نیست'
            }
            subtitle="شبکه اجتماعی شیوری به‌زودی فعال می‌شود."
          />
          <div className="flex justify-center pb-4 text-muted-foreground">
            <Users className="h-5 w-5 opacity-50" aria-hidden />
          </div>
        </MyListCompactCard>
      </div>
    </div>
  )
}

export default ProfileFollowList
