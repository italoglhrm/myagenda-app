import { Trash2, CalendarDays } from 'lucide-react'
import { Tooltip } from './ui/tooltip'
import type { Task, Project } from '../types'
import { PRIORITY_COLORS } from '../types'
import { CATEGORY_ICON_MAP } from '../lib/icons'
import { dueDateLabel, isOverdue } from '../lib/date'
import { useLanguage } from '../contexts/LanguageContext'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { ConfirmDialog } from './ui/confirm-dialog'
import { cn } from '../lib/utils'

interface Props {
  task: Task
  onToggleDone: (task: Task) => void
  onDelete: (id: string) => void
  project?: Project
  className?: string
}

export function TaskCard({ task, onToggleDone, onDelete, project, className }: Props) {
  const { lang, t } = useLanguage()
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
        {project && (
          <Badge variant="muted" className="hidden sm:flex items-center gap-1 max-w-[96px]">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
            <span className="truncate">{project.name}</span>
          </Badge>
        )}

        <Badge variant={task.priority as any} className="hidden sm:flex">
          <span className={cn('priority-dot', colors.dot)} />
          {t(task.priority)}
        </Badge>

        <Badge variant="muted" className="hidden sm:flex gap-1 items-center">
          <CategoryIcon className="h-3 w-3" />
          {t(task.category)}
        </Badge>

        <Badge variant="muted" className="hidden md:flex">
          {t(task.status)}
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
            {dueDateLabel(task.due_date, lang)}
          </Badge>
        )}

        <ConfirmDialog
          trigger={
            <Tooltip label={t('delete')}>
              <Button
                variant="destructive"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
          }
          title={t('deleteTaskTitle')}
          description={`"${task.name}" ${t('permanentlyRemoved')}`}
          onConfirm={() => onDelete(task.id)}
        />
      </div>
    </div>
  )
}
