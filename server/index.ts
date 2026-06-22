import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import cors from 'cors'
import authRouter, { requireAuth } from './auth'
import tasksRouter from './tasks'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(express.json())
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
)

app.use('/api/auth', authRouter)
app.use('/api/tasks', requireAuth, tasksRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
