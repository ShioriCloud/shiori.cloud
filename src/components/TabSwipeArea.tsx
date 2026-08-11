import type { ReactNode } from 'react'
import { useTabSwipeNavigation } from '@/hooks/useTabSwipeNavigation'
import { cn } from '@/lib/utils'

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
  const swipeHandlers = useTabSwipeNavigation({ tabs, active, onChange, enabled })

  return (
    <div className={cn('touch-pan-y', className)} {...swipeHandlers}>
      {children}
    </div>
  )
}
