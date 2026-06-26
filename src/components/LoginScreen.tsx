import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ThemeToggle } from './ThemeToggle'
import { Loader2, MailCheck, AlertTriangle } from 'lucide-react'
import { LogoIcon } from './LogoIcon'

interface Props {
  onSendMagicLink: (email: string) => Promise<string | null>
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function LoginScreen({ onSendMagicLink, theme, onToggleTheme }: Props) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await onSendMagicLink(email.trim())
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Theme toggle */}
      <div className="fixed top-3 right-3">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      {/* Subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-[360px] animate-fade-in">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent mb-4 shadow-sm">
            <LogoIcon className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            MyAgenda
          </h1>
          <p className="text-muted text-sm mt-1">Your personal agenda</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          {sent ? (
            <div className="text-center py-2 animate-fade-in">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-low-light border border-low-border mb-4">
                <MailCheck className="h-6 w-6 text-low" />
              </div>
              <p className="font-medium text-foreground">Check your inbox</p>
              <p className="text-sm text-muted mt-1.5">
                We sent a magic link to{' '}
                <span className="text-foreground font-medium">{email}</span>
              </p>
              <p className="text-xs text-muted mt-3">
                Click the link in the email to sign in.
                <br />
                You can close this tab.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="mt-4 text-xs text-accent hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted uppercase tracking-wider">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-urgent bg-urgent-light border border-urgent-border rounded-lg px-3 py-2 animate-fade-in">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-1"
                size="lg"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Sending…' : 'Send magic link'}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted/60 mt-4">
          Private personal tool — no password required
        </p>
      </div>
    </div>
  )
}
