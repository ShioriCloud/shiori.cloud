import { resolveMediaServeUrl } from '@/lib/shioriApi'
import { hasUsableHref } from '@/lib/homeBlockLinks'
import type { HomeCtaBannerBlock } from '@/types/home'
import { HomeCustomBlockLink } from './HomeCustomBlocks'

export const CtaBannerBlock = ({ block }: { block: HomeCtaBannerBlock }) => {
  const imageSrc = resolveMediaServeUrl(block.image_url)
  const linked = hasUsableHref(block.link_url)

  return (
    <section className="px-4">
      <HomeCustomBlockLink
        href={block.link_url}
        openInNewTab={block.open_in_new_tab}
        className={linked ? 'group block active:scale-[0.99] transition-transform' : 'block'}
      >
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
          <img
            src={imageSrc}
            alt={block.title ?? ''}
            className={`aspect-[21/9] w-full object-cover ${
              linked ? 'transition-transform duration-500 group-hover:scale-[1.02]' : ''
            }`}
            loading="lazy"
          />
          {block.title ? (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-10">
              <p className="text-sm font-semibold text-white text-right">{block.title}</p>
            </div>
          ) : null}
        </div>
      </HomeCustomBlockLink>
    </section>
  )
}
