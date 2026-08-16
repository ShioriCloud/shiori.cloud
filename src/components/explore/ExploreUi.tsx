import type { ReactNode } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { tabThumbTransition } from '@/components/AnimatedTabContent'
import { hapticSelection } from '@/lib/telegramHaptics'
import { cn } from '@/lib/utils'
import emptyExploreImage from '@/assets/images/frieren-03.webp'

/** Shared sticky chrome for Explore list / season headers (keep heights in sync). */
export const EXPLORE_STICKY_SHELL_CLASS =
  'sticky top-[var(--app-sticky-top)] z-20 -mx-4 px-4 py-2.5 bg-background/95 backdrop-blur-md'

/** Chip style shared by filter/sort buttons and season result count. */
export const EXPLORE_CHIP_CLASS =
  'ui-elevated inline-flex h-9 min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/50'

type ExploreTabBarProps<T extends string> = {
  tabs: { id: T; label: string }[]
  active: T
  onChange: (id: T) => void
  className?: string
  /** Unique id so multiple bars on one page do not share one thumb. */
  layoutId?: string
}

export const ExploreTabBar = <T extends string>({
  tabs,
  active,
  onChange,
  className,
  layoutId = 'explore-tab-thumb',
}: ExploreTabBarProps<T>) => {
  const reduceMotion = useReducedMotion()

  return (
    <LayoutGroup id={layoutId}>
      <div className={cn('home-type-tabs relative flex rounded-xl p-1', className)}>
        {tabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === active) return
                hapticSelection()
                onChange(tab.id)
              }}
              className={cn(
                'relative flex-1 min-h-10 py-2.5 rounded-[10px] text-sm transition-colors duration-200',
                isActive
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={isActive}
            >
              {isActive ? (
                reduceMotion ? (
                  <span aria-hidden className="home-type-tabs-thumb absolute inset-0 rounded-[10px]" />
                ) : (
                  <motion.span
                    layoutId={layoutId}
                    aria-hidden
                    className="home-type-tabs-thumb absolute inset-0 rounded-[10px]"
                    transition={tabThumbTransition}
                  />
                )
              ) : null}
              <span className="relative z-10">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

export const ExploreSectionTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-sm font-semibold text-foreground mb-2">{children}</h3>
)

export const ExploreEmptyState = ({
  title,
  subtitle,
  showImage = true,
  actionLabel,
  onAction,
  compact,
}: {
  title: string
  subtitle?: string
  /** Frieren empty art — on for no-results; errors can opt in too. */
  showImage?: boolean
  actionLabel?: string
  onAction?: () => void
  /** Tighter padding for inline section errors (Home rails, etc.). */
  compact?: boolean
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center gap-2 px-6',
      compact ? 'py-8' : 'py-16'
    )}
  >
    {showImage ? (
      <img
        src={emptyExploreImage}
        alt=""
        className={cn('opacity-90', compact ? 'mb-2 w-28' : 'mb-3 w-40')}
      />
    ) : null}
    <h2 className="text-base font-semibold text-foreground">{title}</h2>
    {subtitle ? (
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{subtitle}</p>
    ) : null}
    {onAction && actionLabel ? (
      <Button
        type="button"
        size={compact ? 'default' : 'lg'}
        className={cn(
          'font-semibold px-6',
          compact ? 'mt-3 h-10' : 'mt-4 h-11',
          SHIORI_PRIMARY_BUTTON_CLASS
        )}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    ) : null}
  </div>
)

export const ExploreOptionButton = ({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean
  children: ReactNode
  onClick: () => void
  className?: string
}) => (
  <button
    type="button"
    onClick={() => {
      hapticSelection()
      onClick()
    }}
    className={cn(
      'ui-elevated min-h-11 rounded-xl px-3 py-2.5 text-sm text-start transition-colors',
      active
        ? 'border-primary-400/45 bg-primary-400/15 font-semibold text-primary-700 dark:border-primary-400/25 dark:bg-primary-500/15 dark:text-primary-200'
        : 'text-foreground hover:bg-muted/50',
      className
    )}
  >
    {children}
  </button>
)

/** Primary CTA — Shiori purple (sheet footers, empty states, …). */
export const SHIORI_PRIMARY_BUTTON_CLASS =
  'ui-elevated-primary bg-primary-500 text-white hover:bg-primary-500/90'

/** Secondary elevated control matching default chips / outline actions. */
export const SHIORI_SECONDARY_BUTTON_CLASS =
  'ui-elevated border-black/[0.08] bg-white text-foreground hover:bg-muted/50 dark:border-border dark:bg-card'
