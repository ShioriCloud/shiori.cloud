import { PlayIcon } from 'hugeicons-react'
import { BidiText } from '@/components/BidiText'
import { AddToShioriListButton } from '@/components/my-list/AddToShioriListButton'
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
  videoQualityOneLiner,
} from '@/utils/animeMediaTags'
import { HomeCustomBlockLink } from './HomeCustomBlocks'

const CTA_DEFAULT_LABEL = 'بزن بریم'

const buildMetaLine = (block: HomeCtaCardBlock): string | null => {
  const parts: string[] = []

  if (block.video_resolution || block.video_encode) {
    parts.push(
      videoQualityOneLiner(
        normalizeVideoResolution(block.video_resolution),
        normalizeVideoEncode(block.video_encode)
      )
    )
  }

  const fileType = normalizeVideoFileType(block.video_file_type)
  const hardsubLanguage = resolveHardsubLanguage({
    hardsub_language: block.hardsub_language,
  })

  if (fileType === 'hardsub') {
    parts.push(mediaSpecTagLabel({ video_file_type: fileType, hardsub_language: hardsubLanguage }))
  } else if (hardsubLanguage === 'en') {
    parts.push(hardsubLanguageLabel('en'))
  }

  return parts.length > 0 ? parts.join(' • ') : null
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
  const metaLine = buildMetaLine(block)
  const animeId = block.anime_id

  return (
    <section className="px-4">
      <article className="overflow-hidden rounded-2xl border border-border/50 bg-card/40">
        <HomeCustomBlockLink
          href={animeHref}
          openInNewTab={block.open_in_new_tab}
          className={cn('group block', linked && 'active:opacity-95')}
        >
          <div className="relative overflow-hidden">
            <img
              src={imageSrc}
              alt=""
              className={cn(
                'aspect-[16/9] w-full object-cover',
                linked && 'transition-transform duration-500 ease-out group-hover:scale-[1.03]'
              )}
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        </HomeCustomBlockLink>

        <div className="space-y-2.5 px-3.5 pb-3.5 pt-3 text-end">
          <HomeCustomBlockLink
            href={animeHref}
            openInNewTab={block.open_in_new_tab}
            className={cn(linked && 'block active:opacity-90')}
          >
            <BidiText
              as="h3"
              className="text-lg font-bold leading-7 tracking-tight text-foreground text-end"
            >
              {block.title}
            </BidiText>
          </HomeCustomBlockLink>

          {metaLine ? (
            <p className="text-xs font-medium leading-5 text-primary-300/95 text-end">
              {metaLine}
            </p>
          ) : null}

          {block.description ? (
            <p className="text-sm leading-6 text-muted-foreground line-clamp-3 text-end">
              {block.description}
            </p>
          ) : null}

          <div className="flex items-center gap-2.5 pt-1">
            <HomeCustomBlockLink
              href={animeHref}
              openInNewTab={block.open_in_new_tab}
              className={cn('min-w-0 flex-1', !linked && 'pointer-events-none')}
            >
              <span
                className={cn(
                  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-full',
                  'bg-primary-500 text-sm font-bold text-white',
                  'shadow-[0_8px_24px_-10px_rgba(139,92,246,0.7)]',
                  linked &&
                    'transition-[transform,background-color] duration-200 hover:bg-primary-400 active:scale-[0.985]'
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
                triggerClassName={cn(
                  'h-11 w-11 shrink-0 rounded-full border-2 border-primary-400/70',
                  'bg-transparent text-primary-300 hover:bg-primary-400/10 hover:text-primary-200'
                )}
              />
            ) : null}
          </div>
        </div>
      </article>
    </section>
  )
}
