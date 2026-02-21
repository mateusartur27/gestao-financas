export interface Receivable {
  id: string
  user_id: string
  description: string
  amount: number
  due_date: string       // ISO date string YYYY-MM-DD
  paid: boolean
  paid_at: string | null // ISO date string YYYY-MM-DD
  created_at: string
  updated_at: string
}

export type NewReceivable = Omit<Receivable, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export type UpdateReceivable = Partial<NewReceivable>

export type AppTab = 'recebimentos' | 'dashboard'

export type DateMode = 'due_date' | 'paid_at'

export interface MonthlyStats {
  month: string  // YYYY-MM
  label: string  // e.g. "Jan/25"
  total: number
  received: number
  pending: number
}

export interface DashboardSummary {
  totalMonth: number
  receivedMonth: number
  pendingMonth: number
  overdueTotal: number
  overdueCount: number
  tenPercent: number
}
