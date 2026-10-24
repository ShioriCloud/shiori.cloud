import { cn } from '@/lib/utils'
import { SOCIAL_SURFACE_CLASS } from './socialUi'

export const SocialListSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={cn(SOCIAL_SURFACE_CLASS, 'animate-pulse p-3')}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-muted/80" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/5 rounded-md bg-muted/80" />
            <div className="h-2.5 w-1/3 rounded-md bg-muted/60" />
          </div>
        </div>
        <div className="mt-3 flex gap-3 border-t border-border/30 pt-3">
          <div className="h-[4.5rem] w-[4.25rem] rounded-xl bg-muted/70" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-full rounded-md bg-muted/80" />
            <div className="h-2.5 w-2/3 rounded-md bg-muted/60" />
          </div>
        </div>
      </div>
    ))}
  </div>
)
