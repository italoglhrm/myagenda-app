import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function Checkbox({ checked, onChange, className }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'h-[18px] w-[18px] flex-shrink-0 rounded-[5px] border-2 transition-all duration-150',
        'flex items-center justify-center',
        checked
          ? 'bg-accent border-accent'
          : 'bg-card border-border hover:border-accent/50',
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        className
      )}
    >
      {checked && <Check className="h-3 w-3 text-white stroke-[3]" />}
    </button>
  )
}
