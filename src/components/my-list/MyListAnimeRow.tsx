import type { ReactNode } from 'react'
import {
  MyListBadge,
  MyListBadgeRow,
  MyListCompactCard,
  MyListGhostButton,
  MyListPoster,
  MyListProgressBar,
} from './MyListUi'

type MyListAnimeRowProps = {
  image: string
  title: ReactNode
  badges?: ReactNode
  progress?: number
  onMenu?: () => void
  menuLabel?: string
  link?: ReactNode
  trailing?: ReactNode
}

/** Compact horizontal anime row — Watchlist, History, List detail */
export const MyListAnimeRow = ({
  image,
  title,
  badges,
  progress,
  onMenu,
  menuLabel = 'گزینه‌های بیشتر',
  link,
  trailing,
}: MyListAnimeRowProps) => (
  <MyListCompactCard className="p-2.5">
    <div className="flex items-center gap-2.5">
      {link ?? <MyListPoster src={image} />}
      <div className="min-w-0 flex-1 flex flex-col gap-1">
        <div className="flex items-start gap-0.5">
          <div className="min-w-0 flex-1">{title}</div>
          {onMenu ? (
            <MyListGhostButton aria-label={menuLabel} onClick={onMenu}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </MyListGhostButton>
          ) : null}
          {trailing}
        </div>
        {badges ? <MyListBadgeRow>{badges}</MyListBadgeRow> : null}
        {typeof progress === 'number' ? <MyListProgressBar percent={progress} /> : null}
      </div>
    </div>
  </MyListCompactCard>
)

export { MyListBadge, MyListBadgeRow, MyListPoster }
