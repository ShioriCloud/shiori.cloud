import { Languages } from 'lucide-react'
import { ProfileSectionMoreLink } from '@/components/profile/ProfileSectionMoreLink'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { HomeRailScroller, HomeRailSlide } from '@/components/home/HomeRailScroller'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import {
  profileHighlightGlowClass,
  profileHighlightSectionClass,
} from '@/components/profile/profileHighlightCard'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import { sortTranslatorWorksNewestFirst } from '@/lib/translatorWorksSort'

const DEFAULT_VISIBLE = 5

type ProfileTranslationsRailProps = {
  translator: NonNullable<SocialProfileMe['translator']>
  profileUserId: string
  maxVisible?: number
  /** Section title — own profile vs another user. */
  title?: string
  className?: string
}

export const ProfileTranslationsRail = ({
  translator,
  profileUserId,
  maxVisible = DEFAULT_VISIBLE,
  title = 'آثار برتر',
  className,
}: ProfileTranslationsRailProps) => {
  const total = translator.anime_count
  if (total === 0) return null

  const visible = sortTranslatorWorksNewestFirst(translator.anime).slice(0, maxVisible)
  const allPath = `/u/${encodeURIComponent(profileUserId)}/translations`

  return (
    <div className={cn('mx-4 mt-2.5', className)}>
      <section className={profileHighlightSectionClass('sky')}>
        <div className={profileHighlightGlowClass('right', 'sky')} aria-hidden />
        <div
          className={cn(profileHighlightGlowClass('left', 'primary'), 'bottom-0 top-auto')}
          aria-hidden
        />

        <div className="relative px-3.5 pt-3.5 pb-2.5">
          <div className="flex items-start gap-2.5">
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                'border border-sky-400/25 bg-sky-400/15 text-sky-600 dark:text-sky-300'
              )}
            >
              <Languages className="h-4 w-4" aria-hidden />
            </span>

            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground tabular-nums">
                {toPersianDigits(total)} اثر
              </p>
            </div>

            <ProfileSectionMoreLink to={allPath} className="mt-0.5 shrink-0 self-center" />
          </div>
        </div>

        <div className="relative pb-3.5">
          <HomeRailScroller
            restoreKey={`profile-translations:${profileUserId}`}
            className="px-3.5"
          >
            {visible.map((item) => {
              const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
              const roleLabel = String(item.role ?? '').trim() || 'مترجم'
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
                        <span className="absolute left-1.5 top-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-medium text-white">
                          {roleLabel}
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
          </HomeRailScroller>
        </div>
      </section>
    </div>
  )
}
