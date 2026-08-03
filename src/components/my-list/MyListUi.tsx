import type { MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Delete02Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { EXPLORE_CHIP_CLASS } from '@/components/explore/ExploreUi'
import { cn } from '@/lib/utils'
import emptyListImage from '@/assets/images/frieren-03.webp'

/* ─── Tab header: title … meta ─── */

export const MyListTabHeader = ({
  title,
  meta,
  action,
}: {
  title: string
  meta?: string
  action?: ReactNode
}) => (
  <div className="flex items-center justify-between gap-3 mb-3 min-h-[1.75rem]">
    <h2 className="text-sm font-semibold text-foreground truncate">{title}</h2>
    <div className="flex items-center gap-2 shrink-0">
      {meta ? (
        <span className={cn(EXPLORE_CHIP_CLASS, 'shrink-0 tabular-nums')}>{meta}</span>
      ) : null}
      {action}
    </div>
  </div>
)

/** Header clear action — same chip size as Explore/MyList meta badges. */
export const MyListClearChip = ({
  onClick,
  children = 'پاک کردن',
  'aria-label': ariaLabel,
}: {
  onClick?: () => void
  children?: ReactNode
  'aria-label'?: string
}) => (
  <button
    type="button"
    aria-label={ariaLabel}
    onClick={onClick}
    className={cn(
      EXPLORE_CHIP_CLASS,
      'shrink-0 border-border/50 bg-muted/35 text-muted-foreground',
      'hover:bg-muted/50 hover:text-foreground'
    )}
  >
    {children}
  </button>
)

/** Compact delete chip — shared by History / list-detail anime rows. */
export const MyListDeleteChip = ({
  onClick,
  'aria-label': ariaLabel = 'حذف',
}: {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  'aria-label'?: string
}) => (
  <button
    type="button"
    aria-label={ariaLabel}
    onClick={onClick}
    className={cn(
      'inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-md border px-2',
      'border-border/50 bg-muted/35 text-[11px] font-medium text-muted-foreground',
      'transition-colors hover:bg-muted/50 hover:text-foreground'
    )}
  >
    <Delete02Icon className="h-3.5 w-3.5" />
    حذف
  </button>
)

/** @deprecated */
export const MyListSectionBar = MyListTabHeader
export const MyListPanelHeader = MyListTabHeader

/* ─── Compact surfaces ─── */

export const MyListCompactCard = ({
  children,
  className,
  as: Tag = 'article',
  onClick,
}: {
  children: ReactNode
  className?: string
  as?: 'article' | 'section' | 'div'
  onClick?: () => void
}) => (
  <Tag
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onClick()
            }
          }
        : undefined
    }
    className={cn(
      'surface-skeuo rounded-lg',
      'transition-[transform,background-color,box-shadow] duration-150',
      'active:scale-[0.995]',
      onClick && 'cursor-pointer',
      className
    )}
  >
    {children}
  </Tag>
)

/** @deprecated prefer MyListCompactCard */
export const MyListCard = MyListCompactCard

export const MyListPoster = ({
  src,
  alt = '',
  className,
}: {
  src: string
  alt?: string
  className?: string
}) => (
  <div
    className={cn(
      'relative w-12 aspect-[2/3] shrink-0 overflow-hidden rounded-md',
      'border border-border/50 bg-muted ring-1 ring-black/20',
      className
    )}
  >
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
      decoding="async"
    />
  </div>
)

/** @deprecated prefer MyListPoster */
export const MyListPosterThumb = ({
  src,
  alt = '',
  size,
  className,
}: {
  src: string
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) => {
  const sizes = { sm: 'w-10', md: 'w-12', lg: 'w-14' }
  return <MyListPoster src={src} alt={alt} className={cn(size ? sizes[size] : undefined, className)} />
}

export const MyListProgressBar = ({ percent }: { percent: number }) => (
  <div className="my-list-progress mt-0.5">
    <div
      className="my-list-progress-fill"
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
)

export const MyListBadgeRow = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <div className={cn('flex items-center gap-1 overflow-x-auto scrollbar-none', className)}>
    {children}
  </div>
)

