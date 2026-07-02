import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '../lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

const STYLES: Record<ToastType, { bg: string; border: string; icon: string; Icon: React.ElementType }> = {
  success: { bg: 'bg-low-light',    border: 'border-low-border',    icon: 'text-low',    Icon: CheckCircle2   },
  error:   { bg: 'bg-urgent-light', border: 'border-urgent-border', icon: 'text-urgent', Icon: XCircle        },
  warning: { bg: 'bg-high-light',   border: 'border-high-border',   icon: 'text-high',   Icon: AlertTriangle  },
  info:    { bg: 'bg-accent-light', border: 'border-accent/30',     icon: 'text-accent', Icon: Info           },
}

let _id = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((type: ToastType, message: string) => {
    const id = ++_id
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const s = STYLES[t.type]
          return (
            <div
              key={t.id}
              className={cn(
                'flex items-start gap-2.5 px-4 py-3 rounded-lg border shadow-card-hover',
                'pointer-events-auto min-w-[260px] max-w-sm animate-fade-in',
                s.bg, s.border
              )}
            >
              <s.Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', s.icon)} />
              <span className="text-sm text-foreground flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="flex-shrink-0 text-muted hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
