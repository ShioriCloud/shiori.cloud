import { hapticSelection } from '@/lib/telegramHaptics'
import { cn } from '@/lib/utils'

type ProfileSubTabBarProps<T extends string> = {
  tabs: ReadonlyArray<{ id: T; label: string }>
  active: T
  onChange: (id: T) => void
  className?: string
}

/** زیرتب‌های پروفایل — قرص‌های فیگما v3، چسبیده به شروع ردیف. */
export const ProfileSubTabBar = <T extends string>({
  tabs,
  active,
  onChange,
  className,
}: ProfileSubTabBarProps<T>) => (
  <div
    className={cn('flex flex-wrap items-center gap-2', className)}
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
            'rounded-full px-3 py-1 text-[12.5px] leading-[18px] transition-colors',
            isActive
              ? 'bg-primary-500/15 font-semibold text-[#a78bfa]'
              : 'border border-border/80 font-normal text-muted-foreground'
          )}
        >
          {tab.label}
        </button>
      )
    })}
  </div>
)
