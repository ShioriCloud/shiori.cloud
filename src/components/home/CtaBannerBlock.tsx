import { resolveMediaServeUrl } from '@/lib/shioriApi'
import { hasUsableHref } from '@/lib/homeBlockLinks'
import { animeDetailPath } from '@/lib/animePaths'
import type { HomeCtaBannerBlock } from '@/types/home'
import { HomeCustomBlockLink } from './HomeCustomBlocks'

export const CtaBannerBlock = ({ block }: { block: HomeCtaBannerBlock }) => {
  const imageSrc = resolveMediaServeUrl(block.image_url)
  const animeHref =
    block.link_url?.trim() ||
    (block.anime_id
      ? animeDetailPath({
          id: block.anime_id,
          slug: block.slug ?? undefined,
          title: block.title ?? undefined,
        })
      : null)
  const linked = hasUsableHref(animeHref)

  return (
    <section className="px-4">
      <HomeCustomBlockLink
        href={animeHref}
        openInNewTab={false}
        className={linked ? 'group block active:scale-[0.99] transition-transform' : 'block'}
      >
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
          <img
            src={imageSrc}
            alt={block.title ?? ''}
            className={`aspect-[3/1] w-full object-cover ${
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
