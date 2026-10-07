import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Languages } from 'lucide-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { useSocialProfileUser } from '@/hooks/useSocialProfile'
import { useAppAuth } from '@/hooks/useAppAuth'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'

const UserTranslationsPage = () => {
  const { telegramUserId: rawId } = useParams<{ telegramUserId: string }>()
  const telegramUserId = rawId?.trim() ?? ''
  const { user, isReady } = useAppAuth()
  const { data, isLoading, isError } = useSocialProfileUser(telegramUserId, Boolean(user), 1, 100)

  const profilePath = `/u/${encodeURIComponent(telegramUserId)}`
  const translator = data?.translator ?? null
  const displayName = data?.profile?.display_name ?? 'کاربر'

  if (!isReady) return null

  if (!telegramUserId || isError || (!isLoading && !translator)) {
    return (
      <div className="bg-background pb-24 text-foreground">
        <Header backTo={profilePath} title="ترجمه‌ها" />
        <div className="px-4 pt-8">
          <ExploreEmptyState title="ترجمه‌ای نیست" subtitle="این کاربر مترجم متصل ندارد." />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background pb-24 text-foreground">
      <Header backTo={profilePath} title="ترجمه‌ها" />

      <div className="px-4 pt-4">
        <div
          className={cn(
            'mb-5 overflow-hidden rounded-2xl border border-violet-500/25',
            'bg-gradient-to-br from-violet-500/15 via-background to-fuchsia-500/10 p-4'
          )}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/15 text-violet-300">
              <Languages className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 text-right">
              <p className="text-base font-semibold text-foreground">{displayName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                مترجم شیوری · {toPersianDigits(translator?.anime_count ?? 0)} اثر
              </p>
              {translator?.bio ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                  {translator.bio}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-muted/70" />
            ))}
          </div>
        ) : translator && translator.anime.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {translator.anime.map((item) => {
              const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
              return (
                <AnimePrefetchLink
                  key={item.anime_id}
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
                      {item.role ? (
                        <span className="absolute left-1.5 top-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-medium text-white">
                          {item.role}
                        </span>
                      ) : null}
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
              )
            })}
          </div>
        ) : (
          <ExploreEmptyState compact title="لیست خالی است" subtitle="هنوز انیمه‌ای وصل نشده." />
        )}
      </div>
    </div>
  )
}

const Header = ({ backTo, title }: { backTo: string; title: string }) => (
  <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
    <div className="flex items-center gap-2 px-4 py-3.5">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
        پروفایل
      </Link>
      <h1 className="flex-1 text-center text-lg font-semibold">{title}</h1>
      <span className="w-12" aria-hidden />
    </div>
  </div>
)

export default UserTranslationsPage
