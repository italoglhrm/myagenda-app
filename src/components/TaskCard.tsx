import { Trash2, CalendarDays } from 'lucide-react'
import type { Task } from '../types'
import { PRIORITY_COLORS, PRIORITY_LABELS, CATEGORY_LABELS, STATUS_LABELS } from '../types'
import { CATEGORY_ICON_MAP } from '../lib/icons'
import { dueDateLabel, isOverdue } from '../lib/date'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { ConfirmDialog } from './ui/confirm-dialog'
import { cn } from '../lib/utils'

interface Props {
  task: Task
  onToggleDone: (task: Task) => void
  onDelete: (id: string) => void
  className?: string
}

export function TaskCard({ task, onToggleDone, onDelete, className }: Props) {
  const isDone = task.status === 'done'
  const colors = PRIORITY_COLORS[task.priority]
  const CategoryIcon = CATEGORY_ICON_MAP[task.category]

  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card',
        'transition-all duration-150',
        isDone
          ? 'opacity-50 border-border'
          : 'border-border hover:border-accent/30 hover:shadow-card',
        className
      )}
    >
      <Checkbox checked={isDone} onChange={() => onToggleDone(task)} />

      <span className={cn('flex-1 min-w-0 text-sm truncate', isDone && 'line-through text-muted')}>
        {task.name}
      </span>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Badge variant={task.priority as any} className="hidden sm:flex">
          <span className={cn('priority-dot', colors.dot)} />
          {PRIORITY_LABELS[task.priority]}
        </Badge>

        <Badge variant="muted" className="hidden sm:flex gap-1 items-center">
          <CategoryIcon className="h-3 w-3" />
          {CATEGORY_LABELS[task.category]}
        </Badge>

        <Badge variant="muted" className="hidden md:flex">
          {STATUS_LABELS[task.status]}
        </Badge>

        {task.due_date && (
          <Badge
            variant="muted"
            className={cn(
              'hidden sm:flex items-center gap-1',
              isOverdue(task.due_date) && task.status !== 'done' && 'bg-urgent-light text-urgent border-urgent-border'
            )}
          >
            <CalendarDays className="h-3 w-3" />
            {dueDateLabel(task.due_date)}
          </Badge>
        )}

        <ConfirmDialog
          trigger={
            <Button
              variant="destructive"
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          }
          title="Delete task?"
          description={`"${task.name}" will be permanently removed.`}
          onConfirm={() => onDelete(task.id)}
        />
      </div>
    </div>
  )
}
