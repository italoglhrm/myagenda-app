import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'myagenda.db')

const db = new Database(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('urgent', 'high', 'normal', 'low')),
    category TEXT NOT NULL CHECK(category IN ('work', 'personal', 'health', 'study', 'other')),
    status TEXT NOT NULL CHECK(status IN ('todo', 'inprogress', 'done')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`)

export default db
