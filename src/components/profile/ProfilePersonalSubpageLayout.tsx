import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

type ProfilePersonalSubpageLayoutProps = {
  title: string
  description?: string
  children: ReactNode
}

export const ProfilePersonalSubpageLayout = ({
  title,
  description,
  children,
}: ProfilePersonalSubpageLayoutProps) => (
  <div className="bg-background pb-24 text-foreground">
    <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col gap-1 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            شخصی
          </Link>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {description ? (
          <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
    <div className="px-4 pt-4">{children}</div>
  </div>
)
