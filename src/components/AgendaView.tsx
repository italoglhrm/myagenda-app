import { CalendarDays, CheckCircle2, Inbox } from 'lucide-react'
import type { Task } from '../types'
import { PRIORITY_COLORS, PRIORITY_LABELS, CATEGORY_LABELS } from '../types'
import { CATEGORY_ICON_MAP } from '../lib/icons'
import { parseDateLocal, isOverdue } from '../lib/date'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { ConfirmDialog } from './ui/confirm-dialog'
import { cn } from '../lib/utils'
import { Trash2 } from 'lucide-react'

interface Props {
  tasks: Task[]
  onMarkDone: (task: Task) => void
  onDelete: (id: string) => void
}

interface Group {
  key: string
  label: string
  sublabel?: string
  variant: 'overdue' | 'today' | 'upcoming' | 'undated'
  tasks: Task[]
}

function buildGroups(tasks: Task[]): Group[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overdue: Task[] = []
  const todayTasks: Task[] = []
  const byDate: Record<string, Task[]> = {}
  const undated: Task[] = []

  for (const t of tasks) {
    if (t.status === 'done') continue
    if (!t.due_date) { undated.push(t); continue }

    const d = parseDateLocal(t.due_date)
    if (d < today) { overdue.push(t); continue }
    if (d.getTime() === today.getTime()) { todayTasks.push(t); continue }

    const key = t.due_date
    if (!byDate[key]) byDate[key] = []
    byDate[key].push(t)
  }

  const groups: Group[] = []

  if (overdue.length) groups.push({
    key: 'overdue', label: 'Overdue', variant: 'overdue', tasks: overdue,
  })

  if (todayTasks.length) groups.push({
    key: 'today',
    label: 'Today',
    sublabel: today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    variant: 'today',
    tasks: todayTasks,
  })

  for (const iso of Object.keys(byDate).sort()) {
    const d = parseDateLocal(iso)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const isTomorrow = d.getTime() === tomorrow.getTime()
    groups.push({
      key: iso,
      label: isTomorrow ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long' }),
      sublabel: isTomorrow
        ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
        : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      variant: 'upcoming',
      tasks: byDate[iso],
    })
  }

  if (undated.length) groups.push({
    key: 'undated', label: 'No date', variant: 'undated', tasks: undated,
  })

  return groups
}

const GROUP_STYLES: Record<Group['variant'], { header: string; dot: string }> = {
  overdue:  { header: 'text-urgent',   dot: 'bg-urgent' },
  today:    { header: 'text-accent',   dot: 'bg-accent' },
  upcoming: { header: 'text-foreground', dot: 'bg-border' },
  undated:  { header: 'text-muted',    dot: 'bg-border' },
}

export function AgendaView({ tasks, onMarkDone, onDelete }: Props) {
  const groups = buildGroups(tasks)
  const total = groups.reduce((n, g) => n + g.tasks.length, 0)

  if (total === 0) {
    const hasTasks = tasks.some((t) => t.status !== 'done')
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-low-light border border-low-border mb-4">
          {hasTasks
            ? <Inbox className="h-6 w-6 text-low" />
            : <CheckCircle2 className="h-6 w-6 text-low" />}
        </div>
        <p className="text-foreground font-medium">
          {hasTasks ? 'No dates set' : 'All done!'}
        </p>
        <p className="text-muted text-sm mt-1">
          {hasTasks
            ? 'Add a due date to tasks to see them here.'
            : 'Nothing scheduled. Enjoy the day.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      {groups.map((group) => {
        const style = GROUP_STYLES[group.variant]
        return (
          <section key={group.key}>
            {/* Group header */}
            <div className="flex items-center gap-2 mb-3">
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', style.dot)} />
              <h2 className={cn('text-sm font-semibold', style.header)}>{group.label}</h2>
              {group.sublabel && (
                <span className="text-xs text-muted">{group.sublabel}</span>
              )}
              <span className="ml-auto text-xs text-muted tabular-nums">
                {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Task rows */}
            <div className="space-y-1.5">
              {group.tasks.map((task) => {
                const colors = PRIORITY_COLORS[task.priority]
                const CategoryIcon = CATEGORY_ICON_MAP[task.category]
                const overdue = group.variant === 'overdue'

                return (
                  <div
                    key={task.id}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl border bg-card px-4 py-3',
                      'transition-all duration-150 hover:shadow-card',
                      overdue
                        ? 'border-urgent-border bg-urgent-light/20'
                        : 'border-border hover:border-accent/25'
                    )}
                  >
                    {/* Priority dot */}
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', colors.dot)} />

                    {/* Name */}
                    <p className="flex-1 min-w-0 text-sm font-medium truncate">{task.name}</p>

                    {/* Badges */}
                    <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                      <Badge variant={task.priority as any} className="text-[11px]">
                        {PRIORITY_LABELS[task.priority]}
                      </Badge>
                      <Badge variant="muted" className="text-[11px] items-center gap-1">
                        <CategoryIcon className="h-3 w-3" />
                        {CATEGORY_LABELS[task.category]}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMarkDone(task)}
                        className="h-7 gap-1.5 hover:text-low hover:border-low-border hover:bg-low-light"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline text-xs">Done</span>
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button variant="destructive" size="icon-sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        }
                        title="Delete task?"
                        description={`"${task.name}" will be permanently removed.`}
                        onConfirm={() => onDelete(task.id)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
