import { useState, useEffect, useRef, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Popover from '@radix-ui/react-popover'
import { X, Trash2, ChevronDown, ImageIcon, Loader2 } from 'lucide-react'
import type { Task, Priority, Category, Status, Project } from '../types'
import { PRIORITY_COLORS } from '../types'
import { CATEGORY_ICON_MAP } from '../lib/icons'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { DatePicker } from './ui/date-picker'
import { ConfirmDialog } from './ui/confirm-dialog'
import { cn } from '../lib/utils'

interface Props {
  task: Task | null
  project?: Project
  onClose: () => void
  onSave: (id: string, changes: Partial<Pick<Task, 'name' | 'description' | 'solution' | 'description_images' | 'solution_images' | 'priority' | 'category' | 'status' | 'due_date'>>) => Promise<void>
  onDelete: (id: string) => void
}

const PRIORITIES: Priority[] = ['urgent', 'high', 'normal', 'low']
const CATEGORIES: Category[] = ['work', 'personal', 'health', 'study', 'other']
const STATUSES: Status[] = ['todo', 'inprogress', 'done']

// ── Notion-style property dropdown ──────────────────────────────────────────
function MetaDropdown({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-1 px-2 py-1 rounded-md text-sm hover:bg-border/60 transition-colors -ml-2">
          {trigger}
          <ChevronDown className="h-3 w-3 text-muted opacity-60 ml-0.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-[60] min-w-[140px] rounded-lg border border-border bg-card shadow-card-hover p-1"
          sideOffset={4}
          align="start"
        >
          <div className="flex flex-col gap-0.5" onClick={() => setOpen(false)}>
            {children}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function MetaOption({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition-colors',
        active ? 'bg-accent-light text-accent' : 'text-foreground hover:bg-border/60'
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 min-h-[32px]">
      <span className="text-xs text-muted w-20 flex-shrink-0">{label}</span>
      {children}
    </div>
  )
}

// ── Image section ────────────────────────────────────────────────────────────
function ImageSection({
  images,
  onAdd,
  onRemove,
  uploading,
  label,
}: {
  images: string[]
  onAdd: (file: File) => void
  onRemove: (url: string) => void
  uploading: boolean
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mt-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((url) => (
            <div key={url} className="group relative w-24 h-24 rounded-lg overflow-hidden border border-border flex-shrink-0">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
      >
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
        {uploading ? '…' : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onAdd(f); e.target.value = '' }}
      />
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export function TaskModal({ task, project, onClose, onSave, onDelete }: Props) {
  const { t } = useLanguage()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [solution, setSolution] = useState('')
  const [descImages, setDescImages] = useState<string[]>([])
  const [solImages, setSolImages] = useState<string[]>([])
  const [priority, setPriority] = useState<Priority>('normal')
  const [category, setCategory] = useState<Category>('personal')
  const [status, setStatus] = useState<Status>('todo')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [uploadingDesc, setUploadingDesc] = useState(false)
  const [uploadingSol, setUploadingSol] = useState(false)
  const titleRef = useRef<HTMLTextAreaElement>(null)

  const resizeTitle = useCallback(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  useEffect(() => {
    if (task) {
      setName(task.name)
      setDescription(task.description ?? '')
      setSolution(task.solution ?? '')
      setDescImages(task.description_images ?? [])
      setSolImages(task.solution_images ?? [])
      setPriority(task.priority)
      setCategory(task.category)
      setStatus(task.status)
      setDueDate(task.due_date ?? '')
      setDirty(false)
      // resize title after state update
      setTimeout(resizeTitle, 0)
    }
  }, [task?.id, resizeTitle])

  function mark<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setDirty(true) }
  }

  async function uploadImage(field: 'desc' | 'sol', file: File) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !task) return
    const setter = field === 'desc' ? setUploadingDesc : setUploadingSol
    setter(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${task.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('task-images').upload(path, file)
    setter(false)
    if (error) return
    const { data: { publicUrl } } = supabase.storage.from('task-images').getPublicUrl(path)
    if (field === 'desc') setDescImages((prev) => { const n = [...prev, publicUrl]; return n })
    else setSolImages((prev) => { const n = [...prev, publicUrl]; return n })
    setDirty(true)
  }

  async function removeImage(field: 'desc' | 'sol', url: string) {
    if (field === 'desc') setDescImages((prev) => prev.filter((u) => u !== url))
    else setSolImages((prev) => prev.filter((u) => u !== url))
    setDirty(true)
    // best-effort remove from storage
    try {
      const path = new URL(url).pathname.split('/object/public/task-images/')[1]
      if (path) await supabase.storage.from('task-images').remove([path])
    } catch {}
  }

  async function handleSave() {
    if (!task || !name.trim()) return
    setSaving(true)
    await onSave(task.id, {
      name: name.trim(),
      description: description.trim() || null,
      solution: solution.trim() || null,
      description_images: descImages,
      solution_images: solImages,
      priority,
      category,
      status,
      due_date: dueDate || null,
    })
    setSaving(false)
    setDirty(false)
  }

  const priorityColors = PRIORITY_COLORS[priority]
  const CategoryIcon = CATEGORY_ICON_MAP[category]

  return (
    <Dialog.Root open={!!task} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-fade-in" />

        <Dialog.Content
          className={cn(
            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-2xl bg-card border border-border rounded-xl shadow-card-hover',
            'data-[state=open]:animate-dialog-in outline-none',
            'flex flex-col max-h-[90vh]'
          )}
        >
          {/* ── Title ── */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                {project && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                    <span className="text-xs text-muted">{project.name}</span>
                  </div>
                )}
                <Dialog.Title asChild>
                  <textarea
                    ref={titleRef}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setDirty(true); resizeTitle() }}
                    rows={1}
                    className="w-full text-lg font-semibold bg-transparent border-none outline-none text-foreground placeholder:text-muted/50 resize-none leading-snug overflow-hidden"
                    placeholder={t('addTaskPlaceholder')}
                  />
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon-sm" className="-mt-0.5 flex-shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            {/* ── Notion-style metadata — 2 × 2 grid ── */}
            <div className="mt-3 border-t border-border pt-3 grid grid-cols-2 gap-x-4 gap-y-1">
              {/* Row 1: Priority | Category */}
              <MetaRow label={t('priorityLabel')}>
                <MetaDropdown
                  trigger={
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className={cn('w-2 h-2 rounded-full', priorityColors.dot)} />
                      <span>{t(priority)}</span>
                    </span>
                  }
                >
                  {PRIORITIES.map((p) => (
                    <MetaOption key={p} active={priority === p} onClick={() => { setPriority(p); setDirty(true) }}>
                      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', PRIORITY_COLORS[p].dot)} />
                      {t(p)}
                    </MetaOption>
                  ))}
                </MetaDropdown>
              </MetaRow>

              <MetaRow label={t('categoryLabel')}>
                <MetaDropdown
                  trigger={
                    <span className="flex items-center gap-1.5 text-sm">
                      <CategoryIcon className="h-3.5 w-3.5 text-muted" />
                      <span>{t(category)}</span>
                    </span>
                  }
                >
                  {CATEGORIES.map((c) => {
                    const Icon = CATEGORY_ICON_MAP[c]
                    return (
                      <MetaOption key={c} active={category === c} onClick={() => { setCategory(c); setDirty(true) }}>
                        <Icon className="h-3.5 w-3.5 flex-shrink-0 text-muted" />
                        {t(c)}
                      </MetaOption>
                    )
                  })}
                </MetaDropdown>
              </MetaRow>

              {/* Row 2: Status | Due date */}
              <MetaRow label={t('statusLabel')}>
                <MetaDropdown trigger={<span className="text-sm">{t(status)}</span>}>
                  {STATUSES.map((s) => (
                    <MetaOption key={s} active={status === s} onClick={() => { setStatus(s); setDirty(true) }}>
                      {t(s)}
                    </MetaOption>
                  ))}
                </MetaDropdown>
              </MetaRow>

              <MetaRow label={t('dueDate')}>
                <div className="-ml-2">
                  <DatePicker value={dueDate} onChange={(v) => { setDueDate(v); setDirty(true) }} />
                </div>
              </MetaRow>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4 border-t border-border pt-4">
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
              <ImageSection
                images={descImages}
                onAdd={(f) => uploadImage('desc', f)}
                onRemove={(url) => removeImage('desc', url)}
                uploading={uploadingDesc}
                label={t('attachImage')}
              />
            </div>

            {/* Solution */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted/70 block mb-1.5">
                {t('solution')}
              </label>
              <textarea
                value={solution}
                onChange={(e) => { setSolution(e.target.value); setDirty(true) }}
                placeholder={t('solutionPlaceholder')}
                rows={4}
                className={cn(
                  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground',
                  'placeholder:text-muted/50 resize-none outline-none transition-all',
                  'focus:border-accent/60 focus:ring-[3px] focus:ring-accent/15'
                )}
              />
              <ImageSection
                images={solImages}
                onAdd={(f) => uploadImage('sol', f)}
                onRemove={(url) => removeImage('sol', url)}
                uploading={uploadingSol}
                label={t('attachImage')}
              />
            </div>
          </div>

          {/* ── Footer ── */}
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
              onConfirm={() => { if (task) { onDelete(task.id); onClose() } }}
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
