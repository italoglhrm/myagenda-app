import { Inbox } from 'lucide-react'
import type { Task, Priority, Project } from '../types'
import { PRIORITY_COLORS } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import { TaskCard } from './TaskCard'
import { cn } from '../lib/utils'

interface Props {
  tasks: Task[]
  onToggleDone: (task: Task) => void
  onDelete: (id: string) => void
  projectMap?: Record<string, Project>
}

const PRIORITY_ORDER: Priority[] = ['urgent', 'high', 'normal', 'low']

export function ListView({ tasks, onToggleDone, onDelete, projectMap }: Props) {
  const { t } = useLanguage()

  const PRIORITY_EMPTY: Record<Priority, string> = {
    urgent: t('noUrgentTasks'),
    high:   t('noHighTasks'),
    normal: t('noNormalTasks'),
    low:    t('noLowTasks'),
  }

  const byPriority = PRIORITY_ORDER.reduce<Record<Priority, Task[]>>(
    (acc, p) => {
      acc[p] = tasks.filter((task) => task.priority === p)
      return acc
    },
    { urgent: [], high: [], normal: [], low: [] }
  )

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-light border border-accent/20 mb-4">
          <Inbox className="h-6 w-6 text-accent" />
        </div>
        <p className="text-foreground font-medium">{t('allClear')}</p>
        <p className="text-muted text-sm mt-1">{t('addTaskToGetStarted')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {PRIORITY_ORDER.map((priority) => {
        const group = byPriority[priority]
        const colors = PRIORITY_COLORS[priority]
        const activeCount = group.filter((task) => task.status !== 'done').length

        return (
          <section key={priority}>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', colors.dot)} />
              <h2 className={cn('text-xs font-semibold uppercase tracking-widest', colors.text)}>
                {t(priority)}
              </h2>
              {activeCount > 0 && (
                <span className="text-xs text-muted">
                  {activeCount} {t('remaining')}
                </span>
              )}
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
                    project={task.project_id && projectMap ? projectMap[task.project_id] : undefined}
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
