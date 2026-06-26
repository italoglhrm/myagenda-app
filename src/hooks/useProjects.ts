import { useState, useEffect } from 'react'
import type { Project } from '../types'
import { supabase } from '../lib/supabase'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setProjects(data as Project[])
        setLoading(false)
      })
  }, [])

  async function createProject(
    name: string,
    color: string,
    description?: string
  ): Promise<Project | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('projects')
      .insert({ name, color, description: description || null, user_id: user.id })
      .select()
      .single()

    if (!error && data) {
      const project = data as Project
      setProjects((prev) => [...prev, project])
      return project
    }
    return null
  }

  async function updateProject(
    id: string,
    changes: Partial<Pick<Project, 'name' | 'color' | 'description'>>
  ) {
    const { data, error } = await supabase
      .from('projects')
      .update(changes)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setProjects((prev) => prev.map((p) => (p.id === id ? (data as Project) : p)))
    }
  }

  async function deleteProject(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return { projects, loading, createProject, updateProject, deleteProject }
}
