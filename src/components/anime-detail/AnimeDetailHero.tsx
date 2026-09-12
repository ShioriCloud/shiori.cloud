import { Share08Icon, FavouriteIcon, CheckmarkCircle02Icon } from 'hugeicons-react'
import { BidiText } from '../BidiText'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { AddToShioriListButton } from '@/components/my-list/AddToShioriListButton'
import { cn } from '@/lib/utils'
import { exploreAllHref } from '@/lib/exploreParams'
import { buildAnilistUrl, buildMalUrl } from '../../utils/externalLinks'
import { genreLabel, translateFormat, translateStatus } from './animeDetailLabels'
import { ScoreChip, posterStatusClass } from './AnimeDetailStatCards'
import type { Anime } from './types'
import type { AnimeMediaTags, AnimeScoreLabels } from './animeDetailMedia'

import malLogo from '../../assets/images/mal-logo.png'
import alLogo from '../../assets/images/anilist-logo.svg'
import shioriLogo from '../../assets/images/shiori.svg'

export const AnimeDetailHero = ({
  anime,
  scores,
  hardsubLanguage,
  statusKey,
  favoriteActive,
  onFavorite,
  onShare,
  openLink,
  navigate,
}: {
  anime: Anime
  scores: AnimeScoreLabels
  hardsubLanguage: AnimeMediaTags['hardsubLanguage']
  statusKey: string
  favoriteActive: boolean
  onFavorite: () => void
  onShare: () => void
  openLink: (url: string) => void
  navigate: (to: string) => void
}) => {
  const coverImage = anime.featured_image || anime.image

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-52 overflow-hidden">
        {coverImage ? (
          <img src={coverImage} alt="" className="w-full h-full object-cover opacity-45" />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background" />
      </div>

      <div className="relative z-10 pt-24 px-4 pb-2 flex flex-col items-center">
        <div className="relative w-full flex justify-center">
          <ButtonGroup
            orientation="vertical"
            aria-label="عملیات انیمه"
            className="absolute left-0 top-0 z-20"
          >
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={onFavorite}
              className={cn(
                'surface-skeuo border-border/60',
                favoriteActive
                  ? 'text-red-500 hover:text-red-500'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={
                favoriteActive ? 'ویرایش پیشرفت و امتیاز' : 'افزودن به علاقه‌مندی‌ها'
              }
            >
              <FavouriteIcon
                className={cn('h-4 w-4', favoriteActive && 'fill-red-500 text-red-500')}
              />
            </Button>
            <AddToShioriListButton
              animeId={anime.id}
              iconOnly
              triggerClassName="surface-skeuo border-border/60"
            />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={onShare}
              className="surface-skeuo border-border/60 text-muted-foreground hover:text-foreground"
              aria-label="اشتراک‌گذاری در تلگرام"
            >
              <Share08Icon className="h-4 w-4" />
            </Button>
          </ButtonGroup>

          <div className="relative">
            <div className="media-card-skeuo w-32 rounded-2xl">
              <div className="media-card-skeuo-face aspect-[2/3] bg-muted">
                <img src={anime.image} alt={anime.title} className="h-full w-full object-cover" />
              </div>
            </div>
            {statusKey ? (
              <span
                className={cn(
                  'absolute top-2 right-2 z-10 text-[10px] font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-sm',
                  posterStatusClass(statusKey)
                )}
              >
                {translateStatus(statusKey)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative w-full mt-3">
          <BidiText as="h1" className="text-lg font-bold text-foreground text-center line-clamp-3 leading-7">
            {anime.title}
          </BidiText>
          {anime.title_romaji ? (
            <BidiText
              as="p"
              className="text-muted-foreground text-center text-sm leading-5 line-clamp-2"
            >
              {anime.title_romaji}
            </BidiText>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded-md border border-border bg-muted/80 font-medium text-muted-foreground">
            {translateFormat(anime.format)}
          </span>
          {anime.genres.slice(0, 4).map((genre) => (
            <button
              key={genre.slug}
              type="button"
              className="text-[10px] px-2 py-0.5 rounded-md border border-primary-400/40 bg-primary-400/15 font-medium text-primary-700 hover:bg-primary-400/25 transition-colors dark:border-primary-400/25 dark:bg-primary-500/15 dark:text-primary-200 dark:hover:bg-primary-500/25"
              onClick={() =>
                navigate(exploreAllHref({ genreSlugs: [genre.slug] }))
              }
            >
              {genreLabel(genre)}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <ScoreChip
            logo={shioriLogo}
            logoAlt="شیوری"
            value={scores.shioriScoreLabel}
            logoWrapClassName="bg-primary-500"
          />
          <ScoreChip
            logo={malLogo}
            logoAlt="MyAnimeList"
            value={scores.malScoreLabel}
            href={anime.mal_id ? buildMalUrl(anime.mal_id) : undefined}
            onOpenLink={openLink}
          />
          <ScoreChip
            logo={alLogo}
            logoAlt="AniList"
            value={scores.anilistScoreLabel}
            href={anime.anilist_id ? buildAnilistUrl(anime.anilist_id) : undefined}
            onOpenLink={openLink}
          />
        </div>
        {hardsubLanguage ? (
          <div
            className={cn(
              'mt-3 flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5',
              hardsubLanguage === 'en'
                ? 'border-amber-500/35 bg-amber-500/10 dark:border-amber-500/25 dark:bg-transparent dark:bg-gradient-to-l dark:from-amber-500/[0.12] dark:to-card/60'
                : 'border-emerald-500/30 bg-emerald-500/10 dark:border-emerald-500/20 dark:bg-transparent dark:bg-gradient-to-l dark:from-emerald-500/[0.08] dark:to-card/60'
            )}
          >
            <CheckmarkCircle02Icon
              className={cn(
                'h-5 w-5 shrink-0',
                hardsubLanguage === 'en'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-foreground">
                {hardsubLanguage === 'en' ? 'زیرنویس انگلیسی' : 'زیرنویس چسبیده فارسی'}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {hardsubLanguage === 'en'
                  ? 'تمام قسمت‌ها با زیرنویس انگلیسی چسبیده هستند'
                  : 'تمام قسمت‌ها دارای نسخه‌ی سافت‌ساب فارسی هستند.'}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
