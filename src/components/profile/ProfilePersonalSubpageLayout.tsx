import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ProfilePersonalSubpageLayoutProps = {
  title: string
  description?: string
  titleLeading?: ReactNode
  titleAddon?: ReactNode
  headerAfter?: ReactNode
  stickyHeader?: boolean
  /** Skip duplicate page title (mini-app already shows back + context). */
  hideHeader?: boolean
  children: ReactNode
  contentClassName?: string
}

const SubpageHeader = ({
  title,
  description,
  titleLeading,
  titleAddon,
  headerAfter,
}: Pick<
  ProfilePersonalSubpageLayoutProps,
  'title' | 'description' | 'titleLeading' | 'titleAddon' | 'headerAfter'
>) => (
  <>
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {titleLeading}
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {titleAddon ? <div className="shrink-0 text-left">{titleAddon}</div> : null}
    </div>
    {headerAfter ? <div className="mt-4">{headerAfter}</div> : null}
  </>
)

export const ProfilePersonalSubpageLayout = ({
  title,
  description,
  titleLeading,
  titleAddon,
  headerAfter,
  stickyHeader = false,
  hideHeader = false,
  children,
  contentClassName,
}: ProfilePersonalSubpageLayoutProps) => (
  <div className="bg-background pb-24 text-foreground" dir="rtl">
    {!hideHeader ? (
      stickyHeader ? (
        <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/40 bg-background/95 backdrop-blur-sm">
          <div className="px-4 pt-4 pb-3">
            <SubpageHeader
              title={title}
              description={description}
              titleLeading={titleLeading}
              titleAddon={titleAddon}
              headerAfter={headerAfter}
            />
          </div>
        </div>
      ) : (
        <header className="border-b border-border/40 px-4 pt-4 pb-3">
          <SubpageHeader
            title={title}
            description={description}
            titleLeading={titleLeading}
            titleAddon={titleAddon}
            headerAfter={headerAfter}
          />
        </header>
      )
    ) : null}
    <div className={cn(hideHeader ? 'px-4 pt-4' : 'px-4 pt-4', contentClassName)}>
      {children}
    </div>
  </div>
)
