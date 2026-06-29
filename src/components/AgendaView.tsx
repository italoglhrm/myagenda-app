import { CalendarDays, CheckCircle2, Inbox, Trash2 } from 'lucide-react'
import type { Task, Project } from '../types'
import { PRIORITY_COLORS } from '../types'
import { CATEGORY_ICON_MAP } from '../lib/icons'
import { parseDateLocal, isOverdue } from '../lib/date'
import { useLanguage } from '../contexts/LanguageContext'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { ConfirmDialog } from './ui/confirm-dialog'
import { Tooltip } from './ui/tooltip'
import { cn } from '../lib/utils'

interface Props {
  tasks: Task[]
  onMarkDone: (task: Task) => void
  onDelete: (id: string) => void
  projectMap?: Record<string, Project>
}

interface Group {
  key: string
  label: string
  sublabel?: string
  variant: 'overdue' | 'today' | 'upcoming' | 'undated'
  tasks: Task[]
}

function buildGroups(
  tasks: Task[],
  lang: 'en' | 'pt',
  labels: { overdue: string; today: string; tomorrow: string; noDate: string }
): Group[] {
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US'
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
    key: 'overdue', label: labels.overdue, variant: 'overdue', tasks: overdue,
  })

  if (todayTasks.length) groups.push({
    key: 'today',
    label: labels.today,
    sublabel: today.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' }),
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
      label: isTomorrow ? labels.tomorrow : d.toLocaleDateString(locale, { weekday: 'long' }),
      sublabel: d.toLocaleDateString(locale, { month: 'long', day: 'numeric' }),
      variant: 'upcoming',
      tasks: byDate[iso],
    })
  }

  if (undated.length) groups.push({
    key: 'undated', label: labels.noDate, variant: 'undated', tasks: undated,
  })

  return groups
}

const GROUP_STYLES: Record<Group['variant'], { header: string; dot: string }> = {
  overdue:  { header: 'text-urgent',    dot: 'bg-urgent' },
  today:    { header: 'text-accent',    dot: 'bg-accent' },
  upcoming: { header: 'text-foreground', dot: 'bg-border' },
  undated:  { header: 'text-muted',     dot: 'bg-border' },
}

export function AgendaView({ tasks, onMarkDone, onDelete, projectMap }: Props) {
  const { lang, t } = useLanguage()
  const groups = buildGroups(tasks, lang, {
    overdue: t('overdue'),
    today: t('today'),
    tomorrow: t('tomorrow'),
    noDate: t('noDate'),
  })
  const total = groups.reduce((n, g) => n + g.tasks.length, 0)

  if (total === 0) {
    const hasTasks = tasks.some((tk) => tk.status !== 'done')
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-low-light border border-low-border mb-4">
          {hasTasks
            ? <Inbox className="h-6 w-6 text-low" />
            : <CheckCircle2 className="h-6 w-6 text-low" />}
        </div>
        <p className="text-foreground font-medium">
          {hasTasks ? t('noDatesSet') : t('allDone')}
        </p>
        <p className="text-muted text-sm mt-1">
          {hasTasks ? t('addDueDateHint') : t('nothingScheduled')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      {groups.map((group) => {
        const style = GROUP_STYLES[group.variant]
        const count = group.tasks.length
        return (
          <section key={group.key}>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', style.dot)} />
              <h2 className={cn('text-sm font-semibold', style.header)}>{group.label}</h2>
              {group.sublabel && (
                <span className="text-xs text-muted">{group.sublabel}</span>
              )}
              <span className="ml-auto text-xs text-muted tabular-nums">
                {count} {count !== 1 ? t('taskPlural') : t('taskSingular')}
              </span>
            </div>

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
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', colors.dot)} />

                    <p className="flex-1 min-w-0 text-sm font-medium truncate">{task.name}</p>

                    <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                      {task.project_id && projectMap?.[task.project_id] && (
                        <Badge variant="muted" className="text-[11px] items-center gap-1 max-w-[96px]">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: projectMap[task.project_id].color }} />
                          <span className="truncate">{projectMap[task.project_id].name}</span>
                        </Badge>
                      )}
                      <Badge variant={task.priority as any} className="text-[11px]">
                        {t(task.priority)}
                      </Badge>
                      <Badge variant="muted" className="text-[11px] items-center gap-1">
                        <CategoryIcon className="h-3 w-3" />
                        {t(task.category)}
                      </Badge>
                      {task.due_date && overdue && (
                        <Badge variant="muted" className="text-[11px] items-center gap-1 bg-urgent-light text-urgent border-urgent-border">
                          <CalendarDays className="h-3 w-3" />
                          {isOverdue(task.due_date) && t('overdue')}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMarkDone(task)}
                        className="h-7 gap-1.5 hover:text-low hover:border-low-border hover:bg-low-light"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline text-xs">{t('done')}</span>
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Tooltip label={t('delete')}>
                            <Button variant="destructive" size="icon-sm">
                              <Trash2 className="h-3 w-3" />
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
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
