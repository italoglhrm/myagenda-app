import { Check } from 'lucide-react'
import type { Task } from '../types'
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
} from '../types'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface Props {
  tasks: Task[]
  onMarkDone: (task: Task) => void
}

const START_HOUR = 9
const SLOT_MINUTES = 30

function formatTime(slotIndex: number): string {
  const totalMinutes = START_HOUR * 60 + slotIndex * SLOT_MINUTES
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export function AgendaView({ tasks, onMarkDone }: Props) {
  const active = tasks.filter((t) => t.status !== 'done')

  if (active.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-foreground font-medium">All done! Great job.</p>
        <p className="text-muted text-sm mt-1">
          No active tasks to schedule today.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 animate-fade-in max-w-2xl">
      <p className="text-xs text-muted uppercase tracking-wider mb-4">
        Today's schedule · {active.length} task{active.length !== 1 ? 's' : ''}
      </p>

      {active.map((task, i) => {
        const colors = PRIORITY_COLORS[task.priority]
        const time = formatTime(i)
        const isUrgent = task.priority === 'urgent'

        return (
          <div
            key={task.id}
            className={cn(
              'group flex items-center gap-4 rounded-xl border bg-card px-4 py-3',
              'transition-all duration-150 hover:shadow-card',
              isUrgent
                ? 'border-urgent-border bg-urgent-light/30'
                : 'border-border hover:border-accent/25'
            )}
          >
            {/* Time column */}
            <div className="w-[72px] flex-shrink-0 text-right">
              <span className="text-xs font-medium text-muted tabular-nums">
                {time}
              </span>
            </div>

            {/* Vertical line + dot */}
            <div className="flex flex-col items-center flex-shrink-0 self-stretch py-1">
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full border-2 border-card flex-shrink-0',
                  colors.dot
                )}
              />
              {i < active.length - 1 && (
                <div className="w-px flex-1 bg-border mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {task.name}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant={task.priority as any} className="text-[11px]">
                  <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
                  {PRIORITY_LABELS[task.priority]}
                </Badge>
                <Badge variant="muted" className="text-[11px]">
                  {CATEGORY_ICONS[task.category]} {CATEGORY_LABELS[task.category]}
                </Badge>
              </div>
            </div>

            {/* Done button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkDone(task)}
              className="flex-shrink-0 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-low hover:border-low-border hover:bg-low-light"
            >
              <Check className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Done</span>
            </Button>
          </div>
        )
      })}
    </div>
  )
}
