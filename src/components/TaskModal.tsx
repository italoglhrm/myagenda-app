import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Trash2 } from 'lucide-react'
import type { Task, Priority, Category, Status, Project } from '../types'
import { PRIORITY_COLORS } from '../types'
import { CATEGORY_ICON_MAP } from '../lib/icons'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from './ui/button'
import { DatePicker } from './ui/date-picker'
import { ConfirmDialog } from './ui/confirm-dialog'
import { cn } from '../lib/utils'

interface Props {
  task: Task | null
  project?: Project
  onClose: () => void
  onSave: (id: string, changes: Partial<Pick<Task, 'name' | 'description' | 'priority' | 'category' | 'status' | 'due_date'>>) => Promise<void>
  onDelete: (id: string) => void
}

const PRIORITIES: Priority[] = ['urgent', 'high', 'normal', 'low']
const CATEGORIES: Category[] = ['work', 'personal', 'health', 'study', 'other']
const STATUSES: Status[] = ['todo', 'inprogress', 'done']

export function TaskModal({ task, project, onClose, onSave, onDelete }: Props) {
  const { t } = useLanguage()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [category, setCategory] = useState<Category>('personal')
  const [status, setStatus] = useState<Status>('todo')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (task) {
      setName(task.name)
      setDescription(task.description ?? '')
      setPriority(task.priority)
      setCategory(task.category)
      setStatus(task.status)
      setDueDate(task.due_date ?? '')
      setDirty(false)
    }
  }, [task?.id])

  function mark<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setDirty(true) }
  }

  async function handleSave() {
    if (!task || !name.trim()) return
    setSaving(true)
    await onSave(task.id, {
      name: name.trim(),
      description: description.trim() || null,
      priority,
      category,
      status,
      due_date: dueDate || null,
    })
    setSaving(false)
    setDirty(false)
  }

  function handleDelete() {
    if (!task) return
    onDelete(task.id)
    onClose()
  }

  return (
    <Dialog.Root open={!!task} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-fade-in" />

        <Dialog.Content
          className={cn(
            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-lg bg-card border border-border rounded-xl shadow-card-hover',
            'data-[state=open]:animate-dialog-in outline-none',
            'flex flex-col max-h-[90vh]'
          )}
        >
          {/* Header */}
          <div className="flex items-start gap-3 px-6 pt-6 pb-4 border-b border-border">
            <div className="flex-1 min-w-0">
              {project && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                  <span className="text-xs text-muted">{project.name}</span>
                </div>
              )}
              <Dialog.Title asChild>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setDirty(true) }}
                  className="w-full text-lg font-semibold bg-transparent border-none outline-none text-foreground placeholder:text-muted/50 leading-snug"
                  placeholder={t('addTaskPlaceholder')}
                />
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon-sm" className="flex-shrink-0 -mt-0.5">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {/* Description */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted/70 block mb-1.5">
                {t('taskDescription')}
              </label>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setDirty(true) }}
                placeholder={t('descriptionPlaceholder')}
                rows={4}
                className={cn(
                  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground',
                  'placeholder:text-muted/50 resize-none outline-none transition-all',
                  'focus:border-accent/60 focus:ring-[3px] focus:ring-accent/15'
                )}
              />
            </div>

            {/* Due date */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted/70 block mb-1.5">
                {t('dueDate')}
              </label>
              <DatePicker value={dueDate} onChange={(v) => { setDueDate(v); setDirty(true) }} />
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted/70 block mb-1.5">
                {t('priorityLabel')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITIES.map((p) => {
                  const colors = PRIORITY_COLORS[p]
                  const active = priority === p
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => mark(setPriority)(p)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        active
                          ? `${colors.bg} ${colors.text} ${colors.border}`
                          : 'border-border text-muted hover:border-border/80 hover:text-foreground'
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
                      {t(p)}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted/70 block mb-1.5">
                {t('categoryLabel')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => {
                  const Icon = CATEGORY_ICON_MAP[c]
                  const active = category === c
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => mark(setCategory)(c)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        active
                          ? 'border-accent/40 bg-accent-light text-accent'
                          : 'border-border text-muted hover:border-border/80 hover:text-foreground'
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {t(c)}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted/70 block mb-1.5">
                {t('statusLabel')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => {
                  const active = status === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => mark(setStatus)(s)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        active
                          ? 'border-low/40 bg-low-light text-low'
                          : 'border-border text-muted hover:border-border/80 hover:text-foreground'
                      )}
                    >
                      {t(s)}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <ConfirmDialog
              trigger={
                <Button variant="destructive" size="sm" className="gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('delete')}
                </Button>
              }
              title={t('deleteTaskTitle')}
              description={`"${task?.name ?? ''}" ${t('permanentlyRemoved')}`}
              onConfirm={handleDelete}
            />

            <div className="flex items-center gap-2">
              <Dialog.Close asChild>
                <Button variant="outline" size="sm">{t('cancel')}</Button>
              </Dialog.Close>
              <Button size="sm" onClick={handleSave} disabled={saving || !dirty || !name.trim()}>
                {saving ? t('saving') : t('save')}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
