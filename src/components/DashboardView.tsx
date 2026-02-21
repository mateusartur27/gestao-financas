'use client'

import { useMemo, useState } from 'react'
import { useDashboardData } from '@/hooks/useReceivables'
import DashboardStats from '@/components/DashboardStats'
import MonthlyChart from '@/components/MonthlyChart'
import { currentYearMonth, isOverdue, formatDate, formatCurrency } from '@/lib/utils'
import { AlertCircle, CalendarDays, CalendarCheck2 } from 'lucide-react'
import type { Receivable, DashboardSummary, DateMode } from '@/types'

function getItemMonth(item: Receivable, mode: DateMode): string {
  if (mode === 'paid_at' && item.paid && item.paid_at) {
    return item.paid_at.slice(0, 7)
  }
  return item.due_date.slice(0, 7)
}

const PERIOD_OPTIONS = [3, 6, 9, 12]

export default function DashboardView() {
  const { data: allItems, loading } = useDashboardData()
  const [dateMode, setDateMode] = useState<DateMode>('due_date')
  const [months, setMonths] = useState(6)

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

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Resumo financeiro do mês atual</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date mode toggle */}
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

          {/* Period filter */}
          <div className="flex rounded-xl bg-gray-100 p-0.5">
            {PERIOD_OPTIONS.map(n => (
              <button
                key={n}
                onClick={() => setMonths(n)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  months === n ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {n}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <DashboardStats summary={summary} />

      {/* Chart */}
      <MonthlyChart items={allItems} months={months} dateMode={dateMode} />

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
