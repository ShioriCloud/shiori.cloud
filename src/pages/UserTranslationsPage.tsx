import { useParams } from 'react-router-dom'
import { Languages } from 'lucide-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { TranslatorBioQuote } from '@/components/profile/TranslatorBioQuote'
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

  const translator = data?.translator ?? null
  const displayName = data?.profile?.display_name ?? 'کاربر'

  if (!isReady) return null

  if (!telegramUserId || isError || (!isLoading && !translator)) {
    return (
      <div className="bg-background pb-24 text-foreground">
        <div className="px-4 pt-4">
          <h1 className="mb-6 text-lg font-semibold">ترجمه‌ها</h1>
          <ExploreEmptyState title="ترجمه‌ای نیست" subtitle="این کاربر مترجم متصل ندارد." />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="px-4 pt-4">
        <h1 className="mb-4 text-lg font-semibold">ترجمه‌ها</h1>
        <div
          className={cn(
            'mb-5 overflow-hidden rounded-2xl border border-border/60',
            'bg-gradient-to-br from-primary-400/[0.08] via-background to-sky-400/[0.06] p-4'
          )}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary-400/25 bg-primary-400/10 text-primary-400">
              <Languages className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-base font-semibold text-foreground">{displayName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                مترجم شیوری · {toPersianDigits(translator?.anime_count ?? 0)} اثر
              </p>
            </div>
          </div>

          {translator?.bio ? (
            <TranslatorBioQuote bio={translator.bio} attribution={displayName} />
          ) : null}
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

export default UserTranslationsPage
