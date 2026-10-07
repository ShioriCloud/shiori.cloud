import { Link } from 'react-router-dom'
import { Languages } from 'lucide-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { HomeRailScroller, HomeRailSlide } from '@/components/home/HomeRailScroller'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'

const DEFAULT_VISIBLE = 4

type ProfileTranslationsRailProps = {
  translator: NonNullable<SocialProfileMe['translator']>
  profileUserId: string
  maxVisible?: number
}

export const ProfileTranslationsRail = ({
  translator,
  profileUserId,
  maxVisible = DEFAULT_VISIBLE,
}: ProfileTranslationsRailProps) => {
  const total = translator.anime_count
  if (total === 0) return null

  const visible = translator.anime.slice(0, maxVisible)
  const remaining = Math.max(0, total - visible.length)
  const allPath = `/u/${encodeURIComponent(profileUserId)}/translations`

  return (
    <div className="mt-6">
      <h2 className="mb-3 px-4 text-sm font-semibold text-foreground">ترجمه‌هاش</h2>

      <div className="mx-4 mb-3 overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-background to-fuchsia-500/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              'border border-violet-400/30 bg-violet-500/15 text-violet-300'
            )}
          >
            <Languages className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 text-right">
            <p className="text-sm font-semibold text-foreground">مترجم شیوری</p>
            <p className="text-xs text-muted-foreground">
              {toPersianDigits(total)} اثر در کاتالوگ
            </p>
          </div>
        </div>
      </div>

      <HomeRailScroller restoreKey={`profile-translations:${profileUserId}`} className="px-4">
        {visible.map((item) => {
          const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
          return (
            <HomeRailSlide key={item.anime_id} className="w-[100px]">
              <AnimePrefetchLink
                animeId={animePublicSegment(routeRef)}
                to={animeDetailPath(routeRef)}
                className="group block active:scale-[0.98] transition-transform"
                aria-label={`مشاهده ${item.title}`}
              >
                <div className="media-card-skeuo rounded-xl">
                  <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-violet-600/85 px-1.5 py-0.5 text-[9px] font-medium text-white">
                      مترجم
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-2 pt-8">
                      <BidiText
                        as="p"
                        className="text-[10px] font-semibold text-white line-clamp-2 text-left"
                      >
                        {item.title}
                      </BidiText>
                    </div>
                  </div>
                </div>
              </AnimePrefetchLink>
            </HomeRailSlide>
          )
        })}
        {remaining > 0 ? (
          <HomeRailSlide className="w-[100px]">
            <Link
              to={allPath}
              className="flex h-full min-h-[148px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/30 px-2 text-center active:scale-[0.98] transition-transform"
            >
              <span className="text-lg font-bold text-primary-400">+{toPersianDigits(remaining)}</span>
              <span className="mt-1 text-[10px] font-medium text-muted-foreground">اثر دیگه</span>
              <span className="mt-2 text-[10px] font-semibold text-primary-400">مشاهده همه</span>
            </Link>
          </HomeRailSlide>
        ) : total > maxVisible ? (
          <HomeRailSlide className="w-[88px]">
            <Link
              to={allPath}
              className="flex h-full min-h-[148px] items-center justify-center rounded-xl border border-border/60 bg-card px-2 text-center text-[11px] font-semibold text-primary-400 active:scale-[0.98]"
            >
              مشاهده همه
            </Link>
          </HomeRailSlide>
        ) : null}
      </HomeRailScroller>
    </div>
  )
}
