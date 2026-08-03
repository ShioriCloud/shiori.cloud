import { Link } from 'react-router-dom'
import { Download04Icon } from 'hugeicons-react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  videoQualityButtonLabel,
  type VideoEncode,
  type VideoResolution,
} from '../../utils/animeMediaTags'
import { toPersianNumber } from './animeDetailLabels'

export interface Episode {
  id: string | number
  number: number
  title: string
  download_link?: string
  subtitle_link?: string
  video_file_type?: 'softsub' | 'hardsub' | 'free'
}

export interface SubtitlePack {
  id: string | number
  title?: string
  subtitle_link?: string
}

export interface EpisodePack {
  title?: string | null
  download_link?: string | null
}

export const formatEpisodeLabel = (num: number | string): string => {
  const n = typeof num === 'number' ? num : Number(num)
  if (!Number.isFinite(n)) return toPersianNumber(num)
  const raw = Number.isInteger(n) ? String(n) : String(n)
  return toPersianNumber(raw)
}

/** Simple row for per-episode / per-subtitle downloads (packs keep the fancy shell). */
export const episodeOneLineShellClass =
  'group relative flex items-center gap-3 overflow-hidden rounded-xl surface-skeuo px-3 py-2.5 transition-colors hover:bg-muted/40 cursor-pointer active:scale-[0.99]'

export const episodeActionBtnClass =
  'relative z-10 inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg border px-2.5 text-[11px] font-semibold transition-colors active:scale-[0.97]'

/** Neutral download chip for regular episode & subtitle rows. */
export const episodeActionBtnNeutralClass =
  'border-transparent bg-zinc-900 text-white hover:bg-zinc-800 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15'

/** Purple download chip — packs only. */
export const episodeActionBtnPackClass =
  'border-transparent bg-primary-500 text-white hover:bg-primary-500/90 dark:border-primary-400/35 dark:bg-primary-400/10 dark:text-primary-300 dark:hover:bg-primary-400/15'

export const EpisodeDownloadCard = ({
  episode,
  subscriptionLocked = false,
  onDownloadAvailable,
  onLockedQuality,
}: {
  episode: Episode
  subscriptionLocked?: boolean
  onDownloadAvailable: () => void
  onLockedQuality: (quality: string) => void
}) => {
  const handleCardClick = () => {
    if (subscriptionLocked) {
      onLockedQuality('اشتراک')
      return
    }
    onDownloadAvailable()
  }

  return (
    <div
      className={episodeOneLineShellClass}
      role="button"
      tabIndex={0}
      aria-label={
        subscriptionLocked
          ? `دانلود قسمت ${episode.number} نیازمند اشتراک`
          : `دانلود قسمت ${episode.number}`
      }
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      <div className="relative flex min-w-0 flex-1 items-center gap-2">
        <p className="min-w-0 truncate text-sm font-bold text-foreground">
          قسمت {formatEpisodeLabel(episode.number)}
        </p>
      </div>

      <div className="relative flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          aria-label={
            subscriptionLocked
              ? `دانلود قسمت ${episode.number} نیازمند اشتراک`
              : `دانلود قسمت ${episode.number}`
          }
          className={cn(
            episodeActionBtnClass,
            subscriptionLocked
              ? 'border-border/60 bg-muted/25 text-muted-foreground'
              : episodeActionBtnNeutralClass
          )}
          onClick={(e) => {
            e.stopPropagation()
            handleCardClick()
          }}
        >
          {subscriptionLocked ? (
            <Lock className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Download04Icon className="h-3.5 w-3.5" aria-hidden />
          )}
          دانلود
        </button>
      </div>
    </div>
  )
}

