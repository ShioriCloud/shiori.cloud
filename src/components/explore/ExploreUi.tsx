import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Shared sticky chrome for Explore list / season headers (keep heights in sync). */
export const EXPLORE_STICKY_SHELL_CLASS =
  'sticky top-[var(--app-tg-top-inset)] z-20 -mx-4 px-4 py-2.5 bg-background/95 backdrop-blur-md'

/** Chip style shared by filter/sort buttons and season result count. */
export const EXPLORE_CHIP_CLASS =
  'inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 text-xs font-medium text-foreground transition-colors'

type ExploreTabBarProps<T extends string> = {
  tabs: { id: T; label: string }[]
  active: T
  onChange: (id: T) => void
  className?: string
}

export const ExploreTabBar = <T extends string>({
  tabs,
  active,
  onChange,
  className,
}: ExploreTabBarProps<T>) => (
  <div className={cn('relative flex rounded-xl border border-border bg-muted/20', className)}>
    {tabs.map((tab) => {
      const isActive = active === tab.id
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex-1 py-2.5 rounded-xl text-sm transition-all duration-200',
            isActive ? 'text-primary-400 font-semibold' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={isActive}
        >
          {isActive && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-xl bg-primary-400/15 border border-primary-400/35 shadow-sm shadow-primary-400/10"
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      )
    })}
  </div>
)

export const ExploreSectionTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-sm font-semibold text-foreground mb-2">{children}</h3>
)

export const ExploreEmptyState = ({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) => (
  <div className="flex flex-col items-center justify-center text-center gap-2 py-20 px-6">
    <h2 className="text-base font-semibold text-foreground">{title}</h2>
    {subtitle ? <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{subtitle}</p> : null}
  </div>
)

export const ExploreOptionButton = ({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: ReactNode
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'rounded-xl border px-3 py-2.5 text-sm transition-colors text-start',
      active
        ? 'border-primary-400/50 bg-primary-400/15 text-primary-400 font-semibold'
        : 'border-border bg-muted/30 text-foreground hover:bg-muted/50'
    )}
  >
    {children}
  </button>
)
