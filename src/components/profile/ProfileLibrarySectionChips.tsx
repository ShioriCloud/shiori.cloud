import { hapticSelection } from '@/lib/telegramHaptics'
import { cn } from '@/lib/utils'
import type { ProfileLibrarySectionId } from '@/components/profile/profileTabs'

type Chip = { id: ProfileLibrarySectionId; label: string }

type ProfileLibrarySectionChipsProps = {
  chips: Chip[]
  active: ProfileLibrarySectionId
  onChange: (id: ProfileLibrarySectionId) => void
  className?: string
}

export const ProfileLibrarySectionChips = ({
  chips,
  active,
  onChange,
  className,
}: ProfileLibrarySectionChipsProps) => (
  <div className={cn('flex flex-wrap gap-2', className)}>
    {chips.map((chip) => {
      const isActive = chip.id === active
      return (
        <button
          key={chip.id}
          type="button"
          onClick={() => {
            if (chip.id === active) return
            hapticSelection()
            onChange(chip.id)
          }}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
            isActive
              ? 'border-primary-400/50 bg-primary-400/15 text-primary-300'
              : 'border-border/60 bg-card/60 text-muted-foreground active:bg-muted/50'
          )}
          aria-pressed={isActive}
        >
          {chip.label}
        </button>
      )
    })}
  </div>
)
