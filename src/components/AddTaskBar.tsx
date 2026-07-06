import { useState, useEffect, useMemo } from 'react'
import { Plus, Inbox, ChevronDown, Check } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import type { Priority, Category, Project } from '../types'
import { PRIORITY_COLORS } from '../types'
import { CATEGORY_ICON_MAP } from '../lib/icons'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { DatePicker } from './ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { cn } from '../lib/utils'

interface Props {
  projects: Project[]
  defaultProjectId: string | null
  onAdd: (name: string, priority: Priority, category: Category, due_date: string | null, project_id: string | null) => void
}

export function AddTaskBar({ projects, defaultProjectId, onAdd }: Props) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [category, setCategory] = useState<Category>('work')
  const [dueDate, setDueDate] = useState<string>('')
  const [destinationId, setDestinationId] = useState<string | null>(defaultProjectId)
  const [popoverOpen, setPopoverOpen] = useState(false)

  // Sync destination when the sidebar selection changes
  useEffect(() => { setDestinationId(defaultProjectId) }, [defaultProjectId])

  // Top-level projects and their children for the dropdown
  const topLevel = useMemo(() => projects.filter((p) => !p.parent_id), [projects])
  const childrenOf = useMemo(() => {
    const map: Record<string, Project[]> = {}
    projects.forEach((p) => { if (p.parent_id) (map[p.parent_id] ??= []).push(p) })
    return map
  }, [projects])

  const selectedProject = projects.find((p) => p.id === destinationId) ?? null

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, priority, category, dueDate || null, destinationId)
    setName('')
    setDueDate('')
  }

  return (
    <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2"
      >
        {/* Destination chip */}
        <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex-shrink-0',
                'border-border bg-background hover:border-accent/50 hover:bg-accent-light/30 text-foreground'
              )}
            >
              {selectedProject ? (
                <>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedProject.color }} />
                  <span className="max-w-[120px] truncate">{selectedProject.name}</span>
                </>
              ) : (
                <>
                  <Inbox className="h-3 w-3 text-muted flex-shrink-0" />
                  <span className="text-muted">{t('inbox')}</span>
                </>
              )}
              <ChevronDown className="h-3 w-3 text-muted flex-shrink-0" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="bottom"
              align="start"
              sideOffset={6}
              className="z-50 min-w-[200px] max-h-72 overflow-y-auto rounded-lg border border-border bg-card shadow-card-hover p-1 animate-fade-in"
            >
              {/* Inbox option */}
              <button
                type="button"
                onClick={() => { setDestinationId(null); setPopoverOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-left',
                  destinationId === null ? 'bg-accent-light text-accent' : 'text-foreground hover:bg-border/50'
                )}
              >
                <Inbox className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="flex-1">{t('inbox')}</span>
                {destinationId === null && <Check className="h-3 w-3 flex-shrink-0" />}
              </button>

              {topLevel.length > 0 && <div className="my-1 border-t border-border" />}

              {/* Projects + subprojects */}
              {topLevel.map((project) => (
                <div key={project.id}>
                  <button
                    type="button"
                    onClick={() => { setDestinationId(project.id); setPopoverOpen(false) }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-left',
                      destinationId === project.id ? 'bg-accent-light text-accent' : 'text-foreground hover:bg-border/50'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                    <span className="flex-1 truncate">{project.name}</span>
                    {destinationId === project.id && <Check className="h-3 w-3 flex-shrink-0" />}
                  </button>

                  {(childrenOf[project.id] ?? []).map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => { setDestinationId(child.id); setPopoverOpen(false) }}
                      className={cn(
                        'w-full flex items-center gap-2 pl-7 pr-3 py-1.5 rounded-md text-xs font-medium transition-colors text-left',
                        destinationId === child.id ? 'bg-accent-light text-accent' : 'text-muted hover:text-foreground hover:bg-border/50'
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: child.color }} />
                      <span className="flex-1 truncate">{child.name}</span>
                      {destinationId === child.id && <Check className="h-3 w-3 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Input
          placeholder={t('addTaskPlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-0"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />

        <DatePicker value={dueDate} onChange={setDueDate} placeholder={t('dueDate')} />

        <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
          <SelectTrigger className="w-[130px] flex-shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(['urgent','high','normal','low'] as Priority[]).map((p) => (
              <SelectItem key={p} value={p}>
                <span className="flex items-center gap-1.5">
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', PRIORITY_COLORS[p].dot)} />
                  {t(p)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
          <SelectTrigger className="w-[130px] flex-shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(['work','personal','health','study','other'] as Category[]).map((c) => {
              const Icon = CATEGORY_ICON_MAP[c]
              return (
                <SelectItem key={c} value={c}>
                  <span className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-muted" />
                    {t(c)}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        <Button type="submit" size="default" className="flex-shrink-0 gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t('add')}</span>
        </Button>
      </form>
    </div>
  )
}
