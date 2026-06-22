import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 800 })

// Login screen – light
await page.goto('http://localhost:5174')
await page.waitForLoadState('networkidle')
await page.screenshot({ path: '/tmp/01_login_light.png' })
console.log('01 login light')

// Toggle dark on login
await page.click('button[title="Switch to dark mode"]')
await page.waitForTimeout(400)
await page.screenshot({ path: '/tmp/02_login_dark.png' })
console.log('02 login dark')

// Log in
await page.fill('input[type="text"]', 'italo')
await page.fill('input[type="password"]', 'ASjkhaslfh345l%%')
await page.click('button[type="submit"]')
await page.waitForURL('**/')
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/03_app_dark_empty.png' })
console.log('03 app dark empty')

// Seed a few tasks via the API directly (bypassing UI select complexity)
const cookies = await page.context().cookies()
const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ')
const tasks = [
  { name: 'Fix critical auth bug', priority: 'urgent', category: 'work' },
  { name: 'Review pull requests', priority: 'high', category: 'work' },
  { name: 'Read documentation', priority: 'normal', category: 'study' },
  { name: 'Organise desktop', priority: 'low', category: 'personal' },
]
for (const t of tasks) {
  await page.evaluate(async (task) => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(task),
    })
  }, t)
}
await page.reload()
await page.waitForLoadState('networkidle')
await page.waitForTimeout(400)

// List view dark
await page.screenshot({ path: '/tmp/04_list_dark.png' })
console.log('04 list dark')

// Toggle to light
await page.click('button[title="Switch to light mode"]')
await page.waitForTimeout(400)
await page.screenshot({ path: '/tmp/05_list_light.png' })
console.log('05 list light')

// Kanban
await page.click('button:has-text("Board")')
await page.waitForTimeout(300)
await page.screenshot({ path: '/tmp/06_kanban_light.png' })
console.log('06 kanban light')

// Agenda
await page.click('button:has-text("Agenda")')
await page.waitForTimeout(300)
await page.screenshot({ path: '/tmp/07_agenda_light.png' })
console.log('07 agenda light')

// Dark agenda
await page.click('button[title="Switch to dark mode"]')
await page.waitForTimeout(400)
await page.screenshot({ path: '/tmp/08_agenda_dark.png' })
console.log('08 agenda dark')

// Dark kanban
await page.click('button:has-text("Board")')
await page.waitForTimeout(300)
await page.screenshot({ path: '/tmp/09_kanban_dark.png' })
console.log('09 kanban dark')

await browser.close()
console.log('Done.')
