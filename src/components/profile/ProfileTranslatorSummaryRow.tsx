import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

type ProfileTranslatorSummaryRowProps = {
  animeCount: number
  experience: string | null | undefined
  className?: string
}

const SummaryChip = ({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) => (
  <div
    className={cn(
      'flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl',
      'border border-border/70 bg-card/90 px-3 py-2.5 text-right',
      className
    )}
    dir="rtl"
  >
    <span className="text-[11px] leading-tight text-muted-foreground">{label}</span>
    <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">{value}</span>
  </div>
)

export const ProfileTranslatorSummaryRow = ({
  animeCount,
  experience,
  className,
}: ProfileTranslatorSummaryRowProps) => {
  const experienceValue =
    experience && experience.trim().length > 0 ? experience.trim() : '—'

  return (
    <div className={cn('flex gap-2', className)} dir="rtl">
      <SummaryChip
        label="انیمه ترجمه‌شده"
        value={toPersianDigits(animeCount)}
      />
      <SummaryChip label="سابقه ترجمه" value={experienceValue} />
    </div>
  )
}
