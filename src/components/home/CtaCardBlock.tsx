import { PlayIcon } from 'hugeicons-react'
import { BidiText } from '@/components/BidiText'
import { SHIORI_PRIMARY_BUTTON_CLASS } from '@/components/explore/ExploreUi'
import { AddToShioriListButton } from '@/components/my-list/AddToShioriListButton'
import { MyListBadge, MyListBadgeRow } from '@/components/my-list/MyListUi'
import { hasUsableHref } from '@/lib/homeBlockLinks'
import { animeDetailPath } from '@/lib/animePaths'
import { resolveMediaServeUrl } from '@/lib/shioriApi'
import type { HomeCtaCardBlock } from '@/types/home'
import { cn } from '@/lib/utils'
import {
  hardsubLanguageLabel,
  mediaSpecTagLabel,
  normalizeVideoEncode,
  normalizeVideoFileType,
  normalizeVideoResolution,
  resolveHardsubLanguage,
  videoQualityButtonLabel,
} from '@/utils/animeMediaTags'
import { HomeCustomBlockLink } from './HomeCustomBlocks'

const CTA_DEFAULT_LABEL = 'بزن بریم'

const buildMetaBadges = (block: HomeCtaCardBlock) => {
  const badges: { key: string; label: string; tone: 'default' | 'primary' | 'muted' }[] = []

  badges.push({
    key: 'quality',
    label: videoQualityButtonLabel(
      normalizeVideoResolution(block.video_resolution),
      normalizeVideoEncode(block.video_encode)
    ),
    tone: 'default',
  })

  const fileType = normalizeVideoFileType(block.video_file_type)
  const hardsubLanguage = resolveHardsubLanguage({
    hardsub_language: block.hardsub_language,
  })

  badges.push({
    key: 'sub',
    label:
      fileType === 'hardsub'
        ? hardsubLanguageLabel(hardsubLanguage)
        : mediaSpecTagLabel({
            video_file_type: fileType,
            hardsub_language: hardsubLanguage,
          }),
    tone: 'primary',
  })

  return badges
}

export const CtaCardBlock = ({ block }: { block: HomeCtaCardBlock }) => {
  const imageSrc = resolveMediaServeUrl(block.image_url)
  const animeHref =
    block.link_url?.trim() ||
    (block.anime_id
      ? animeDetailPath({ id: block.anime_id, slug: block.slug, title: block.title })
      : null)
  const linked = hasUsableHref(animeHref)
  const buttonLabel = block.button_label?.trim() || CTA_DEFAULT_LABEL
  const metaBadges = buildMetaBadges(block)
  const animeId = block.anime_id

  return (
    <section className="px-4">
      <article
        className={cn(
          'surface-skeuo overflow-hidden rounded-2xl p-1.5',
          'bg-zinc-200 dark:bg-[#222226]'
        )}
      >
        <HomeCustomBlockLink
          href={animeHref}
          openInNewTab={block.open_in_new_tab}
          className={cn('group block', linked && 'active:opacity-95')}
        >
          <div className="media-card-skeuo rounded-[0.7rem]">
            <div className="media-card-skeuo-face">
              <img
                src={imageSrc}
                alt=""
                className={cn(
                  'aspect-[16/9] w-full object-cover',
                  linked && 'transition-transform duration-500 ease-out group-hover:scale-[1.03]'
                )}
                loading="lazy"
              />
            </div>
          </div>
        </HomeCustomBlockLink>

        <div className="space-y-2.5 px-2 pb-1.5 pt-3 text-start">
          <HomeCustomBlockLink
            href={animeHref}
            openInNewTab={block.open_in_new_tab}
            className={cn(linked && 'block active:opacity-90')}
          >
            <BidiText
              as="h3"
              className="block w-full text-right text-lg font-bold leading-7 tracking-tight text-foreground"
            >
              {block.title}
            </BidiText>
          </HomeCustomBlockLink>

          <MyListBadgeRow className="justify-start">
            {metaBadges.map((badge) => (
              <MyListBadge key={badge.key} tone={badge.tone}>
                {badge.label}
              </MyListBadge>
            ))}
          </MyListBadgeRow>

          {block.description ? (
            <p className="text-sm leading-6 text-muted-foreground line-clamp-3 text-start" dir="rtl">
              {block.description}
            </p>
          ) : null}

          <div className="flex items-center gap-2 pt-1">
            <HomeCustomBlockLink
              href={animeHref}
              openInNewTab={block.open_in_new_tab}
              className={cn('min-w-0 flex-1', !linked && 'pointer-events-none')}
            >
              <span
                className={cn(
                  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4',
                  'text-sm font-semibold',
                  SHIORI_PRIMARY_BUTTON_CLASS
                )}
              >
                <PlayIcon className="h-4 w-4 shrink-0" aria-hidden />
                {buttonLabel}
              </span>
            </HomeCustomBlockLink>

            {animeId ? (
              <AddToShioriListButton
                animeId={animeId}
                iconOnly
                triggerClassName="h-11 w-11 shrink-0 rounded-lg"
              />
            ) : null}
          </div>
        </div>
      </article>
    </section>
  )
}
