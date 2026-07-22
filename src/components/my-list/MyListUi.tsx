import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {meta}
        </span>
      ) : null}
      {action}
    </div>
  </div>
)

/** @deprecated */
export const MyListSectionBar = MyListTabHeader
export const MyListPanelHeader = MyListTabHeader

/* ─── Compact surfaces ─── */

export const MyListCompactCard = ({
  children,
  className,
  as: Tag = 'article',
}: {
  children: ReactNode
  className?: string
  as?: 'article' | 'section' | 'div'
}) => (
  <Tag
    className={cn(
      'rounded-xl border border-border/50 bg-card/50',
      'transition-transform duration-150 active:scale-[0.995]',
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
      'relative w-14 aspect-[2/3] shrink-0 overflow-hidden rounded-lg',
      'border border-border/80 bg-muted',
      className
    )}
  >
    <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
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
  const sizes = { sm: 'w-11', md: 'w-14', lg: 'w-16' }
  return <MyListPoster src={src} alt={alt} className={cn(size ? sizes[size] : undefined, className)} />
}

export const MyListProgressBar = ({ percent }: { percent: number }) => (
  <div className="my-list-progress">
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
  <div
    className={cn(
      'flex items-center gap-1 overflow-x-auto scrollbar-none',
      className
    )}
  >
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
  const tones = {
    default: 'border-border/60 bg-muted/40 text-muted-foreground',
    primary: 'border-primary-400/30 bg-primary-400/10 text-primary-400',
    muted: 'border-border/50 bg-background/40 text-muted-foreground',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    time: 'border-primary-400/25 bg-primary-400/10 text-primary-400',
  }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-md border px-1.5 py-px',
        'text-[10px] leading-4 font-medium whitespace-nowrap',
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
        className="animate-pulse flex gap-2.5 rounded-xl border border-border/40 bg-card/30 p-2.5"
      >
        <div className="w-14 aspect-[2/3] rounded-lg bg-muted shrink-0" />
        <div className="flex-1 space-y-2 py-0.5">
          <div className="h-3.5 bg-muted rounded w-4/5" />
          <div className="h-3 bg-muted/70 rounded w-2/3" />
          <div className="h-1 bg-muted/50 rounded-full w-full" />
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
  onClick?: () => void
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
