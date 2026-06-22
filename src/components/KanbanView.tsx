import { ArrowRight, Trash2 } from 'lucide-react'
import type { Task, Status, Priority } from '../types'
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from '../types'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface Props {
  tasks: Task[]
  onCycle: (task: Task) => void
  onDelete: (id: number) => void
}

const COLUMNS: { status: Status; label: string; color: string; bg: string }[] = [
  { status: 'todo', label: 'To Do', color: 'text-muted', bg: 'bg-border/30' },
  {
    status: 'inprogress',
    label: 'In Progress',
    color: 'text-normal',
    bg: 'bg-normal-light/60',
  },
  {
    status: 'done',
    label: 'Done',
    color: 'text-low',
    bg: 'bg-low-light/60',
  },
]

const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
}

function KanbanCard({ task, onCycle, onDelete }: {
  task: Task
  onCycle: () => void
  onDelete: () => void
}) {
  const colors = PRIORITY_COLORS[task.priority]
  const isDone = task.status === 'done'

  return (
    <div
      className={cn(
        'group bg-card rounded-lg border p-3 shadow-card',
        'transition-all duration-150 hover:shadow-card-hover',
        isDone ? 'opacity-60 border-border' : `border-border hover:border-accent/30`,
        'animate-slide-in'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <p
          className={cn(
            'text-sm font-medium leading-snug flex-1 min-w-0',
            isDone && 'line-through text-muted'
          )}
        >
          {task.name}
        </p>
        <Button
          variant="destructive"
          size="icon-sm"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 -mt-0.5 -mr-0.5"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant={task.priority as any} className="text-[11px]">
            <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          <Badge variant="muted" className="text-[11px]">
            {CATEGORY_ICONS[task.category]} {CATEGORY_LABELS[task.category]}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onCycle}
          title="Move to next stage"
          className="flex-shrink-0 text-muted hover:text-accent"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function KanbanView({ tasks, onCycle, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
      {COLUMNS.map((col) => {
        const colTasks = tasks
          .filter((t) => t.status === col.status)
          .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

        return (
          <div key={col.status} className="flex flex-col gap-2">
            {/* Column header */}
            <div
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg',
                col.bg
              )}
            >
              <h2 className={cn('text-sm font-semibold', col.color)}>
                {col.label}
              </h2>
              <span
                className={cn(
                  'text-xs font-medium px-1.5 py-0.5 rounded-full bg-card border border-border',
                  col.color
                )}
              >
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 min-h-[100px]">
              {colTasks.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted/50 text-sm border-2 border-dashed border-border rounded-lg">
                  {col.status === 'done' ? 'Nothing done yet' : 'Empty'}
                </div>
              ) : (
                colTasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onCycle={() => onCycle(task)}
                    onDelete={() => onDelete(task.id)}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
