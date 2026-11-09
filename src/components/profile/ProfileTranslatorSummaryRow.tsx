import { ChevronLeft } from 'lucide-react'
import { PROFILE_PANEL_CLASS } from '@/components/profile/profileStatsCard'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

type ProfileTranslatorSummaryRowProps = {
  animeCount: number
  experience: string | null | undefined
  className?: string
}

const SummaryChip = ({ label, value }: { label: string; value: string }) => (
  <div
    className={cn(
      PROFILE_PANEL_CLASS,
      'flex min-w-0 flex-1 items-center justify-between gap-1 overflow-hidden rounded-xl py-2.5 pl-2 pr-3'
    )}
  >
    <div className="min-w-0 text-right">
      <p className="truncate text-[17px] font-bold leading-6 text-foreground">{value}</p>
      <p className="line-clamp-2 text-[11.5px] leading-4 text-foreground/70">{label}</p>
    </div>
    <ChevronLeft className="size-4 shrink-0 opacity-35" aria-hidden />
  </div>
)

export const ProfileTranslatorSummaryRow = ({
  animeCount,
  experience,
  className,
}: ProfileTranslatorSummaryRowProps) => {
  const years = experience?.match(/[0-9۰-۹]+/)?.[0]
  const experienceValue = years ? toPersianDigits(years) : '—'

  return (
    <div className={cn('flex min-w-0 gap-2', className)}>
      <SummaryChip label="سال سابقه ترجمه" value={experienceValue} />
      <SummaryChip label="انیمه ترجمه‌شده" value={toPersianDigits(animeCount)} />
    </div>
  )
}
