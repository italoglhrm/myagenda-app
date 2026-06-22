import type { Task, Priority } from '../types'
import { PRIORITY_LABELS, PRIORITY_ICONS, PRIORITY_COLORS } from '../types'
import { TaskCard } from './TaskCard'
import { cn } from '../lib/utils'

interface Props {
  tasks: Task[]
  onToggleDone: (task: Task) => void
  onDelete: (id: number) => void
}

const PRIORITY_EMPTY: Record<Priority, string> = {
  urgent: 'No urgent tasks — nice! 🎉',
  high: 'Nothing high priority.',
  normal: 'No normal tasks.',
  low: 'Nothing on the backburner.',
}

const PRIORITY_ORDER: Priority[] = ['urgent', 'high', 'normal', 'low']

export function ListView({ tasks, onToggleDone, onDelete }: Props) {
  const byPriority = PRIORITY_ORDER.reduce<Record<Priority, Task[]>>(
    (acc, p) => {
      acc[p] = tasks.filter((t) => t.priority === p)
      return acc
    },
    { urgent: [], high: [], normal: [], low: [] }
  )

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="text-4xl mb-3">✦</div>
        <p className="text-foreground font-medium">All clear!</p>
        <p className="text-muted text-sm mt-1">Add a task above to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {PRIORITY_ORDER.map((priority) => {
        const group = byPriority[priority]
        const colors = PRIORITY_COLORS[priority]

        return (
          <section key={priority}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base leading-none">{PRIORITY_ICONS[priority]}</span>
              <h2
                className={cn(
                  'text-xs font-semibold uppercase tracking-widest',
                  colors.text
                )}
              >
                {PRIORITY_LABELS[priority]}
              </h2>
              <span className="text-xs text-muted ml-1">
                {group.filter((t) => t.status !== 'done').length > 0
                  ? `${group.filter((t) => t.status !== 'done').length} remaining`
                  : ''}
              </span>
            </div>

            {group.length === 0 ? (
              <p className="text-sm text-muted/60 italic pl-1 py-1">
                {PRIORITY_EMPTY[priority]}
              </p>
            ) : (
              <div className="space-y-1.5">
                {group.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleDone={onToggleDone}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
