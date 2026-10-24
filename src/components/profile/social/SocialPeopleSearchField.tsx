import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type SocialPeopleSearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

export const SocialPeopleSearchField = ({
  value,
  onChange,
  placeholder = 'نام یا آیدی تلگرام…',
  autoFocus,
  className,
}: SocialPeopleSearchFieldProps) => (
  <div className={cn('relative', className)}>
    <Search
      className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      aria-hidden
    />
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={cn(
        'ui-elevated h-11 border-border/60 bg-card pr-10 text-right',
        'placeholder:text-muted-foreground/70'
      )}
    />
  </div>
)
