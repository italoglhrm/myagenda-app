import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Priority, Category } from '../types'
import { PRIORITY_LABELS, CATEGORY_LABELS } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface Props {
  onAdd: (name: string, priority: Priority, category: Category) => void
}

const PRIORITY_DOT: Record<Priority, string> = {
  urgent: '🔴',
  high: '🟠',
  normal: '🔵',
  low: '🟢',
}

export function AddTaskBar({ onAdd }: Props) {
  const [name, setName] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [category, setCategory] = useState<Category>('work')

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, priority, category)
    setName('')
  }

  return (
    <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2"
      >
        <Input
          placeholder="Add a new task…"
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

        <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
          <SelectTrigger className="w-[120px] flex-shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
              <SelectItem key={p} value={p}>
                <span className="flex items-center gap-1.5">
                  {PRIORITY_DOT[p]} {PRIORITY_LABELS[p]}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
          <SelectTrigger className="w-[120px] flex-shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" size="default" className="flex-shrink-0 gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </form>
    </div>
  )
}
