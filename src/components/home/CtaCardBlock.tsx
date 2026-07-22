import { BidiText } from '@/components/BidiText'
import { hasUsableHref } from '@/lib/homeBlockLinks'
import { resolveMediaServeUrl } from '@/lib/shioriApi'
import type { HomeCtaCardBlock } from '@/types/home'
import { HomeCustomBlockLink } from './HomeCustomBlocks'

export const CtaCardBlock = ({ block }: { block: HomeCtaCardBlock }) => {
  const imageSrc = resolveMediaServeUrl(block.image_url)
  const linked = hasUsableHref(block.link_url)

  return (
    <section className="px-4">
      <HomeCustomBlockLink
        href={block.link_url}
        openInNewTab={block.open_in_new_tab}
        className={linked ? 'block active:scale-[0.995] transition-transform' : 'block'}
      >
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-sm">
          <div className="flex gap-3 p-3">
            <img
              src={imageSrc}
              alt=""
              className="h-28 w-20 shrink-0 rounded-xl border border-border/80 object-cover"
              loading="lazy"
            />

            <div className="min-w-0 flex flex-1 flex-col justify-between py-0.5">
              <div className="min-w-0">
                <BidiText
                  as="h3"
                  className="text-sm font-semibold text-foreground line-clamp-2 text-right leading-5"
                >
                  {block.title}
                </BidiText>
                {block.subtitle ? (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1 text-right">
                    {block.subtitle}
                  </p>
                ) : null}
                {block.description ? (
                  <p className="text-xs text-muted-foreground/80 mt-1.5 line-clamp-2 text-right leading-5">
                    {block.description}
                  </p>
                ) : null}
              </div>

              {linked ? (
                <div className="mt-2 flex justify-end">
                  <span className="inline-flex items-center rounded-lg border border-primary-400/30 bg-primary-400/10 px-3 py-1.5 text-xs font-medium text-primary-400">
                    {block.button_label?.trim() || 'مشاهده'}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </HomeCustomBlockLink>
    </section>
  )
}
