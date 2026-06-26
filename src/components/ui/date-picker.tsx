import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Props {
  value: string       // YYYY-MM-DD or ''
  onChange: (value: string) => void
  placeholder?: string
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatLabel(iso: string): string {
  const date = parseLocal(iso)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (date.getTime() === today.getTime()) return 'Today'
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const cells: (Date | null)[] = Array(first.getDay()).fill(null)
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d))
  return cells
}

export function DatePicker({ value, onChange, placeholder = 'Due date' }: Props) {
  const today = React.useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const selected = value ? parseLocal(value) : null
  const [open, setOpen] = React.useState(false)
  const [cursor, setCursor] = React.useState<{ year: number; month: number }>(() => {
    const base = selected ?? today
    return { year: base.getFullYear(), month: base.getMonth() }
  })

  // Keep cursor in sync when value changes externally
  React.useEffect(() => {
    if (selected) setCursor({ year: selected.getFullYear(), month: selected.getMonth() })
  }, [value])

  function prevMonth() {
    setCursor(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    )
  }
  function nextMonth() {
    setCursor(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    )
  }

  function pick(date: Date) {
    onChange(toISO(date))
    setOpen(false)
  }

  const days = getDays(cursor.year, cursor.month)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-1.5 h-9 px-3 rounded border text-sm transition-all duration-150 cursor-pointer',
            value
              ? 'border-accent/40 bg-accent-light text-accent'
              : 'border-border bg-card text-muted hover:text-foreground'
          )}
        >
          <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">{value ? formatLabel(value) : placeholder}</span>
          {value && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onChange('') }}
              className="ml-0.5 hover:opacity-60 transition-opacity"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="start"
          className={cn(
            'z-50 w-[272px] rounded-xl border border-border bg-card shadow-card-hover p-4',
            'data-[state=open]:animate-dialog-in outline-none'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-muted hover:text-foreground hover:bg-border/60 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {MONTHS[cursor.month]} {cursor.year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-muted hover:text-foreground hover:bg-border/60 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="flex items-center justify-center h-8 text-[11px] font-medium text-muted">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {days.map((date, i) => {
              if (!date) return <div key={`e-${i}`} />

              const iso = toISO(date)
              const isToday = date.getTime() === today.getTime()
              const isSelected = selected && date.getTime() === selected.getTime()

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => pick(date)}
                  className={cn(
                    'flex items-center justify-center h-8 w-full rounded-lg text-sm transition-all duration-100',
                    isSelected
                      ? 'bg-accent text-white font-semibold'
                      : isToday
                        ? 'border border-accent text-accent font-medium hover:bg-accent-light'
                        : 'text-foreground hover:bg-border/60'
                  )}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between mt-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => pick(today)}
              className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Today
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
