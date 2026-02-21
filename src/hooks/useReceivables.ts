'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Receivable, NewReceivable, UpdateReceivable } from '@/types'

export function useReceivables(yearMonth: string) {
  const supabase = createClient()
  const [items, setItems] = useState<Receivable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMonth = useCallback(async (ym: string) => {
    setLoading(true)
    setError(null)
    const from = `${ym}-01`
    const to   = `${ym}-31`
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
    setItems(prev => [...prev, data].sort((a, b) => a.due_date.localeCompare(b.due_date)))
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
    setItems(prev => prev.map(r => r.id === id ? data : r))
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

// Hook for dashboard: fetches last N months
export function useMonthlyHistory(months = 6) {
  const supabase = createClient()
  const [data, setData] = useState<Receivable[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
      const fromStr = from.toISOString().slice(0, 10)
      const { data: rows } = await supabase
        .from('receivables')
        .select('*')
        .gte('due_date', fromStr)
        .order('due_date', { ascending: true })
      setData(rows ?? [])
      setLoading(false)
    }
    load()
  }, [months, supabase])

  return { data, loading }
}
