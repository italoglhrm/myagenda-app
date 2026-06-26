import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../lib/utils'

interface Props {
  trigger: React.ReactNode
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Delete',
  loading = false,
  onConfirm,
}: Props) {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  async function handleConfirm() {
    setBusy(true)
    await onConfirm()
    setBusy(false)
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-fade-in'
          )}
        />

        <Dialog.Content
          className={cn(
            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-[360px] bg-card border border-border rounded-lg shadow-card-hover p-6',
            'data-[state=open]:animate-dialog-in outline-none'
          )}
        >
          <div className="flex items-start justify-between mb-1">
            <Dialog.Title className="text-base font-semibold text-foreground">
              {title}
            </Dialog.Title>
            <AlertTriangle className="h-4 w-4 text-urgent opacity-70 flex-shrink-0 mt-0.5 ml-4" />
          </div>
          <Dialog.Description className="text-sm text-muted leading-relaxed">
            {description}
          </Dialog.Description>

          <div className="flex justify-end gap-2 mt-6">
            <Dialog.Close asChild>
              <Button variant="outline" size="sm" disabled={busy}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={busy || loading}
              className="bg-urgent hover:bg-urgent/90 text-white border-urgent"
            >
              {busy ? 'Deleting…' : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
