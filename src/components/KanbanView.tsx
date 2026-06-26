import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { ArrowRight, Check, Trash2, CalendarDays } from 'lucide-react'
import type { Task, Status, Priority } from '../types'
import { PRIORITY_COLORS } from '../types'
import { CATEGORY_ICON_MAP } from '../lib/icons'
import { dueDateLabel, isOverdue } from '../lib/date'
import { useLanguage } from '../contexts/LanguageContext'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { ConfirmDialog } from './ui/confirm-dialog'
import { cn } from '../lib/utils'

interface Props {
  tasks: Task[]
  onCycle: (task: Task) => void
  onDelete: (id: string) => void
  onMove: (id: string, status: Status) => void
}

const COLUMN_META: { status: Status; color: string; bg: string }[] = [
  { status: 'todo',       color: 'text-muted',  bg: 'bg-border/30' },
  { status: 'inprogress', color: 'text-normal', bg: 'bg-normal-light/60' },
  { status: 'done',       color: 'text-low',    bg: 'bg-low-light/60' },
]

const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0, high: 1, normal: 2, low: 3,
}

// ── Card (pure UI, no drag wiring) ────────────────────────────────────────────
function CardContent({ task, onCycle, onDelete, dimmed = false, t, lang }: {
  task: Task
  onCycle: () => void
  onDelete: () => void
  dimmed?: boolean
  t: (key: any) => string
  lang: 'en' | 'pt'
}) {
  const colors = PRIORITY_COLORS[task.priority]
  const isDone = task.status === 'done'
  const CategoryIcon = CATEGORY_ICON_MAP[task.category]

  return (
    <div
      className={cn(
        'group bg-card rounded-lg border p-3 shadow-card',
        'transition-colors duration-150 hover:shadow-card-hover',
        isDone ? 'opacity-60 border-border' : 'border-border hover:border-accent/30',
        dimmed && 'opacity-40'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <p className={cn('text-sm font-medium leading-snug flex-1 min-w-0', isDone && 'line-through text-muted')}>
          {task.name}
        </p>
        <span onClick={(e) => e.stopPropagation()}>
          <ConfirmDialog
            trigger={
              <Button
                variant="destructive"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 -mt-0.5 -mr-0.5"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            }
            title={t('deleteTaskTitle')}
            description={`"${task.name}" ${t('permanentlyRemoved')}`}
            onConfirm={onDelete}
          />
        </span>
      </div>

      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant={task.priority as any} className="text-[11px]">
            <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
            {t(task.priority)}
          </Badge>
          <Badge variant="muted" className="text-[11px] items-center gap-1">
            <CategoryIcon className="h-3 w-3" />
            {t(task.category)}
          </Badge>
          {task.due_date && (
            <Badge
              variant="muted"
              className={cn(
                'text-[11px] items-center gap-1',
                isOverdue(task.due_date) && !isDone && 'bg-urgent-light text-urgent border-urgent-border'
              )}
            >
              <CalendarDays className="h-3 w-3" />
              {dueDateLabel(task.due_date, lang)}
            </Badge>
          )}
        </div>

        {/* Cycle button — hidden on done cards */}
        {!isDone && (
          <span onClick={(e) => { e.stopPropagation(); onCycle() }}>
            <Button
              variant="ghost"
              size="icon-sm"
              title={t('moveToNextStage')}
              className="flex-shrink-0 text-muted hover:text-accent"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </span>
        )}
        {isDone && (
          <Check className="h-3.5 w-3.5 text-low flex-shrink-0" />
        )}
      </div>
    </div>
  )
}

// ── Draggable card ─────────────────────────────────────────────────────────────
function DraggableCard({ task, onCycle, onDelete, t, lang }: {
  task: Task
  onCycle: () => void
  onDelete: () => void
  t: (key: any) => string
  lang: 'en' | 'pt'
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('cursor-grab active:cursor-grabbing', isDragging && 'opacity-30')}
      {...attributes}
      {...listeners}
    >
      <CardContent task={task} onCycle={onCycle} onDelete={onDelete} t={t} lang={lang} />
    </div>
  )
}

// ── Droppable column ───────────────────────────────────────────────────────────
function DroppableColumn({ status, label, color, bg, tasks, onCycle, onDelete, t, lang }: {
  status: Status
  label: string
  color: string
  bg: string
  tasks: Task[]
  onCycle: (task: Task) => void
  onDelete: (id: string) => void
  t: (key: any) => string
  lang: 'en' | 'pt'
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col gap-2">
      <div className={cn('flex items-center justify-between px-3 py-2 rounded-lg', bg)}>
        <h2 className={cn('text-sm font-semibold', color)}>{label}</h2>
        <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded-full bg-card border border-border', color)}>
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-2 min-h-[100px] rounded-lg p-1 -m-1 transition-colors duration-150',
          isOver && 'bg-accent-light/30 ring-1 ring-accent/20'
        )}
      >
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted/50 text-sm border-2 border-dashed border-border rounded-lg">
            {status === 'done' ? t('nothingDoneYet') : t('empty')}
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableCard
              key={task.id}
              task={task}
              onCycle={() => onCycle(task)}
              onDelete={() => onDelete(task.id)}
              t={t}
              lang={lang}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────
export function KanbanView({ tasks, onCycle, onDelete, onMove }: Props) {
  const { lang, t } = useLanguage()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const COLUMNS = COLUMN_META.map((c) => ({ ...c, label: t(c.status) }))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return
    const task = tasks.find((t) => t.id === active.id)
    if (!task || task.status === over.id) return
    onMove(task.id, over.id as Status)
  }

  const sorted = (status: Status) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
        {COLUMNS.map((col) => (
          <DroppableColumn
            key={col.status}
            {...col}
            tasks={sorted(col.status)}
            onCycle={onCycle}
            onDelete={onDelete}
            t={t}
            lang={lang}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask && (
          <div className="rotate-1 scale-105 cursor-grabbing shadow-card-hover rounded-lg">
            <CardContent
              task={activeTask}
              onCycle={() => {}}
              onDelete={() => {}}
              t={t}
              lang={lang}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
