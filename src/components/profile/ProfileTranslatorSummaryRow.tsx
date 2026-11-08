import { ChevronLeft } from 'lucide-react'
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
      'flex min-w-0 flex-1 items-center justify-between gap-1 overflow-hidden rounded-xl',
      'border border-border/70 bg-card py-2 pl-2.5 pr-3',
      'dark:border-[#1e1e24] dark:bg-[#141418]'
    )}
  >
    <div className="min-w-0 text-right">
      <p className="truncate text-[17px] font-bold leading-6 text-foreground">{value}</p>
      <p className="line-clamp-2 text-[11.5px] leading-4 text-muted-foreground">{label}</p>
    </div>
    <ChevronLeft className="size-4 shrink-0 opacity-35" aria-hidden />
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
    <div className={cn('flex min-w-0 gap-2', className)}>
      <SummaryChip label="سابقه ترجمه" value={experienceValue} />
      <SummaryChip label="انیمه ترجمه‌شده" value={toPersianDigits(animeCount)} />
    </div>
  )
}
