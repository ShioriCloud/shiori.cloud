import * as React from 'react'
import { DayPicker, getDefaultClassNames, type DayButton, type Locale } from 'react-day-picker'
import { DayPicker as PersianDayPicker } from 'react-day-picker/persian'
import { addMonths } from 'date-fns'
import {
  addMonths as addJalaliMonths,
  format as formatJalali,
  getMonth as getJalaliMonth,
  getYear as getJalaliYear,
  setDate as setJalaliDate,
  setMonth as setJalaliMonth,
  setYear as setJalaliYear,
} from 'date-fns-jalali'
import { faIR as faJalali } from 'date-fns-jalali/locale'

import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'dropdown',
  buttonVariant = 'ghost',
  locale,
  formatters,
  components,
  persian = false,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
  /** Jalali month grid and Shamsi year/month dropdowns. */
  persian?: boolean
}) {
  const defaultClassNames = getDefaultClassNames()
  const Picker = (persian ? PersianDayPicker : DayPicker) as typeof DayPicker
  const currentYear = persian ? getJalaliYear(new Date()) : new Date().getFullYear()
  const fromYear = (props as { fromYear?: number }).fromYear ?? (persian ? currentYear - 40 : currentYear - 80)
  const toYear = (props as { toYear?: number }).toYear ?? (persian ? currentYear + 2 : currentYear + 10)

  const selectedProp = (props as any).selected
  const selectedSingleDate = selectedProp instanceof Date ? selectedProp : undefined

  const isControlledMonth = props.month instanceof Date
  const [internalMonth, setInternalMonth] = React.useState<Date>(
    (props.month as Date | undefined) ??
      (props.defaultMonth as Date | undefined) ??
      selectedSingleDate ??
      new Date()
  )
  const month = (props.month as Date | undefined) ?? internalMonth

  React.useEffect(() => {
    if (isControlledMonth) return
    if (!selectedSingleDate) return
    setInternalMonth(selectedSingleDate)
  }, [isControlledMonth, selectedSingleDate])

  const handleMonthChange = React.useCallback(
    (next: Date) => {
      if (!isControlledMonth) setInternalMonth(next)
      props.onMonthChange?.(next)
    },
    [isControlledMonth, props]
  )

  const years = React.useMemo(() => {
    const out: number[] = []
    for (let y = fromYear; y <= toYear; y++) out.push(y)
    return out
  }, [fromYear, toYear])

  const monthIndex = persian ? getJalaliMonth(month) : month.getMonth()
  const yearValue = persian ? getJalaliYear(month) : month.getFullYear()
  const shiftMonth = (base: Date, amount: number) =>
    persian ? addJalaliMonths(base, amount) : addMonths(base, amount)

  const monthItems = React.useMemo(() => {
    if (persian) {
      return Array.from({ length: 12 }, (_, i) => ({
        value: String(i),
        label: formatJalali(setJalaliDate(setJalaliMonth(new Date(), i), 1), 'MMMM', {
          locale: faJalali,
        }),
      }))
    }
    const base = new Date(2020, 0, 1)
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(base)
      d.setMonth(i)
      const label = d.toLocaleString(locale?.code, { month: 'short' })
      return { value: String(i), label }
    })
  }, [locale?.code, persian])

  return (
    <div
      className={cn(
        'rounded-lg bg-background p-3 text-foreground',
        persian && 'w-full',
        className
      )}
    >
      {captionLayout === 'dropdown' && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant={buttonVariant}
            size="icon"
            onClick={() => handleMonthChange(shiftMonth(month, -1))}
            aria-label="ماه قبل"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Select
              value={String(monthIndex)}
              onValueChange={(v) => {
                handleMonthChange(
                  persian ? setJalaliMonth(month, Number(v)) : new Date(month.getFullYear(), Number(v), month.getDate())
                )
              }}
            >
              <SelectTrigger className="h-8 gap-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[90]">
                {monthItems.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(yearValue)}
              onValueChange={(v) => {
                handleMonthChange(persian ? setJalaliYear(month, Number(v)) : new Date(Number(v), month.getMonth(), month.getDate()))
              }}
            >
              <SelectTrigger className="h-8 gap-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[90]">
                {years.map((y) => (
                  <SelectItem key={String(y)} value={String(y)}>
                    {persian ? toPersianDigits(y) : String(y)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant={buttonVariant}
            size="icon"
            onClick={() => handleMonthChange(shiftMonth(month, 1))}
            aria-label="ماه بعد"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Picker
        showOutsideDays={showOutsideDays}
        fromYear={(props as any).fromYear ?? fromYear}
        toYear={(props as any).toYear ?? toYear}
        month={month}
        onMonthChange={handleMonthChange}
        captionLayout="label"
        {...(persian ? { dir: 'rtl' as const, numerals: 'arabext' as const } : { locale })}
        formatters={{
          formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: 'short' }),
          ...formatters,
        }}
        className={cn(
          'group/calendar',
          String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
          String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`
        )}
        classNames={{
          root: cn(defaultClassNames.root, persian ? 'w-full' : 'w-fit'),
          months: cn(
            defaultClassNames.months,
            'relative flex flex-col gap-4',
            persian ? 'w-full' : 'sm:flex-row'
          ),
          month: cn(defaultClassNames.month, 'w-full space-y-3'),
          month_caption: cn(defaultClassNames.month_caption, 'hidden'),
          nav: cn(defaultClassNames.nav, 'hidden'),
          button_previous: cn(defaultClassNames.button_previous, 'hidden'),
          button_next: cn(defaultClassNames.button_next, 'hidden'),
          dropdowns: cn(defaultClassNames.dropdowns, 'hidden'),
          dropdown_root: cn(defaultClassNames.dropdown_root, 'hidden'),
          dropdown: cn(defaultClassNames.dropdown, 'hidden'),
          caption_label: cn(defaultClassNames.caption_label, 'hidden'),
          table: 'w-full border-collapse',
          weekdays: cn(defaultClassNames.weekdays, 'flex w-full'),
          weekday: cn(
            defaultClassNames.weekday,
            'flex h-8 w-[14.285%] items-center justify-center text-center text-[0.8rem] font-normal text-muted-foreground select-none'
          ),
          week: cn(defaultClassNames.week, 'mt-1 flex w-full'),
          week_number_header: cn(defaultClassNames.week_number_header, 'w-9 select-none'),
          week_number: cn(
            defaultClassNames.week_number,
            'text-[0.8rem] text-muted-foreground select-none'
          ),
          day: cn(
            defaultClassNames.day,
            'group/day relative flex h-10 w-[14.285%] items-center justify-center p-0 text-center text-sm select-none'
          ),
          range_start: cn(defaultClassNames.range_start, 'rounded-l-md bg-muted'),
          range_middle: cn(defaultClassNames.range_middle, 'rounded-none'),
          range_end: cn(defaultClassNames.range_end, 'rounded-r-md bg-muted'),
          // Highlight lives on the day button, not the cell — avoids off-center today boxes.
          today: cn(defaultClassNames.today, 'bg-transparent'),
          outside: cn(
            defaultClassNames.outside,
            'text-muted-foreground aria-selected:text-muted-foreground'
          ),
          disabled: cn(defaultClassNames.disabled, 'text-muted-foreground opacity-50'),
          hidden: cn(defaultClassNames.hidden, 'invisible'),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => {
            return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
          },
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === 'left') {
              return <ChevronRightIcon className={cn('size-4', className)} {...props} />
            }

            if (orientation === 'right') {
              return <ChevronLeftIcon className={cn('size-4', className)} {...props} />
            }

            return <ChevronDownIcon className={cn('size-4', className)} {...props} />
          },
          DayButton: ({ ...props }) => <CalendarDayButton locale={locale} {...props} />,
          WeekNumber: ({ children, ...props }) => {
            return (
              <td {...props}>
                <div className="flex h-9 w-9 items-center justify-center text-center">
                  {children}
                </div>
              </td>
            )
          },
          ...components,
        }}
        {...props}
      />
    </div>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & {
  locale?: Partial<Locale>
}) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const selectedSingle =
    modifiers.selected &&
    !modifiers.range_start &&
    !modifiers.range_end &&
    !modifiers.range_middle

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={selectedSingle || undefined}
      data-range-start={modifiers.range_start || undefined}
      data-range-end={modifiers.range_end || undefined}
      data-range-middle={modifiers.range_middle || undefined}
      className={cn(
        defaultClassNames.day_button,
        'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-0',
        'text-sm font-normal leading-none tabular-nums text-foreground',
        'outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
        'focus-visible:ring-2 focus-visible:ring-ring',
        modifiers.today &&
          !modifiers.selected &&
          'bg-muted text-foreground hover:bg-muted hover:text-foreground',
        selectedSingle && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
        modifiers.range_start && 'rounded-md bg-primary text-primary-foreground',
        modifiers.range_end && 'rounded-md bg-primary text-primary-foreground',
        modifiers.range_middle && 'rounded-none bg-muted text-foreground',
        modifiers.outside && 'text-muted-foreground',
        modifiers.disabled && 'opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
