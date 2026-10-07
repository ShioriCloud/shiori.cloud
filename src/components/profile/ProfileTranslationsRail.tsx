import { Link } from 'react-router-dom'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { HomeRailScroller, HomeRailSlide } from '@/components/home/HomeRailScroller'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianDigits } from '@/lib/persianDigits'

const DEFAULT_VISIBLE = 5

const joinRolesFa = (roles: string[]): string => {
  if (roles.length === 0) return 'مترجم'
  if (roles.length === 1) return roles[0]!
  if (roles.length === 2) return `${roles[0]} و ${roles[1]}`
  return `${roles.slice(0, -1).join('، ')} و ${roles[roles.length - 1]}`
}

/** Unique roles from linked works; empty/missing role → مترجم. */
export const formatTranslatorRoleLine = (
  anime: Array<{ role: string | null }>
): string => {
  const seen = new Set<string>()
  const ordered: string[] = []
  for (const item of anime) {
    const raw = String(item.role ?? '').trim() || 'مترجم'
    if (seen.has(raw)) continue
    seen.add(raw)
    ordered.push(raw)
  }
  return joinRolesFa(ordered)
}

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
  const allPath = `/u/${encodeURIComponent(profileUserId)}/translations`
  const roleLine = formatTranslatorRoleLine(translator.anime)

  return (
    <div className="mx-4 mt-6">
      <MyListCompactCard className="overflow-hidden">
        <div className="flex items-start gap-3 px-3 pt-3 pb-2">
          <div className="min-w-0 flex-1 text-right">
            <h2 className="text-sm font-semibold text-foreground">ترجمه‌هاش</h2>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              {roleLine}
              <span className="mx-1 text-border">·</span>
              {toPersianDigits(total)} اثر
            </p>
          </div>
          <Link
            to={allPath}
            className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold text-primary-400 hover:bg-primary-400/10 active:bg-primary-400/15"
          >
            مشاهده همه
          </Link>
        </div>

        <div className="pb-3">
          <HomeRailScroller
            restoreKey={`profile-translations:${profileUserId}`}
            className="px-3"
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
      </MyListCompactCard>
    </div>
  )
}
