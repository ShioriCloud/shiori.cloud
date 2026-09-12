import type { ReactNode } from 'react'
import { Download04Icon } from 'hugeicons-react'
import AnimePrefetchLink from '../AnimePrefetchLink'
import { BidiText } from '../BidiText'
import { Button } from '@/components/ui/button'
import { animeDetailPath, animePublicSegment } from '../../lib/animePaths'

export const InfoRow = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) => (
  <div className="flex items-start justify-between gap-3 px-4 py-3.5">
    <span className="text-muted-foreground text-sm flex items-center gap-2 shrink-0">
      {icon}
      {label}
    </span>
    <div className="text-foreground text-sm text-left min-w-0">{children}</div>
  </div>
)

export const EmptyBlock = ({
  message,
  hint,
  action,
  icon,
}: {
  message: string
  hint?: string
  action?: { label: string; onClick: () => void }
  icon?: ReactNode
}) => (
  <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-12 px-6 text-center space-y-3">
    {icon ?? (
      <Download04Icon className="w-10 h-10 mx-auto text-muted-foreground/35" aria-hidden />
    )}
    <p className="text-sm text-muted-foreground">{message}</p>
    {hint ? <p className="text-xs text-muted-foreground/75 leading-6">{hint}</p> : null}
    {action ? (
      <Button type="button" size="sm" variant="secondary" onClick={action.onClick}>
        {action.label}
      </Button>
    ) : null}
  </div>
)

export const SimilarPosterCard = ({
  anime,
}: {
  anime: { id: number | string; slug?: string | null; title: string; image: string }
}) => (
  <AnimePrefetchLink
    animeId={animePublicSegment(anime)}
    to={animeDetailPath(anime)}
    className="group block active:scale-[0.98] transition-transform"
    aria-label={`مشاهده ${anime.title}`}
  >
    <div className="media-card-skeuo rounded-xl">
      <div className="media-card-skeuo-face aspect-[2/3] bg-muted">
        <img
          src={anime.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-2 pt-10">
          <BidiText as="h3" className="text-xs font-semibold text-white line-clamp-2 leading-5">
            {anime.title}
          </BidiText>
        </div>
      </div>
    </div>
  </AnimePrefetchLink>
)
