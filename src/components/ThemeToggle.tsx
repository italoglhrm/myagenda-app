import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'
import { Tooltip } from './ui/tooltip'

interface Props {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <Tooltip label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="text-muted hover:text-foreground"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
    </Tooltip>
  )
}