/** Same shell/sizing as episode cards — used on the subtitles tab. */
export const SubtitleDownloadCard = ({
  episodeNumber,
  onDownload,
}: {
  episodeNumber: number
  onDownload: () => void
}) => (
  <div
    className={episodeOneLineShellClass}
    role="button"
    tabIndex={0}
    aria-label={`دانلود زیرنویس قسمت ${episodeNumber}`}
    onClick={onDownload}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onDownload()
      }
    }}
  >
    <div className="relative flex min-w-0 flex-1 items-center gap-2">
      <p className="min-w-0 truncate text-sm font-bold text-foreground">
        زیرنویس قسمت {formatEpisodeLabel(episodeNumber)}
      </p>
    </div>

    <div className="relative flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        aria-label={`دانلود زیرنویس قسمت ${episodeNumber}`}
        className={cn(episodeActionBtnClass, episodeActionBtnNeutralClass)}
        onClick={(e) => {
          e.stopPropagation()
          onDownload()
        }}
      >
        <Download04Icon className="h-3.5 w-3.5" aria-hidden />
        دانلود
      </button>
    </div>
  </div>
)

export const SubtitlePackDownloadCard = ({
  pack,
  onDownload,
}: {
  pack: SubtitlePack
  onDownload: () => void
}) => {
  const title = pack.title?.trim() || 'پک زیرنویس'

  return (
    <div
      className="episode-pack-card-wrap cursor-pointer active:scale-[0.99] transition-transform"
      role="button"
      tabIndex={0}
      aria-label={`دانلود ${title}`}
      onClick={onDownload}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onDownload()
        }
      }}
    >
      <div className="episode-pack-card-inner group relative flex items-center gap-3 overflow-hidden bg-card px-3 py-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-l from-primary-500/[0.09] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-primary-400/[0.12] to-transparent"
        />

        <div className="relative flex min-w-0 flex-1 items-center gap-2">
          <p className="min-w-0 truncate text-sm font-bold text-foreground">{title}</p>
        </div>

        <div className="relative flex shrink-0 items-center gap-1.5">
          <span className={cn(episodeActionBtnClass, episodeActionBtnPackClass)}>
            <Download04Icon className="h-3.5 w-3.5" aria-hidden />
            دانلود
          </span>
        </div>
      </div>
    </div>
  )
}

