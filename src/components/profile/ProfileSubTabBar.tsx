import { hapticSelection } from '@/lib/telegramHaptics'
import { cn } from '@/lib/utils'

type ProfileSubTabBarProps<T extends string> = {
  tabs: ReadonlyArray<{ id: T; label: string }>
  active: T
  onChange: (id: T) => void
  className?: string
}

/** همان قاب تب‌های اصلی؛ حالت فعال با رنگ بنفش زیرتب‌ها. */
export const ProfileSubTabBar = <T extends string>({
  tabs,
  active,
  onChange,
  className,
}: ProfileSubTabBarProps<T>) => (
  <div
    className={cn('home-type-tabs relative flex rounded-xl p-1', className)}
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
            'relative min-h-9 flex-1 rounded-[10px] py-2 text-xs transition-all duration-200',
            isActive ? 'font-semibold text-[#a78bfa]' : 'font-medium text-muted-foreground hover:text-foreground'
          )}
        >
          {isActive ? (
            <span
              aria-hidden
              className="absolute inset-0 rounded-[10px] border border-[#3a2766] bg-primary-500/15"
            />
          ) : null}
          <span className="relative z-10">{tab.label}</span>
        </button>
      )
    })}
  </div>
)
