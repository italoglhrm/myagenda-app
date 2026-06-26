import type { Lang } from './i18n'

export function parseDateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function dueDateLabel(iso: string, lang: Lang = 'en'): string {
  const date = parseDateLocal(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (date.getTime() === today.getTime()) return lang === 'pt' ? 'Hoje' : 'Today'
  if (date.getTime() === tomorrow.getTime()) return lang === 'pt' ? 'Amanhã' : 'Tomorrow'

  const locale = lang === 'pt' ? 'pt-BR' : 'en-US'
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

export function isOverdue(iso: string): boolean {
  const date = parseDateLocal(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}
