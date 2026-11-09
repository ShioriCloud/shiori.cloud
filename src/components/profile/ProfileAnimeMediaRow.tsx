import type { ReactNode } from 'react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { PROFILE_PANEL_CLASS } from '@/components/profile/profileStatsCard'
import { cn } from '@/lib/utils'

type ProfileAnimePosterProps = {
  src?: string | null
  className?: string
}

/** Fixed poster used by every profile row that shows an anime. */
export const ProfileAnimePoster = ({ src, className }: ProfileAnimePosterProps) => (
  <div
    className={cn(
      'h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-inset ring-border/70',
      className
    )}
  >
    {src ? <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
  </div>
)

type ProfileAnimeMediaRowProps = {
  animeId: string
  to: string
  image?: string | null
  title: string
  meta?: ReactNode
  className?: string
}

/** Horizontal anime row: poster, title, and a short meta line. */
export const ProfileAnimeMediaRow = ({
  animeId,
  to,
  image,
  title,
  meta,
  className,
}: ProfileAnimeMediaRowProps) => (
  <AnimePrefetchLink
    animeId={animeId}
    to={to}
    className={cn(
      PROFILE_PANEL_CLASS,
      'flex items-center gap-3 rounded-2xl px-3 py-2.5 active:opacity-90',
      className
    )}
  >
    <ProfileAnimePoster src={image} />
    <div className="min-w-0 flex-1 text-right">
      <BidiText as="p" className="line-clamp-2 text-[13.5px] font-semibold leading-5 text-foreground">
        {title}
      </BidiText>
      {meta ? (
        <div className="mt-1 flex flex-wrap items-center justify-end gap-x-2 gap-y-0.5 text-[12px] leading-5 text-foreground/70">
          {meta}
        </div>
      ) : null}
    </div>
  </AnimePrefetchLink>
)
