import { useState } from 'react'
import { Inbox, Plus, Trash2, Check, PanelLeft, Pencil } from 'lucide-react'
import type { Project } from '../types'
import { PROJECT_COLORS } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ConfirmDialog } from './ui/confirm-dialog'
import { cn } from '../lib/utils'

interface Props {
  projects: Project[]
  selectedProjectId: string | null
  taskCounts: Record<string, number>
  onSelect: (id: string | null) => void
  onCreate: (name: string, color: string, description?: string) => Promise<Project | null>
  onDelete: (id: string) => void
  onUpdate: (id: string, changes: Partial<Pick<Project, 'name' | 'color' | 'description'>>) => Promise<void>
  onToggle: () => void
}

interface CreateFormState {
  name: string
  color: string
  description: string
}

export function Sidebar({
  projects,
  selectedProjectId,
  taskCounts,
  onSelect,
  onCreate,
  onDelete,
  onUpdate,
  onToggle,
}: Props) {
  const { t } = useLanguage()
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<CreateFormState>({
    name: '',
    color: PROJECT_COLORS[0],
    description: '',
  })
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    await onCreate(form.name.trim(), form.color, form.description.trim() || undefined)
    setSaving(false)
    setCreating(false)
    setForm({ name: '', color: PROJECT_COLORS[0], description: '' })
  }

  function handleCancelCreate() {
    setCreating(false)
    setForm({ name: '', color: PROJECT_COLORS[0], description: '' })
  }

  async function handleDelete(id: string) {
    await onDelete(id)
    if (selectedProjectId === id) onSelect(null)
  }

  return (
    <aside className="flex flex-col h-full border-r border-border bg-card/40">
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {/* Toggle button — top right, subtle */}
        <div className="flex justify-end mb-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-6 w-6 text-muted hover:text-foreground"
            title={t('closeSidebar')}
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
        {/* Inbox */}
        <SidebarItem
          icon={<Inbox className="h-4 w-4" />}
          label={t('inbox')}
          count={taskCounts['inbox'] ?? 0}
          selected={selectedProjectId === null}
          onClick={() => onSelect(null)}
        />

        {/* Projects section */}
        {projects.length > 0 && (
          <div className="pt-3 pb-1">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-widest text-muted/70 mb-1">
              {t('projects')}
            </p>
            <div className="space-y-0.5">
              {projects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  count={taskCounts[project.id] ?? 0}
                  selected={selectedProjectId === project.id}
                  onClick={() => onSelect(project.id)}
                  onDelete={() => handleDelete(project.id)}
                  onUpdate={(changes) => onUpdate(project.id, changes)}
                  deleteLabel={t('deleteProjectTitle')}
                  deleteDescription={`"${project.name}" ${t('projectDeletedTasksInbox')}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create project */}
      <div className="border-t border-border p-2">
        {creating ? (
          <form onSubmit={handleCreate} className="space-y-2 p-1 animate-fade-in">
            <Input
              placeholder={t('projectName')}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoFocus
              className="h-8 text-sm"
            />
            <textarea
              placeholder={t('descriptionOptional')}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className={cn(
                'w-full rounded border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted/70 resize-none',
                'focus:border-accent/60 focus:ring-[3px] focus:ring-accent/15 outline-none transition-all'
              )}
            />
            {/* Color picker */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={cn(
                    'w-5 h-5 rounded-full transition-all',
                    form.color === c
                      ? 'ring-2 ring-offset-2 ring-offset-card scale-110'
                      : 'hover:scale-110'
                  )}
                  style={{ backgroundColor: c }}
                >
                  {form.color === c && (
                    <Check className="h-3 w-3 text-white m-auto" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Button
                type="submit"
                size="sm"
                className="flex-1 h-7 text-xs"
                disabled={saving || !form.name.trim()}
              >
                {saving ? t('creating') : t('create')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleCancelCreate}
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted',
              'hover:text-foreground hover:bg-border/50 transition-all'
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            {t('newProject')}
          </button>
        )}
      </div>
    </aside>
  )
}

function SidebarItem({
  icon,
  label,
  count,
  selected,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  count: number
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-all',
        selected
          ? 'bg-accent-light text-accent font-medium'
          : 'text-muted hover:text-foreground hover:bg-border/50'
      )}
    >
      {icon}
      <span className="flex-1 text-left truncate">{label}</span>
      {count > 0 && (
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded-full tabular-nums',
          selected ? 'bg-accent/15 text-accent' : 'bg-border text-muted'
        )}>
          {count}
        </span>
      )}
    </button>
  )
}

function ProjectItem({
  project,
  count,
  selected,
  onClick,
  onDelete,
  onUpdate,
  deleteLabel,
  deleteDescription,
}: {
  project: Project
  count: number
  selected: boolean
  onClick: () => void
  onDelete: () => void
  onUpdate: (changes: Partial<Pick<Project, 'name' | 'color' | 'description'>>) => Promise<void>
  deleteLabel: string
  deleteDescription: string
}) {
  const { t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [editDescription, setEditDescription] = useState(project.description ?? '')
  const [editColor, setEditColor] = useState(project.color)
  const [saving, setSaving] = useState(false)

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation()
    setEditName(project.name)
    setEditDescription(project.description ?? '')
    setEditColor(project.color)
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editName.trim()) return
    setSaving(true)
    await onUpdate({
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      color: editColor,
    })
    setSaving(false)
    setEditing(false)
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="space-y-2 p-1 animate-fade-in"
      >
        <Input
          placeholder={t('projectName')}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          autoFocus
          className="h-8 text-sm"
        />
        <textarea
          placeholder={t('descriptionOptional')}
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          rows={2}
          className={cn(
            'w-full rounded border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted/70 resize-none',
            'focus:border-accent/60 focus:ring-[3px] focus:ring-accent/15 outline-none transition-all'
          )}
        />
        <div className="flex items-center gap-1.5 flex-wrap">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setEditColor(c)}
              className={cn(
                'w-5 h-5 rounded-full transition-all',
                editColor === c ? 'ring-2 ring-offset-2 ring-offset-card scale-110' : 'hover:scale-110'
              )}
              style={{ backgroundColor: c }}
            >
              {editColor === c && <Check className="h-3 w-3 text-white m-auto" strokeWidth={3} />}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <Button type="submit" size="sm" className="flex-1 h-7 text-xs" disabled={saving || !editName.trim()}>
            {saving ? t('creating') : t('create')}
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditing(false)}>
            {t('cancel')}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-all cursor-pointer',
        selected
          ? 'bg-accent-light text-accent font-medium'
          : 'text-muted hover:text-foreground hover:bg-border/50'
      )}
      onClick={onClick}
    >
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: project.color }}
      />
      <span className="flex-1 text-left truncate">{project.name}</span>
      {count > 0 && (
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded-full tabular-nums group-hover:hidden',
          selected ? 'bg-accent/15 text-accent' : 'bg-border text-muted'
        )}>
          {count}
        </span>
      )}
      <span
        className="hidden group-hover:flex items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-5 w-5 text-muted hover:text-foreground"
          onClick={startEdit}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <ConfirmDialog
          trigger={
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-5 w-5 text-muted hover:text-urgent"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          }
          title={deleteLabel}
          description={deleteDescription}
          onConfirm={onDelete}
        />
      </span>
    </div>
  )
}
