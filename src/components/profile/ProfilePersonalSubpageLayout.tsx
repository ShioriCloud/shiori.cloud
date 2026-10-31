import type { ReactNode } from 'react'

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
    <div className="px-4 pt-4">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </div>
  </div>
)
