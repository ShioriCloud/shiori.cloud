import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { cn } from '@/lib/utils'

export type ProfileTranslatorPosterRef = {
  anime_id: string
  slug: string | null
  title: string
  image: string
}

type ProfileTranslatorPosterCardProps = {
  item: ProfileTranslatorPosterRef
  className?: string
}

/** Figma v3 translator poster — 112×160, title bottom-right on gradient. */
export const ProfileTranslatorPosterCard = ({
  item,
  className,
}: ProfileTranslatorPosterCardProps) => {
  const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }

  return (
    <AnimePrefetchLink
      animeId={animePublicSegment(routeRef)}
      to={animeDetailPath(routeRef)}
      className={cn('block w-full min-w-0 transition-transform active:scale-[0.98]', className)}
      aria-label={`مشاهده ${item.title}`}
    >
      <div className="relative aspect-[112/160] w-full overflow-hidden rounded-[10px] border border-white/[0.08] bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-[#141419]"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-2">
          <BidiText
            as="p"
            className="line-clamp-2 text-right text-[11.5px] font-semibold leading-4 text-white/90"
          >
            {item.title}
          </BidiText>
        </div>
      </div>
    </AnimePrefetchLink>
  )
}
