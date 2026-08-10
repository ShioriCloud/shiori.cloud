import { ArrowLeft01Icon, PlayIcon } from 'hugeicons-react'
import { BidiText } from '@/components/BidiText'
import { hasUsableHref } from '@/lib/homeBlockLinks'
import { resolveMediaServeUrl } from '@/lib/shioriApi'
import type { HomeCtaCardBlock } from '@/types/home'
import { cn } from '@/lib/utils'
import { HomeCustomBlockLink } from './HomeCustomBlocks'

export const CtaCardBlock = ({ block }: { block: HomeCtaCardBlock }) => {
  const imageSrc = resolveMediaServeUrl(block.image_url)
  const linked = hasUsableHref(block.link_url)
  const buttonLabel = block.button_label?.trim() || 'مشاهده'

  return (
    <section className="px-4">
      <HomeCustomBlockLink
        href={block.link_url}
        openInNewTab={block.open_in_new_tab}
        className={cn('group block', linked && 'active:opacity-95')}
      >
        <div className="overflow-hidden rounded-xl bg-muted/40">
          <img
            src={imageSrc}
            alt=""
            className={cn(
              'aspect-video w-full object-cover',
              linked && 'transition-transform duration-500 ease-out group-hover:scale-[1.03]'
            )}
            loading="lazy"
          />
        </div>

        <div className="pt-3.5">
          <BidiText
            as="h3"
            className="text-[1.35rem] font-bold leading-7 tracking-tight text-foreground text-start"
          >
            {block.title}
          </BidiText>

          {block.subtitle ? (
            <p className="mt-1.5 text-sm font-medium leading-5 text-sky-500 dark:text-sky-300 text-start">
              {block.subtitle}
            </p>
          ) : null}

          {block.description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-3 text-start">
              {block.description}
            </p>
          ) : null}

          {linked ? (
            <div className="mt-4 flex items-center gap-2.5">
              <span
                className={cn(
                  'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full',
                  'bg-primary-500 text-sm font-bold text-white',
                  'shadow-[0_8px_24px_-10px_rgba(139,92,246,0.75)]',
                  'transition-[transform,background-color,box-shadow] duration-200',
                  'group-hover:bg-primary-400 group-active:scale-[0.985]'
                )}
              >
                <PlayIcon className="h-4 w-4 shrink-0" aria-hidden />
                {buttonLabel}
              </span>
              <span
                className={cn(
                  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                  'border-2 border-primary-400/80 text-primary-300',
                  'transition-[transform,border-color,color,background-color] duration-200',
                  'group-hover:border-primary-300 group-hover:bg-primary-400/10 group-hover:text-primary-200',
                  'group-active:scale-[0.96]'
                )}
                aria-hidden
              >
                <ArrowLeft01Icon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              </span>
            </div>
          ) : null}
        </div>
      </HomeCustomBlockLink>
    </section>
  )
}
