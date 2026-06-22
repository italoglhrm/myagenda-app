export type Priority = 'urgent' | 'high' | 'normal' | 'low'
export type Category = 'work' | 'personal' | 'health' | 'study' | 'other'
export type Status = 'todo' | 'inprogress' | 'done'
export type View = 'list' | 'kanban' | 'agenda'

export interface Task {
  id: number
  name: string
  priority: Priority
  category: Category
  status: Status
  created_at: number
}

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

export const PRIORITY_ICONS: Record<Priority, string> = {
  urgent: '🔴',
  high: '🟠',
  normal: '🔵',
  low: '🟢',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  work: 'Work',
  personal: 'Personal',
  health: 'Health',
  study: 'Study',
  other: 'Other',
}

export const CATEGORY_ICONS: Record<Category, string> = {
  work: '💼',
  personal: '🏠',
  health: '🩺',
  study: '📚',
  other: '✦',
}

export const STATUS_LABELS: Record<Status, string> = {
  todo: 'To Do',
  inprogress: 'In Progress',
  done: 'Done',
}
