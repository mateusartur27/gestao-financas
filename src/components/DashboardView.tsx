'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDashboardData } from '@/hooks/useReceivables'
import DashboardStats from '@/components/DashboardStats'
import MonthlyChart from '@/components/MonthlyChart'
import { currentYearMonth, isOverdue, formatDate, formatCurrency } from '@/lib/utils'
import { AlertCircle, CalendarDays, CalendarCheck2, RotateCcw, Info } from 'lucide-react'
import type { Receivable, DashboardSummary, DateMode } from '@/types'

const LS_KEY = 'dashboard-range'

function formatYM(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function defaultRange(): { start: string; end: string } {
  const now = new Date()
  return {
    start: formatYM(new Date(now.getFullYear(), now.getMonth() - 6, 1)),
    end:   formatYM(new Date(now.getFullYear(), now.getMonth() + 3, 1)),
  }
}

function getItemMonth(item: Receivable, mode: DateMode): string {
  if (mode === 'paid_at' && item.paid && item.paid_at) {
    return item.paid_at.slice(0, 7)
  }
  return item.due_date.slice(0, 7)
}

// YYYY-MM → <input type="month"> value is already YYYY-MM, perfect

export default function DashboardView() {
  const { data: allItems, loading } = useDashboardData()
  const [dateMode, setDateMode] = useState<DateMode>('due_date')

  // Range — loaded from localStorage, falls back to default
  const [range, setRange] = useState(defaultRange)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.start && parsed.end) setRange(parsed)
      }
    } catch { /* ignore */ }
  }, [])

  const handleRangeChange = (key: 'start' | 'end', value: string) => {
    setRange(prev => {
      const next = { ...prev, [key]: value }
      // Keep start <= end
      if (key === 'start' && next.start > next.end) next.end = next.start
      if (key === 'end'   && next.end   < next.start) next.start = next.end
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  const handleReset = () => {
    const d = defaultRange()
    setRange(d)
    try { localStorage.setItem(LS_KEY, JSON.stringify(d)) } catch { /* ignore */ }
  }

  const ym = currentYearMonth()

  const summary: DashboardSummary = useMemo(() => {
    const monthItems = allItems.filter(r => getItemMonth(r, dateMode) === ym)
    const totalMonth    = monthItems.reduce((s, r) => s + r.amount, 0)
    const receivedMonth = monthItems.reduce((s, r) => s + (r.paid ? r.amount : 0), 0)
    const pendingMonth  = totalMonth - receivedMonth
    const tenPercent    = totalMonth * 0.1
    const overdueItems  = allItems.filter(r => isOverdue(r.due_date, r.paid))
    const overdueTotal  = overdueItems.reduce((s, r) => s + r.amount, 0)
    return { totalMonth, receivedMonth, pendingMonth, overdueTotal, overdueCount: overdueItems.length, tenPercent }
  }, [allItems, ym, dateMode])

  const overdueItems = useMemo(
    () => allItems.filter(r => isOverdue(r.due_date, r.paid)).slice(0, 5),
    [allItems]
  )

  // Most advanced due_date and paid_at
  const latestDueDate = useMemo(() => {
    const dates = allItems.map(r => r.due_date).filter(Boolean).sort()
    return dates.length ? dates[dates.length - 1] : null
  }, [allItems])

  const latestPaidAt = useMemo(() => {
    const dates = allItems.filter(r => r.paid && r.paid_at).map(r => r.paid_at!).sort()
    return dates.length ? dates[dates.length - 1] : null
  }, [allItems])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">Resumo financeiro do mês atual</p>
      </div>

      {/* Top filters row */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Date mode toggle */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-500">Considerar por</p>
          <div className="flex rounded-xl bg-gray-100 p-0.5">
            <button
              onClick={() => setDateMode('due_date')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                dateMode === 'due_date' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarDays size={13} />
              Previsão
            </button>
            <button
              onClick={() => setDateMode('paid_at')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                dateMode === 'paid_at' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarCheck2 size={13} />
              Pagamento
            </button>
          </div>
        </div>

        {/* Month range pickers */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-500">Mês inicial</p>
          <input
            type="month"
            className="input w-36 text-sm"
            value={range.start}
            max={range.end}
            onChange={e => handleRangeChange('start', e.target.value)}
          />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-500">Mês final</p>
          <input
            type="month"
            className="input w-36 text-sm"
            value={range.end}
            min={range.start}
            onChange={e => handleRangeChange('end', e.target.value)}
          />
        </div>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className="btn-secondary flex items-center gap-1.5 text-xs"
          title="Voltar ao padrão (−6 meses a +3 meses)"
        >
          <RotateCcw size={13} />
          Voltar ao padrão
        </button>
      </div>

      {/* Informative strip — latest dates */}
      {(latestDueDate || latestPaidAt) && (
        <div className="flex flex-wrap gap-3">
          {latestDueDate && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <Info size={13} className="shrink-0" />
              <span>Vencimento mais avançado: <strong>{formatDate(latestDueDate)}</strong></span>
            </div>
          )}
          {latestPaidAt && (
            <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-800">
              <Info size={13} className="shrink-0" />
              <span>Pagamento mais avançado: <strong>{formatDate(latestPaidAt)}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Stats cards */}
      <DashboardStats summary={summary} />

      {/* Chart */}
      <MonthlyChart
        items={allItems}
        startMonth={range.start}
        endMonth={range.end}
        dateMode={dateMode}
      />

      {/* Overdue list */}
      {overdueItems.length > 0 && (
        <div className="card">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle size={17} className="text-red-500" />
            <h3 className="text-sm font-semibold text-gray-800">Recebimentos em atraso</h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {overdueItems.map(item => (
              <li key={item.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.description}</p>
                  <p className="text-xs text-red-500">Venceu em {formatDate(item.due_date)}</p>
                </div>
                <span className="text-sm font-bold text-red-600">{formatCurrency(item.amount)}</span>
              </li>
            ))}
          </ul>
          {summary.overdueCount > 5 && (
            <p className="mt-2 text-center text-xs text-gray-400">
              +{summary.overdueCount - 5} outros em atraso
            </p>
          )}
        </div>
      )}

      {allItems.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">Nenhum dado encontrado.</p>
          <p className="mt-1 text-xs text-gray-400">Adicione recebimentos na aba de Recebimentos.</p>
        </div>
      )}
    </div>
  )
}
