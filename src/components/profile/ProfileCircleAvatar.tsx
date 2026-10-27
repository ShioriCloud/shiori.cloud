import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ProfileHeroAvatarProps = {
  children: ReactNode
  className?: string
}

/** Square skeuo profile photo (hero). */
export const ProfileHeroAvatar = ({ children, className }: ProfileHeroAvatarProps) => (
  <div className={cn('media-card-skeuo h-24 w-24 shrink-0 rounded-2xl', className)}>
    <div className="media-card-skeuo-face relative h-full w-full overflow-hidden bg-muted">
      {children}
    </div>
  </div>
)

/** @deprecated use ProfileHeroAvatar */
export const ProfileCircleAvatar = ProfileHeroAvatar
