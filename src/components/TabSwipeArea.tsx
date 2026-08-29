import type { ReactNode } from 'react'
import { useTabSwipeNavigation } from '@/hooks/useTabSwipeNavigation'
import { withViewTransition } from '@/lib/viewTransition'
import { cn } from '@/lib/utils'

/** Fills the viewport below fixed layout header + bottom nav so empty space still accepts swipes. */
export const TAB_SWIPE_FIXED_HEADER_CLASS =
  'min-h-[calc(100dvh-var(--app-header-offset)-5.5rem-var(--app-tg-bottom-inset,0px))]'

/** Explore renders AppHeader in-page instead of the layout fixed header. */
export const TAB_SWIPE_IN_PAGE_HEADER_CLASS =
  'min-h-[calc(100dvh-var(--app-tg-top-inset)-5.5rem-var(--app-tg-bottom-inset,0px))]'

type TabSwipeAreaProps<T extends string> = {
  tabs: readonly T[]
  active: T
  onChange: (tab: T) => void
  enabled?: boolean
  className?: string
  children: ReactNode
}

export const TabSwipeArea = <T extends string>({
  tabs,
  active,
  onChange,
  enabled = true,
  className,
  children,
}: TabSwipeAreaProps<T>) => {
  const handleChange = (tab: T) => {
    withViewTransition(() => onChange(tab))
  }

  const swipeHandlers = useTabSwipeNavigation({ tabs, active, onChange: handleChange, enabled })

  return (
    <div className={cn('touch-pan-y flex flex-col', className)} {...swipeHandlers}>
      {children}
    </div>
  )
}
