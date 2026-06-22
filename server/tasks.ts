import { Router, Request, Response } from 'express'
import db from './db'

const router = Router()

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
}

router.get('/', (_req: Request, res: Response) => {
  const tasks = db
    .prepare('SELECT * FROM tasks ORDER BY created_at DESC')
    .all()
  const sorted = (tasks as any[]).sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )
  res.json(sorted)
})

router.post('/', (req: Request, res: Response) => {
  const { name, priority, category, status } = req.body
  if (!name || !priority || !category) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const stmt = db.prepare(
    'INSERT INTO tasks (name, priority, category, status) VALUES (?, ?, ?, ?)'
  )
  const result = stmt.run(name, priority, category, status ?? 'todo')
  const task = db
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .get(result.lastInsertRowid)
  res.status(201).json(task)
})

router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const { name, priority, category, status } = req.body
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  if (!task) return res.status(404).json({ error: 'Not found' })

  const updated = {
    ...(task as any),
    ...(name !== undefined && { name }),
    ...(priority !== undefined && { priority }),
    ...(category !== undefined && { category }),
    ...(status !== undefined && { status }),
  }
  db.prepare(
    'UPDATE tasks SET name = ?, priority = ?, category = ?, status = ? WHERE id = ?'
  ).run(updated.name, updated.priority, updated.category, updated.status, id)

  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id))
})

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

export default router
