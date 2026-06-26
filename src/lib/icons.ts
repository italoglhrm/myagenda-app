import { Briefcase, Home, Heart, BookOpen, Tag } from 'lucide-react'
import type { Category } from '../types'

export const CATEGORY_ICON_MAP: Record<Category, typeof Briefcase> = {
  work: Briefcase,
  personal: Home,
  health: Heart,
  study: BookOpen,
  other: Tag,
}
