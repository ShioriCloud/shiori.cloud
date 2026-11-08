import { useMemo } from 'react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileFavoritesGridSkeleton } from '@/components/profile/ProfileSectionSkeletons'
import { TranslatorBioQuote } from '@/components/profile/TranslatorBioQuote'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { sortTranslatorWorksNewestFirst } from '@/lib/translatorWorksSort'
import { toPersianDigits } from '@/lib/persianDigits'

type ProfileTranslationsTabPanelProps = {
  translator: NonNullable<SocialProfileMe['translator']>
  displayName: string
  isLoading?: boolean
}

export const ProfileTranslationsTabPanel = ({
  translator,
  displayName,
  isLoading = false,
}: ProfileTranslationsTabPanelProps) => {
  const sortedWorks = useMemo(
    () => sortTranslatorWorksNewestFirst(translator.anime ?? []),
    [translator.anime]
  )

  if (isLoading) {
    return <ProfileFavoritesGridSkeleton className="!mt-2 !px-4" />
  }

  return (
    <div className="px-4 pt-2 pb-4">
      {translator.bio ? (
        <TranslatorBioQuote bio={translator.bio} attribution={displayName} className="mb-4" />
      ) : null}
      <p className="mb-3 text-xs text-muted-foreground">
        {toPersianDigits(translator.anime_count ?? sortedWorks.length)} اثر
      </p>
      {sortedWorks.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {sortedWorks.map((item) => {
            const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
            return (
              <AnimePrefetchLink
                key={item.anime_id}
                animeId={animePublicSegment(routeRef)}
                to={animeDetailPath(routeRef)}
                className="block active:scale-[0.98] transition-transform"
              >
                <div className="media-card-skeuo rounded-xl">
                  <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
                    {item.image ? (
                      <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <BidiText as="p" className="line-clamp-2 text-left text-[10px] font-semibold text-white">
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
  )
}
