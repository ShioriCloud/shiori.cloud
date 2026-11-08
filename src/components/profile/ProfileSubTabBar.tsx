import { EXPLORE_CHIP_CLASS } from '@/components/explore/ExploreUi'
import { hapticSelection } from '@/lib/telegramHaptics'
import { cn } from '@/lib/utils'

type ProfileSubTabBarProps<T extends string> = {
  tabs: ReadonlyArray<{ id: T; label: string }>
  active: T
  onChange: (id: T) => void
  className?: string
}

/** Secondary tab row (v3) — chip style aligned with Explore. */
export const ProfileSubTabBar = <T extends string>({
  tabs,
  active,
  onChange,
  className,
}: ProfileSubTabBarProps<T>) => (
  <div
    className={cn(
      'flex flex-wrap justify-end gap-2 border-b border-border/40 pb-2',
      className
    )}
    role="tablist"
    aria-label="زیرتب‌های پروفایل"
  >
    {tabs.map((tab) => {
      const isActive = tab.id === active
      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => {
            if (isActive) return
            hapticSelection()
            onChange(tab.id)
          }}
          className={cn(
            EXPLORE_CHIP_CLASS,
            'min-h-8 px-3 text-xs',
            isActive
              ? 'bg-primary-500/15 text-primary-700 dark:text-primary-200'
              : 'text-muted-foreground'
          )}
        >
          {tab.label}
        </button>
      )
    })}
  </div>
)
