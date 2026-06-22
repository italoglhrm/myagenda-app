import { useState } from 'react'
import { LogOut, List, LayoutDashboard, CalendarDays, Loader2 } from 'lucide-react'
import type { View } from './types'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useTheme } from './hooks/useTheme'
import { LoginScreen } from './components/LoginScreen'
import { AddTaskBar } from './components/AddTaskBar'
import { ListView } from './components/ListView'
import { KanbanView } from './components/KanbanView'
import { AgendaView } from './components/AgendaView'
import { ThemeToggle } from './components/ThemeToggle'
import { Button } from './components/ui/button'
import { cn } from './lib/utils'

const VIEW_TABS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'list', label: 'List', icon: <List className="h-4 w-4" /> },
  { id: 'kanban', label: 'Board', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'agenda', label: 'Agenda', icon: <CalendarDays className="h-4 w-4" /> },
]

export default function App() {
  const { authenticated, login, logout } = useAuth()
  const { tasks, loading, addTask, updateTask, deleteTask, cycleStatus } = useTasks()
  const { theme, toggle: toggleTheme } = useTheme()
  const [view, setView] = useState<View>('list')

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-muted animate-spin" />
      </div>
    )
  }

  if (!authenticated) {
    return <LoginScreen onLogin={login} theme={theme} onToggleTheme={toggleTheme} />
  }

  function handleToggleDone(task: typeof tasks[0]) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    updateTask(task.id, { status: newStatus })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <span className="text-white text-xs">✦</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">MyAgenda</span>
          </div>

          {/* View tabs */}
          <nav className="flex items-center gap-0.5 flex-1 justify-center sm:justify-start">
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
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <span className="text-xs text-muted hidden md:block mr-1">
              {tasks.filter((t) => t.status !== 'done').length} active
            </span>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Add task bar */}
      <AddTaskBar onAdd={addTask} />

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 text-muted animate-spin" />
          </div>
        ) : (
          <>
            {view === 'list' && (
              <ListView
                tasks={tasks}
                onToggleDone={handleToggleDone}
                onDelete={deleteTask}
              />
            )}
            {view === 'kanban' && (
              <KanbanView
                tasks={tasks}
                onCycle={cycleStatus}
                onDelete={deleteTask}
              />
            )}
            {view === 'agenda' && (
              <AgendaView
                tasks={tasks}
                onMarkDone={(task) => updateTask(task.id, { status: 'done' })}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
