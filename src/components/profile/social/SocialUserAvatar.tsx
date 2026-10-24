import { UserIcon } from 'hugeicons-react'
import { cn } from '@/lib/utils'

const sizeClass = {
  sm: 'h-9 w-9 rounded-lg',
  md: 'h-11 w-11 rounded-xl',
  lg: 'h-14 w-14 rounded-2xl',
} as const

type SocialUserAvatarProps = {
  photoUrl: string | null | undefined
  displayName: string
  size?: keyof typeof sizeClass
  className?: string
}

export const SocialUserAvatar = ({
  photoUrl,
  displayName,
  size = 'md',
  className,
}: SocialUserAvatarProps) => (
  <div
    className={cn(
      'relative shrink-0 overflow-hidden border border-border/50 bg-muted',
      'ring-2 ring-background/80',
      sizeClass[size],
      className
    )}
  >
    {photoUrl ? (
      <img src={photoUrl} alt="" className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-primary-400/10">
        <UserIcon
          className={cn(
            'text-muted-foreground/55',
            size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
          )}
          aria-hidden
        />
      </div>
    )}
    <span className="sr-only">{displayName}</span>
  </div>
)
