import { Router, Request, Response, NextFunction } from 'express'

declare module 'express-session' {
  interface SessionData {
    authenticated: boolean
  }
}

const router = Router()

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body
  if (
    username === process.env.APP_USERNAME &&
    password === process.env.APP_PASSWORD
  ) {
    req.session.authenticated = true
    res.json({ ok: true })
  } else {
    res.status(401).json({ ok: false, error: 'Wrong credentials' })
  }
})

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ ok: true })
  })
})

router.get('/me', (req: Request, res: Response) => {
  res.json({ authenticated: req.session.authenticated === true })
})

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.authenticated === true) {
    next()
  } else {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

export default router
