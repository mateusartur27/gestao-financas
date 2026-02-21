'use client'

import { useMemo } from 'react'
import AppShell from '@/components/AppShell'
import { useMonthlyHistory } from '@/hooks/useReceivables'
import DashboardStats from '@/components/DashboardStats'
import MonthlyChart from '@/components/MonthlyChart'
import { currentYearMonth, isOverdue, toYearMonth, formatDate, formatCurrency } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import type { DashboardSummary } from '@/types'

export default function DashboardPage() {
  const { data: allItems, loading } = useMonthlyHistory(6)
  const ym = currentYearMonth()

  const summary: DashboardSummary = useMemo(() => {
    const monthItems = allItems.filter(r => toYearMonth(r.due_date) === ym)
    const totalMonth    = monthItems.reduce((s, r) => s + r.amount, 0)
    const receivedMonth = monthItems.reduce((s, r) => s + (r.paid ? r.amount : 0), 0)
    const pendingMonth  = totalMonth - receivedMonth
    const overdueItems  = allItems.filter(r => isOverdue(r.due_date, r.paid))
    const overdueTotal  = overdueItems.reduce((s, r) => s + r.amount, 0)
    return { totalMonth, receivedMonth, pendingMonth, overdueTotal, overdueCount: overdueItems.length }
  }, [allItems, ym])

  const overdueItems = useMemo(
    () => allItems.filter(r => isOverdue(r.due_date, r.paid)).slice(0, 5),
    [allItems]
  )

  return (
    <AppShell>
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-0.5 text-sm text-gray-500">Resumo financeiro do mês atual</p>
          </div>

          <DashboardStats summary={summary} />

          <MonthlyChart items={allItems} months={6} />

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
              <p className="mt-1 text-xs text-gray-400">Adicione recebimentos na página de Recebimentos.</p>
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}
