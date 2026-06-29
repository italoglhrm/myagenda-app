import { useState, useEffect, useCallback } from 'react'
import type { Task, Priority, Category, Status } from '../types'
import { supabase } from '../lib/supabase'

const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0, high: 1, normal: 2, low: 3,
}

function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )
}

// projectId: null = Inbox, string = specific project, string[] = multiple projects, 'all' = every task
export function useTasks(projectId: string | string[] | null | 'all') {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const key = Array.isArray(projectId) ? projectId.join(',') : projectId

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('tasks').select('*')

    if (projectId !== 'all') {
      if (projectId === null) query = query.is('project_id', null)
      else if (Array.isArray(projectId)) query = query.in('project_id', projectId)
      else query = query.eq('project_id', projectId)
    }

    const { data } = await query.order('created_at', { ascending: false })
    if (data) setTasks(sortByPriority(data as Task[]))
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function addTask(name: string, priority: Priority, category: Category, due_date?: string | null) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const insertProjectId = projectId === 'all' ? null : Array.isArray(projectId) ? projectId[0] : projectId

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        name,
        priority,
        category,
        status: 'todo',
        user_id: user.id,
        project_id: insertProjectId,
        due_date: due_date ?? null,
      })
      .select()
      .single()

    if (!error && data) {
      setTasks((prev) => sortByPriority([...prev, data as Task]))
    }
  }

  async function updateTask(
    id: string,
    changes: Partial<Pick<Task, 'name' | 'priority' | 'category' | 'status' | 'due_date'>>
  ) {
    const { data, error } = await supabase
      .from('tasks')
      .update(changes)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setTasks((prev) =>
        sortByPriority(prev.map((t) => (t.id === id ? (data as Task) : t)))
      )
    }
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function cycleStatus(task: Task) {
    const next: Record<Status, Status> = {
      todo: 'inprogress',
      inprogress: 'done',
      done: 'todo',
    }
    return updateTask(task.id, { status: next[task.status] })
  }

  return { tasks, loading, addTask, updateTask, deleteTask, cycleStatus }
}
