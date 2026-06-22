import { useState, useEffect, useCallback } from 'react'
import type { Task, Priority, Category, Status } from '../types'

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
}

function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks', { credentials: 'include' })
      if (!res.ok) return
      const data: Task[] = await res.json()
      setTasks(sortByPriority(data))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function addTask(
    name: string,
    priority: Priority,
    category: Category
  ) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, priority, category, status: 'todo' }),
    })
    if (!res.ok) return
    const task: Task = await res.json()
    setTasks((prev) => sortByPriority([...prev, task]))
  }

  async function updateTask(id: number, changes: Partial<Pick<Task, 'name' | 'priority' | 'category' | 'status'>>) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(changes),
    })
    if (!res.ok) return
    const updated: Task = await res.json()
    setTasks((prev) =>
      sortByPriority(prev.map((t) => (t.id === id ? updated : t)))
    )
  }

  async function deleteTask(id: number) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) return
    setTasks((prev) => prev.filter((t) => t.id !== id))
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
