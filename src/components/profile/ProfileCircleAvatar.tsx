import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const PROFILE_AVATAR_RING_CLASS =
  'ring-[3px] ring-background/95 shadow-lg shadow-black/20'

type ProfileCircleAvatarProps = {
  children: ReactNode
  className?: string
  size?: 'md' | 'lg'
}

const sizeClass = {
  md: 'h-24 w-24',
  lg: 'h-[6.5rem] w-[6.5rem]',
}

/** Circular profile photo — used in orbit hero. */
export const ProfileCircleAvatar = ({
  children,
  className,
  size = 'lg',
}: ProfileCircleAvatarProps) => (
  <div
    className={cn(
      'relative shrink-0 overflow-hidden rounded-full bg-muted',
      PROFILE_AVATAR_RING_CLASS,
      sizeClass[size],
      className
    )}
  >
    {children}
  </div>
)
