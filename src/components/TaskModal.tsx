import { useState, useEffect, useRef, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Popover from '@radix-ui/react-popover'
import { X, ChevronDown, ImageIcon, Loader2, Check } from 'lucide-react'
import type { Task, Priority, Category, Status, Project } from '../types'
import { PRIORITY_COLORS } from '../types'
import { CATEGORY_ICON_MAP } from '../lib/icons'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { DatePicker } from './ui/date-picker'
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

// ── Signed image — fetches a short-lived URL from a stored path ──────────────
function SignedImage({
  path,
  className,
  onClick,
}: {
  path: string
  className?: string
  onClick?: (signedUrl: string) => void
}) {
  const [src, setSrc] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setSrc(null)
    setError(false)
    supabase.storage
      .from('task-images')
      .createSignedUrl(path, 3600)
      .then(({ data, error }) => {
        if (data && !error) setSrc(data.signedUrl)
        else setError(true)
      })
  }, [path])

  if (error) return (
    <div className={cn('flex items-center justify-center bg-border/30', className)}>
      <ImageIcon className="h-6 w-6 text-muted" />
    </div>
  )
  if (!src) return <div className={cn('bg-border/30 animate-pulse', className)} />
  return (
    <img
      src={src}
      alt=""
      className={cn(className, onClick && 'cursor-zoom-in')}
      onClick={() => onClick?.(src)}
    />
  )
}

// ── Image lightbox ────────────────────────────────────────────────────────────
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
        onClick={onClose}
      >
        <X className="h-4 w-4 text-white" />
      </button>
      <img
        src={src}
        alt=""
        className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