export const MyListBadge = ({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: 'default' | 'primary' | 'muted' | 'success' | 'warning' | 'time'
  className?: string
}) => {
  /* Light: solid chips for contrast on white cards. Dark: soft glass tones. */
  const tones = {
    default:
      'border-transparent bg-zinc-900 text-white dark:border-white/15 dark:bg-white/12 dark:text-white/90',
    primary:
      'border-transparent bg-primary-500 text-white dark:border-primary-400/35 dark:bg-primary-400/20 dark:text-primary-100',
    muted:
      'border-transparent bg-zinc-200 text-zinc-800 dark:border-white/15 dark:bg-white/12 dark:text-white/85',
    success:
      'border-transparent bg-emerald-600 text-white dark:border-emerald-400/30 dark:bg-emerald-400/20 dark:text-emerald-200',
    warning:
      'border-transparent bg-amber-500 text-zinc-950 dark:border-amber-400/30 dark:bg-amber-400/20 dark:text-amber-200',
    time:
      'border-transparent bg-violet-600 text-white dark:border-primary-400/35 dark:bg-primary-400/20 dark:text-primary-100',
  }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-md border px-1.5 py-1',
        'text-[10px] leading-none font-medium whitespace-nowrap',
        'dark:backdrop-blur-md dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

/* ─── Empty / Error / Loading ─── */

export const MyListEmptyState = ({
  title,
  description,
  actionLabel = 'افزودن انیمه',
  actionTo = '/explore',
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
  onAction?: () => void
}) => (
  <div className="flex flex-col items-center justify-center min-h-[52vh] px-6 text-center">
    <img src={emptyListImage} alt="" className="w-40 mb-5 opacity-90" />
    <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-7 max-w-xs mb-6">{description}</p>
    {onAction ? (
      <Button
        type="button"
        size="lg"
        className="bg-primary-500 text-white font-bold rounded-lg px-6 hover:bg-primary-500/90"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    ) : (
      <Button
        asChild
        type="button"
        size="lg"
        className="bg-primary-500 text-white font-bold rounded-lg px-6 hover:bg-primary-500/90"
      >
        <Link to={actionTo}>{actionLabel}</Link>
      </Button>
    )}
  </div>
)

export const MyListErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center text-center gap-3 py-12 px-6">
    <p className="text-sm text-red-400">{message}</p>
    <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
      تلاش مجدد
    </Button>
  </div>
)

export const MyListSkeletonCards = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse flex gap-2 rounded-lg border border-border/40 bg-card/40 p-2"
      >
        <div className="w-12 aspect-[2/3] rounded-md bg-muted shrink-0" />
        <div className="flex-1 space-y-1.5 py-0.5">
          <div className="h-3.5 bg-muted rounded-md w-4/5" />
          <div className="h-3 bg-muted/70 rounded-md w-1/2" />
          <div className="h-1 bg-muted/50 rounded-full w-full mt-1" />
        </div>
      </div>
    ))}
  </div>
)

export const MyListGhostButton = ({
  children,
  onClick,
  className,
  destructive,
  'aria-label': ariaLabel,
}: {
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  className?: string
  destructive?: boolean
  'aria-label'?: string
}) => (
  <button
    type="button"
    aria-label={ariaLabel}
    onClick={onClick}
    className={cn(
      'inline-flex shrink-0 items-center justify-center rounded-lg p-1.5',
      'text-muted-foreground transition-colors duration-150',
      'hover:bg-muted/50 hover:text-foreground active:scale-95',
      destructive && 'hover:text-red-400',
      className
    )}
  >
    {children}
  </button>
)

export const MyListTextAction = ({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'w-full py-3 text-center text-sm font-medium text-primary-400',
      'transition-opacity active:opacity-70',
      disabled && 'opacity-40 cursor-not-allowed'
    )}
  >
    {children}
  </button>
)
