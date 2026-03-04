export interface Todo {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type FilterType = 'all' | 'active' | 'completed'
export type SortType = 'newest' | 'oldest' | 'priority' | 'due_date'
