import { useState, useMemo, useEffect } from 'react'
import { LogOut, List, LayoutDashboard, CalendarDays, Loader2, PanelLeftOpen, Layers, Globe } from 'lucide-react'
import type { View } from './types'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useProjects } from './hooks/useProjects'
import { useTheme } from './hooks/useTheme'
import { useLanguage, LanguageProvider } from './contexts/LanguageContext'
import type { TranslationKey } from './lib/i18n'
import { LoginScreen } from './components/LoginScreen'
import { AddTaskBar } from './components/AddTaskBar'
import { ListView } from './components/ListView'
import { KanbanView } from './components/KanbanView'
import { AgendaView } from './components/AgendaView'
import { Sidebar } from './components/Sidebar'
import { ThemeToggle } from './components/ThemeToggle'
import { LogoIcon } from './components/LogoIcon'
import { Button } from './components/ui/button'
import { cn } from './lib/utils'

function AppInner() {
  const { authenticated, sendMagicLink, logout } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const { projects, createProject, updateProject, deleteProject } = useProjects()
  const { lang, toggle: toggleLang, t } = useLanguage()

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [view, setView] = useState<View>('list')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [subprojectFilter, setSubprojectFilter] = useState<string | null>(null)

  // Reset subproject filter when the selected project changes
  useEffect(() => { setSubprojectFilter(null) }, [selectedProjectId])

  // Children of the currently selected project (empty if not a parent or none selected)
  const childrenOfSelected = useMemo(
    () => selectedProjectId ? projects.filter((p) => p.parent_id === selectedProjectId) : [],
    [projects, selectedProjectId]
  )
  const selectedIsParent = childrenOfSelected.length > 0

  // Compute the project IDs to query — parent rolls up all children
  const effectiveProjectId = useMemo(() => {
    if (showAll) return 'all'
    if (selectedIsParent) return [selectedProjectId!, ...childrenOfSelected.map((p) => p.id)]
    return selectedProjectId
  }, [showAll, selectedIsParent, selectedProjectId, childrenOfSelected])

  const { tasks: allTasks, loading, addTask, updateTask, deleteTask, cycleStatus } = useTasks(effectiveProjectId)

  // Apply optional client-side subproject filter
  const tasks = useMemo(
    () => subprojectFilter ? allTasks.filter((t) => t.project_id === subprojectFilter) : allTasks,
    [allTasks, subprojectFilter]
  )

  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    tasks.forEach((t) => {
      if (t.status === 'done') return
      const key = t.project_id ?? 'inbox'
      counts[key] = (counts[key] ?? 0) + 1
    })
    return counts
  }, [tasks])

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null

  const VIEW_TABS: { id: View; labelKey: TranslationKey; icon: React.ReactNode }[] = [
    { id: 'list',   labelKey: 'list',   icon: <List className="h-4 w-4" /> },
    { id: 'kanban', labelKey: 'board',  icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'agenda', labelKey: 'agenda', icon: <CalendarDays className="h-4 w-4" /> },
  ]

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-muted animate-spin" />
      </div>
    )
  }

  if (!authenticated) {
    return (
      <LoginScreen
        onSendMagicLink={sendMagicLink}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  function handleToggleDone(task: typeof tasks[0]) {
    updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ── Header ── */}
      <header className="h-12 flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm z-20 flex items-center px-4 gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <LogoIcon className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">MyAgenda</span>
        </div>

        {/* Context label */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted">
          <span>/</span>
          {selectedProject ? (
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedProject.color }} />
              {selectedProject.name}
            </span>
          ) : (
            <span className="text-foreground font-medium">{t('inbox')}</span>
          )}
        </div>

        {/* View tabs */}
        <nav className="flex items-center gap-0.5 flex-1 justify-center sm:justify-start sm:ml-4">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                view === tab.id
                  ? 'bg-accent-light text-accent'
                  : 'text-muted hover:text-foreground hover:bg-border/50'
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{t(tab.labelKey)}</span>
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLang}
            className="gap-1.5 text-muted hover:text-foreground font-medium tabular-nums"
            title={lang === 'en' ? 'Switch to Portuguese' : 'Mudar para Inglês'}
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="text-xs">{lang === 'en' ? 'PT' : 'EN'}</span>
          </Button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </Button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className={cn('flex-shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out', sidebarOpen ? 'w-52' : 'w-0')}>
          <div className="w-52 h-full">
            <Sidebar
              projects={projects}
              selectedProjectId={selectedProjectId}
              taskCounts={taskCounts}
              onSelect={(id) => { setSelectedProjectId(id); setView('list') }}
              onCreate={createProject}
              onDelete={deleteProject}
              onUpdate={updateProject}
              onToggle={() => setSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Collapsed sidebar re-open button */}
        <div className={cn('flex-shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out', sidebarOpen ? 'w-0' : 'w-10')}>
          <div className="w-10 h-full flex items-start pt-2 justify-center border-r border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-muted hover:text-foreground"
              title={t('openSidebar')}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <AddTaskBar onAdd={addTask} />

          <main className="flex-1 overflow-y-auto px-6 py-4">
            {/* Top bar: subproject filter chips OR all-projects toggle */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {selectedIsParent && !showAll ? (
                <>
                  <button
                    onClick={() => setSubprojectFilter(null)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                      subprojectFilter === null ? 'bg-accent-light text-accent' : 'text-muted hover:text-foreground hover:bg-border/50'
                    )}
                  >
                    {t('allSubprojects')}
                  </button>
                  {childrenOfSelected.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSubprojectFilter(child.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                        subprojectFilter === child.id ? 'bg-accent-light text-accent' : 'text-muted hover:text-foreground hover:bg-border/50'
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: child.color }} />
                      {child.name}
                    </button>
                  ))}
                </>
              ) : (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                    showAll ? 'bg-accent-light text-accent' : 'text-muted hover:text-foreground hover:bg-border/50'
                  )}
                >
                  <Layers className="h-3 w-3" />
                  {t('allProjects')}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-5 w-5 text-muted animate-spin" />
              </div>
            ) : (
              <>
                {view === 'list' && (
                  <ListView tasks={tasks} onToggleDone={handleToggleDone} onDelete={deleteTask} />
                )}
                {view === 'kanban' && (
                  <KanbanView
                    tasks={tasks}
                    onCycle={cycleStatus}
                    onDelete={deleteTask}
                    onMove={(id, status) => updateTask(id, { status })}
                  />
                )}
                {view === 'agenda' && (
                  <AgendaView
                    tasks={tasks}
                    onMarkDone={(task) => updateTask(task.id, { status: 'done' })}
                    onDelete={deleteTask}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  )
}
