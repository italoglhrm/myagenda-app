import { useState, useMemo } from 'react'
import { Inbox, Check } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import type { Project } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import { cn } from '../lib/utils'

interface Props {
  projects: Project[]
  value: string | null
  onChange: (projectId: string | null) => void
  className?: string
}

// Lets the user reassign a task to a different project/subproject (or Inbox)
export function ProjectPicker({ projects, value, onChange, className }: Props) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  const topLevel = useMemo(() => projects.filter((p) => !p.parent_id), [projects])
  const childrenOf = useMemo(() => {
    const map: Record<string, Project[]> = {}
    projects.forEach((p) => { if (p.parent_id) (map[p.parent_id] ??= []).push(p) })
    return map
  }, [projects])

  const selected = projects.find((p) => p.id === value) ?? null

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border',
            'bg-border/60 text-muted border-transparent hover:bg-border transition-colors',
            className
          )}
        >
          {selected ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: selected.color }} />
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <>
              <Inbox className="h-3 w-3 flex-shrink-0" />
              <span>{t('inbox')}</span>
            </>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          onClick={(e) => e.stopPropagation()}
          className="z-50 min-w-[200px] max-h-72 overflow-y-auto rounded-lg border border-border bg-card shadow-card-hover p-1 animate-fade-in"
        >
          <button
            type="button"
            onClick={() => { onChange(null); setOpen(false) }}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-left',
              value === null ? 'bg-accent-light text-accent' : 'text-foreground hover:bg-border/50'
            )}
          >
            <Inbox className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="flex-1">{t('inbox')}</span>
            {value === null && <Check className="h-3 w-3 flex-shrink-0" />}
          </button>

          {topLevel.length > 0 && <div className="my-1 border-t border-border" />}

          {topLevel.map((project) => (
            <div key={project.id}>
              <button
                type="button"
                onClick={() => { onChange(project.id); setOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-left',
                  value === project.id ? 'bg-accent-light text-accent' : 'text-foreground hover:bg-border/50'
                )}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                <span className="flex-1 truncate">{project.name}</span>
                {value === project.id && <Check className="h-3 w-3 flex-shrink-0" />}
              </button>

              {(childrenOf[project.id] ?? []).map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => { onChange(child.id); setOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-2 pl-7 pr-3 py-1.5 rounded-md text-xs font-medium transition-colors text-left',
                    value === child.id ? 'bg-accent-light text-accent' : 'text-muted hover:text-foreground hover:bg-border/50'
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: child.color }} />
                  <span className="flex-1 truncate">{child.name}</span>
                  {value === child.id && <Check className="h-3 w-3 flex-shrink-0" />}
                </button>
              ))}
            </div>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
