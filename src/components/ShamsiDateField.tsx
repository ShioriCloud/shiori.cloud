import { useState } from 'react'
import { format } from 'date-fns'
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          'h-9 w-full justify-start gap-1.5 rounded-xl border-border/70 bg-card/50 px-2 text-xs font-normal shadow-none',
          !selected && 'text-muted-foreground'
        )}
      >
        <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{display}</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          data-shamsi-calendar=""
          side="bottom"
          overlayClassName="z-[70]"
          className={cn(
            'z-[70] flex w-full max-w-none flex-col gap-0 rounded-t-2xl border-t border-border bg-background p-0',
            'pb-[max(0.75rem,var(--app-tg-bottom-inset))]'
          )}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            const target = event.target
            if (!(target instanceof Element)) return
            if (target.closest('[role="listbox"]') || target.closest('[data-radix-select-content]')) {
              event.preventDefault()
            }
          }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1.5 w-12 rounded-full bg-muted-foreground/35" />
          </div>
          <SheetHeader className="border-0 px-4 pb-2 pt-1">
            <SheetTitle className="text-sm">{label}</SheetTitle>
          </SheetHeader>
          <div className="px-2 pb-1">
            <Calendar
              persian
              mode="single"
              selected={selected}
              onSelect={(date) => {
                onChange(date ? format(date, 'yyyy-MM-dd') : '')
                if (date) setOpen(false)
              }}
              className="w-full max-w-none rounded-none bg-transparent p-2"
            />
          </div>
          {value ? (
            <div className="border-t border-border px-4 py-2">
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
        </SheetContent>
      </Sheet>
    </div>
  )
}
