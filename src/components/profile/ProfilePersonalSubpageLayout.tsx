import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ProfilePersonalSubpageLayoutProps = {
  title: string
  description?: string
  titleAddon?: ReactNode
  headerAfter?: ReactNode
  children: ReactNode
  contentClassName?: string
}

export const ProfilePersonalSubpageLayout = ({
  title,
  description,
  titleAddon,
  headerAfter,
  children,
  contentClassName,
}: ProfilePersonalSubpageLayoutProps) => (
  <div className="bg-background pb-24 text-foreground">
    <header className="border-b border-border/40 px-4 pt-4 pb-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1 text-right">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {titleAddon ? <div className="shrink-0">{titleAddon}</div> : null}
      </div>
      {headerAfter ? <div className="mt-4">{headerAfter}</div> : null}
    </header>
    <div className={cn('px-4 pt-4', contentClassName)}>{children}</div>
  </div>
)
