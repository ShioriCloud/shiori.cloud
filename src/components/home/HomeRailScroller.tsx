import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type HomeRailScrollerProps = {
  children: ReactNode
  className?: string
}

/** Native horizontal poster rail — momentum scroll, no snap. */
export const HomeRailScroller = ({ children, className }: HomeRailScrollerProps) => (
  <div className={cn('home-rail-scroller scrollbar-none', className)}>
    <div className="home-rail-track">{children}</div>
  </div>
)

export const HomeRailSlide = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => <div className={cn('home-rail-slide', className)}>{children}</div>