export const EpisodePackDownloadCard = ({
  pack,
  onDownload,
  locked = false,
}: {
  pack: EpisodePack
  onDownload: () => void
  locked?: boolean
}) => {
  const title = pack.title?.trim() || 'دانلود تمام قسمت‌ها'

  return (
    <div
      className="episode-pack-card-wrap cursor-pointer active:scale-[0.99] transition-transform"
      role="button"
      tabIndex={0}
      aria-label={locked ? `${title} نیازمند اشتراک` : `دانلود ${title}`}
      onClick={onDownload}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onDownload()
        }
      }}
    >
      <div className="episode-pack-card-inner group relative flex items-center gap-3 overflow-hidden bg-card px-3 py-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-l from-primary-500/[0.09] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-primary-400/[0.12] to-transparent"
        />

        <div className="relative flex min-w-0 flex-1 items-center gap-2">
          <p className="min-w-0 truncate text-sm font-bold text-foreground">{title}</p>
        </div>

        <div className="relative flex shrink-0 items-center gap-1.5">
          {locked ? (
            <span
              className={cn(
                episodeActionBtnClass,
                'border-border/60 bg-muted/25 text-muted-foreground'
              )}
            >
              <Lock className="h-3.5 w-3.5" aria-hidden />
              اشتراک
            </span>
          ) : (
            <span className={cn(episodeActionBtnClass, episodeActionBtnPackClass)}>
              <Download04Icon className="h-3.5 w-3.5" aria-hidden />
              دانلود
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

const FREE_QUALITY_LABEL = '1080p x265 10bit'

export const MOCK_FREE_EPISODES: Episode[] = [
  {
    id: 'mock-free-1',
    number: 1,
    title: 'نمونه قسمت ۱',
    download_link: 'https://t.me/ShioriUploadBot?start=get_free_demo',
    video_file_type: 'free',
  },
  {
    id: 'mock-free-2',
    number: 2,
    title: 'نمونه قسمت ۲',
    download_link: 'https://t.me/ShioriUploadBot?start=get_free_demo',
    video_file_type: 'free',
  },
  {
    id: 'mock-free-3',
    number: 3,
    title: 'نمونه قسمت ۳',
    download_link: 'https://t.me/ShioriUploadBot?start=get_free_demo',
    video_file_type: 'free',
  },
]

export const FreeTokenWalletCard = ({
  balance,
  pending,
  exhausted,
  isMock,
}: {
  balance: number
  pending: boolean
  exhausted: boolean
  isMock?: boolean
}) => (
  <div
    className={cn(
      'overflow-hidden rounded-2xl p-4',
      exhausted
        ? 'border border-amber-500/35 bg-gradient-to-br from-amber-500/15 to-card/80'
        : 'surface-skeuo'
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">کیف توکن رایگان</p>
          {isMock ? (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              نمونه
            </span>
          ) : null}
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          هر دانلود رایگان ۱ توکن · کیفیت ثابت {FREE_QUALITY_LABEL}
        </p>
      </div>
      <div className="shrink-0 rounded-xl border border-black/[0.08] bg-background/50 px-3 py-2 text-center dark:border-border">
        <p className="text-[10px] text-muted-foreground">موجودی</p>
        <p className="text-xl font-bold tabular-nums leading-tight text-foreground">
          {pending ? '…' : toPersianNumber(balance)}
        </p>
      </div>
    </div>
    {exhausted ? (
      <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          توکن‌ها تمام شده. با اشتراک ماهانه به سافت‌ساب و هاردساب بدون محدودیت دسترسی دارید.
        </p>
        <Button asChild size="sm" className="w-full gap-1">
          <Link to="/subscribe">خرید اشتراک ماهانه</Link>
        </Button>
      </div>
    ) : (
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
        <p className="text-[11px] text-muted-foreground">دسترسی نامحدود سافت/هارد</p>
        <Button asChild size="sm" variant="secondary">
          <Link to="/subscribe">اشتراک</Link>
        </Button>
      </div>
    )}
  </div>
)

export const FreeEpisodeDownloadCard = ({
  episode,
  claiming,
  disabled,
  onClaim,
}: {
  episode: Episode
  claiming: boolean
  disabled: boolean
  onClaim: () => void
}) => {
  const isDisabled = disabled || claiming

  return (
    <div
      className={cn(episodeOneLineShellClass, isDisabled && 'pointer-events-none opacity-60')}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled}
      aria-label={`دانلود رایگان قسمت ${episode.number}`}
      onClick={() => {
        if (!isDisabled) onClaim()
      }}
      onKeyDown={(e) => {
        if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClaim()
        }
      }}
    >
      <div className="relative flex min-w-0 flex-1 items-center gap-2">
        <p className="min-w-0 truncate text-sm font-bold text-foreground">
          قسمت {formatEpisodeLabel(episode.number)}
        </p>
      </div>

      <div className="relative flex shrink-0 items-center gap-1.5">
        <span className={cn(episodeActionBtnClass, episodeActionBtnNeutralClass)}>
          <Download04Icon className="h-3.5 w-3.5" aria-hidden />
          دانلود
        </span>
      </div>
    </div>
  )
}

/** Shared quality line above episode / pack cards (not repeated on each card). */
export const EpisodeQualityNote = ({
  resolution,
  encode,
  averageSizeLabel,
}: {
  resolution: VideoResolution
  encode: VideoEncode
  /** e.g. «~450MB» — omit when catalog has no size data */
  averageSizeLabel?: string | null
}) => {
  const size = String(averageSizeLabel ?? '').trim()

  return (
    <div className="flex items-center gap-1.5 px-0.5 text-[11px] leading-none text-muted-foreground">
      <span
        aria-hidden
        className="h-3 w-0.5 shrink-0 rounded-full bg-primary-400"
      />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2 whitespace-nowrap">
        <p className="min-w-0 truncate">
          کیفیت:{' '}
          <span className="font-mono tabular-nums text-foreground/85" dir="ltr">
            {videoQualityButtonLabel(resolution, encode)}
          </span>
        </p>
        {size ? (
          <p className="shrink-0 text-end">
            حجم هر قسمت:{' '}
            <span className="font-mono tabular-nums text-foreground/75" dir="ltr">
              {size}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  )
}
