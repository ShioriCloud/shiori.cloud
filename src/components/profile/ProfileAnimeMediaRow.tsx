import type { ReactNode } from 'react'
import { Star } from 'lucide-react'
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

/** Meta line under the title. `justify-start` sits on the right when the page is RTL. */
export const PROFILE_ANIME_META_CLASS =
  'mt-1 flex w-full flex-wrap items-center justify-start gap-x-2 gap-y-1 text-start text-[12px] leading-5 text-foreground/70'

export const ProfileAnimeScore = ({ value }: { value: string }) => (
  <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/15 px-1.5 py-0.5 font-medium text-amber-800 dark:text-amber-200">
    <Star className="size-3 fill-amber-400 text-amber-500" aria-hidden />
    <span className="tabular-nums">{value}</span>
    <span className="text-[10px] font-normal text-amber-800/80 dark:text-amber-100/80">از ۱۰</span>
  </span>
)

type ProfileAnimeMediaRowProps = {
  animeId: string
  to: string
  image?: string | null
  title: string
  meta?: ReactNode
  action?: ReactNode
  className?: string
}

/** Horizontal anime row: poster, title, and a short meta line. */
export const ProfileAnimeMediaRow = ({
  animeId,
  to,
  image,
  title,
  meta,
  action,
  className,
}: ProfileAnimeMediaRowProps) => (
  <div
    className={cn(
      PROFILE_PANEL_CLASS,
      'flex items-center gap-1 rounded-2xl py-2.5 pe-2 ps-1.5',
      className
    )}
  >
    <AnimePrefetchLink
      animeId={animeId}
      to={to}
      className="flex min-w-0 flex-1 items-center gap-3 active:opacity-90"
    >
      <ProfileAnimePoster src={image} />
      <div className="min-w-0 flex-1 text-right">
        <BidiText as="p" className="line-clamp-2 text-[13.5px] font-semibold leading-5 text-foreground">
          {title}
        </BidiText>
        {meta ? (
          <div className={PROFILE_ANIME_META_CLASS} dir="rtl">
            {meta}
          </div>
        ) : null}
      </div>
    </AnimePrefetchLink>
    {action}
  </div>
)
