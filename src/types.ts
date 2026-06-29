export type Priority = 'urgent' | 'high' | 'normal' | 'low'
export type Category = 'work' | 'personal' | 'health' | 'study' | 'other'
export type Status = 'todo' | 'inprogress' | 'done'
export type View = 'list' | 'kanban' | 'agenda'

export interface Task {
  id: string
  name: string
  description: string | null
  solution: string | null
  description_images: string[] | null
  solution_images: string[] | null
  priority: Priority
  category: Category
  status: Status
  project_id: string | null
  due_date: string | null   // ISO date string YYYY-MM-DD
  created_at: string
}

export interface Project {
  id: string
  name: string
  color: string
  description: string | null
  parent_id: string | null
  created_at: string
}

export const PROJECT_COLORS = [
  '#534AB7', // purple
  '#A32D2D', // red
  '#854F0B', // amber
  '#185FA5', // blue
  '#3B6D11', // green
  '#7B4EA0', // violet
  '#0E7490', // cyan
  '#9D3B7A', // pink
] as const

export const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
}

export const PRIORITY_COLORS: Record<Priority, { text: string; bg: string; border: string; dot: string }> = {
  urgent: {
    text: 'text-urgent',
    bg: 'bg-urgent-light',
    border: 'border-urgent-border',
    dot: 'bg-urgent',
  },
  high: {
    text: 'text-high',
    bg: 'bg-high-light',
    border: 'border-high-border',
    dot: 'bg-high',
  },
  normal: {
    text: 'text-normal',
    bg: 'bg-normal-light',
    border: 'border-normal-border',
    dot: 'bg-normal',
  },
  low: {
    text: 'text-low',
    bg: 'bg-low-light',
    border: 'border-low-border',
    dot: 'bg-low',
  },
}

export const CATEGORY_LABELS: Record<Category, string> = {
  work: 'Work',
  personal: 'Personal',
  health: 'Health',
  study: 'Study',
  other: 'Other',
}

export const STATUS_LABELS: Record<Status, string> = {
  todo: 'To Do',
  inprogress: 'In Progress',
  done: 'Done',
}