// ── Image section ─────────────────────────────────────────────────────────────
function ImageSection({
  paths,
  onAdd,
  onRemove,
  uploading,
  label,
}: {
  paths: string[]
  onAdd: (file: File) => void
  onRemove: (path: string) => void
  uploading: boolean
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  return (
    <div className="mt-2">
      {paths.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {paths.map((path) => (
            <div key={path} className="group relative w-24 h-24 rounded-lg overflow-hidden border border-border flex-shrink-0">
              <SignedImage
                path={path}
                className="w-full h-full object-cover"
                onClick={(src) => setPreview(src)}
              />
              <button
                type="button"
                onClick={() => onRemove(path)}
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
      {preview && <ImageLightbox src={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export function TaskModal({ task, project, onClose, onSave, onDelete }: Props) {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [solution, setSolution] = useState('')
  const [descPaths, setDescPaths] = useState<string[]>([])
  const [solPaths, setSolPaths] = useState<string[]>([])
  const [priority, setPriority] = useState<Priority>('normal')
  const [category, setCategory] = useState<Category>('personal')
  const [status, setStatus] = useState<Status>('todo')
  const [dueDate, setDueDate] = useState('')
  const [autoSaving, setAutoSaving] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [uploadingDesc, setUploadingDesc] = useState(false)
  const [uploadingSol, setUploadingSol] = useState(false)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const initialized = useRef(false)

  const resizeTitle = useCallback(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  useEffect(() => {
    if (task) {
      initialized.current = false
      setName(task.name)
      setDescription(task.description ?? '')
      setSolution(task.solution ?? '')
      setDescPaths(task.description_images ?? [])
      setSolPaths(task.solution_images ?? [])
      setPriority(task.priority)
      setCategory(task.category)
      setStatus(task.status)
      setDueDate(task.due_date ?? '')
      setAutoSaving('idle')
      setTimeout(() => {
        initialized.current = true
        resizeTitle()
      }, 0)
    }
  }, [task?.id, resizeTitle])

  async function save(changes: Partial<Pick<Task, 'name' | 'description' | 'solution' | 'description_images' | 'solution_images' | 'priority' | 'category' | 'status' | 'due_date'>>) {
    if (!task) return
    setAutoSaving('saving')
    await onSave(task.id, changes)
    setAutoSaving('saved')
    setTimeout(() => setAutoSaving('idle'), 1500)
  }

  function handleNameBlur() {
    if (!initialized.current || !task) return
    const trimmed = name.trim()
    if (!trimmed || trimmed === task.name) return
    save({ name: trimmed })
  }

  function handleDescriptionBlur() {
    if (!initialized.current || !task) return
    const val = description.trim() || null
    if (val === (task.description ?? null)) return
    save({ description: val })
  }

  function handleSolutionBlur() {
    if (!initialized.current || !task) return
    const val = solution.trim() || null
    if (val === (task.solution ?? null)) return
    save({ solution: val })
  }

  function handlePriority(p: Priority) { setPriority(p); save({ priority: p }) }
  function handleCategory(c: Category) { setCategory(c); save({ category: c }) }
  function handleStatus(s: Status) { setStatus(s); save({ status: s }) }
  function handleDueDate(v: string) { setDueDate(v); save({ due_date: v || null }) }

  async function uploadImage(field: 'desc' | 'sol', file: File) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !task) return
    const setter = field === 'desc' ? setUploadingDesc : setUploadingSol
    setter(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${task.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('task-images').upload(path, file)
    setter(false)
    if (error) {
      console.error('Upload error:', error)
      toast('error', error.message)
      return
    }
    // Store the path (not the public URL) so we can generate signed URLs later
    if (field === 'desc') {
      setDescPaths((prev) => {
        const next = [...prev, path]
        save({ description_images: next })
        return next
      })
    } else {
      setSolPaths((prev) => {
        const next = [...prev, path]
        save({ solution_images: next })
        return next
      })
    }
  }

  async function removeImage(field: 'desc' | 'sol', path: string) {
    if (field === 'desc') {
      setDescPaths((prev) => {
        const next = prev.filter((p) => p !== path)
        save({ description_images: next })
        return next
      })
    } else {
      setSolPaths((prev) => {
        const next = prev.filter((p) => p !== path)
        save({ solution_images: next })
        return next
      })
    }
    try {
      await supabase.storage.from('task-images').remove([path])
    } catch {}
  }

  const priorityColors = PRIORITY_COLORS[priority]
  const CategoryIcon = CATEGORY_ICON_MAP[category]

  return (
    <Dialog.Root open={!!task} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-fade-in" />

        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
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
                    onChange={(e) => { setName(e.target.value); resizeTitle() }}
                    onBlur={handleNameBlur}
                    rows={1}
                    className="w-full text-lg font-semibold bg-transparent border-none outline-none text-foreground placeholder:text-muted/50 resize-none leading-snug overflow-hidden"
                    placeholder={t('addTaskPlaceholder')}
                  />
                </Dialog.Title>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 -mt-0.5">
                {autoSaving === 'saving' && <Loader2 className="h-3.5 w-3.5 text-muted animate-spin" />}
                {autoSaving === 'saved' && <Check className="h-3.5 w-3.5 text-low" />}
                <Dialog.Close asChild>
                  <Button variant="ghost" size="icon-sm">
                    <X className="h-4 w-4" />
                  </Button>
                </Dialog.Close>
              </div>
            </div>

            {/* ── Metadata grid ── */}
            <div className="mt-3 border-t border-border pt-3 grid grid-cols-2 gap-x-4 gap-y-1">
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
                    <MetaOption key={p} active={priority === p} onClick={() => handlePriority(p)}>
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
                      <MetaOption key={c} active={category === c} onClick={() => handleCategory(c)}>
                        <Icon className="h-3.5 w-3.5 flex-shrink-0 text-muted" />
                        {t(c)}
                      </MetaOption>
                    )
                  })}
                </MetaDropdown>
              </MetaRow>

              <MetaRow label={t('statusLabel')}>
                <MetaDropdown trigger={<span className="text-sm">{t(status)}</span>}>
                  {STATUSES.map((s) => (
                    <MetaOption key={s} active={status === s} onClick={() => handleStatus(s)}>
                      {t(s)}
                    </MetaOption>
                  ))}
                </MetaDropdown>
              </MetaRow>

              <MetaRow label={t('dueDate')}>
                <div className="-ml-2">
                  <DatePicker value={dueDate} onChange={handleDueDate} />
                </div>
              </MetaRow>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4 border-t border-border pt-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted/70 block mb-1.5">
                {t('taskDescription')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder={t('descriptionPlaceholder')}
                rows={4}
                className={cn(
                  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground',
                  'placeholder:text-muted/50 resize-none outline-none transition-all',
                  'focus:border-accent/60 focus:ring-[3px] focus:ring-accent/15'
                )}
              />
              <ImageSection
                paths={descPaths}
                onAdd={(f) => uploadImage('desc', f)}
                onRemove={(p) => removeImage('desc', p)}
                uploading={uploadingDesc}
                label={t('attachImage')}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted/70 block mb-1.5">
                {t('solution')}
              </label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                onBlur={handleSolutionBlur}
                placeholder={t('solutionPlaceholder')}
                rows={4}
                className={cn(
                  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground',
                  'placeholder:text-muted/50 resize-none outline-none transition-all',
                  'focus:border-accent/60 focus:ring-[3px] focus:ring-accent/15'
                )}
              />
              <ImageSection
                paths={solPaths}
                onAdd={(f) => uploadImage('sol', f)}
                onRemove={(p) => removeImage('sol', p)}
                uploading={uploadingSol}
                label={t('attachImage')}
              />
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
