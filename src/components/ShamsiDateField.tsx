import { useState } from 'react'
import { format } from 'date-fns'
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

const parseYmd = (value: string): Date | undefined => {
  const raw = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined
  const [year, month, day] = raw.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? undefined : date
}

type ShamsiDateFieldProps = {
  label: string
  value: string
  onChange: (next: string) => void
  disabled?: boolean
}

export function ShamsiDateField({ label, value, onChange, disabled }: ShamsiDateFieldProps) {
  const [open, setOpen] = useState(false)
  const selected = parseYmd(value)
  const display = selected
    ? toPersianDigits(formatJalali(selected, 'd MMMM yyyy', { locale: faIR }))
    : 'انتخاب تاریخ'

  return (
    <div className="min-w-0">
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</span>
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'h-9 w-full justify-start gap-1.5 rounded-xl border-border/70 bg-card/50 px-2 text-xs font-normal shadow-none',
              !selected && 'text-muted-foreground'
            )}
          >
            <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{display}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          data-shamsi-calendar=""
          align="start"
          className="z-[80] w-auto p-0"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Calendar
            persian
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onChange(date ? format(date, 'yyyy-MM-dd') : '')
              if (date) setOpen(false)
            }}
          />
          {value ? (
            <div className="border-t border-border px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onChange('')
                  setOpen(false)
                }}
              >
                پاک کردن
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  )
}
