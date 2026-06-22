import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ThemeToggle } from './ThemeToggle'
import { Loader2 } from 'lucide-react'

interface Props {
  onLogin: (username: string, password: string) => Promise<string | null>
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function LoginScreen({ onLogin, theme, onToggleTheme }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await onLogin(username, password)
    setLoading(false)
    if (err) setError(err)
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
            'linear-gradient(#534AB7 1px, transparent 1px), linear-gradient(90deg, #534AB7 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-[360px] animate-fade-in">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent mb-4 shadow-sm">
            <span className="text-white text-xl">✦</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            MyAgenda
          </h1>
          <p className="text-muted text-sm mt-1">Your personal agenda</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Username
              </label>
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-urgent bg-urgent-light border border-urgent-border rounded-lg px-3 py-2 animate-fade-in">
                <span>⚠</span>
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
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted/60 mt-4">
          Private personal tool — no sign-up required
        </p>
      </div>
    </div>
  )
}
