import { createClient } from '@supabase/supabase-js'
import type { Task } from '../types'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(url, key)

export type DbTask = Omit<Task, 'id' | 'created_at'> & {
  id: string
  user_id: string
  created_at: string
}
