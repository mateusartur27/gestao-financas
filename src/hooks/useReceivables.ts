'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toYearMonth } from '@/lib/utils'
import type { Receivable, NewReceivable, UpdateReceivable } from '@/types'

export function useReceivables(yearMonth: string) {
  const supabase = createClient()
  const [items, setItems] = useState<Receivable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMonth = useCallback(async (ym: string) => {
    setLoading(true)
    setError(null)
    const [year, month] = ym.split('-').map(Number)
    const from = `${ym}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const to = `${ym}-${String(lastDay).padStart(2, '0')}`
    const { data, error } = await supabase
      .from('receivables')
      .select('*')
      .gte('due_date', from)
      .lte('due_date', to)
      .order('due_date', { ascending: true })

    if (error) setError(error.message)
    else setItems(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchMonth(yearMonth) }, [yearMonth, fetchMonth])

  const add = async (payload: NewReceivable): Promise<Receivable | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data, error } = await supabase
      .from('receivables')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single()
    if (error) { setError(error.message); return null }
    // Only add to current view if the item belongs to this month
    if (toYearMonth(data.due_date) === yearMonth) {
      setItems(prev => [...prev, data].sort((a, b) => a.due_date.localeCompare(b.due_date)))
    }
    return data
  }

  const update = async (id: string, payload: UpdateReceivable): Promise<void> => {
    const { data, error } = await supabase
      .from('receivables')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) { setError(error.message); return }
    // If item moved to another month, remove from current view
    if (toYearMonth(data.due_date) === yearMonth) {
      setItems(prev => prev.map(r => r.id === id ? data : r))
    } else {
      setItems(prev => prev.filter(r => r.id !== id))
    }
  }

  const remove = async (id: string): Promise<void> => {
    const { error } = await supabase.from('receivables').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setItems(prev => prev.filter(r => r.id !== id))
  }

  const togglePaid = async (item: Receivable): Promise<void> => {
    const updates: UpdateReceivable = item.paid
      ? { paid: false, paid_at: null }
      : { paid: true,  paid_at: new Date().toISOString().slice(0, 10) }
    await update(item.id, updates)
  }

  return { items, loading, error, add, update, remove, togglePaid, refresh: () => fetchMonth(yearMonth) }
}

// Dashboard hook — fetches last 24 months to support both date modes
export function useDashboardData() {
  const supabase = createClient()
  const [data, setData] = useState<Receivable[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - 24)
      const cutoffStr = cutoff.toISOString().slice(0, 10)
      const { data: rows } = await supabase
        .from('receivables')
        .select('*')
        .gte('due_date', cutoffStr)
        .order('due_date', { ascending: true })
      setData(rows ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  return { data, loading }
}
