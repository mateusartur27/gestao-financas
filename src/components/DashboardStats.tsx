'use client'

import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { DashboardSummary } from '@/types'

interface Props { summary: DashboardSummary }

export default function DashboardStats({ summary }: Props) {
  const { totalMonth, receivedMonth, pendingMonth, overdueTotal, overdueCount } = summary

  const stats = [
    {
      label: 'Total do mês',
      value: formatCurrency(totalMonth),
      icon: TrendingUp,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: 'Já recebido',
      value: formatCurrency(receivedMonth),
      icon: CheckCircle2,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: 'A receber',
      value: formatCurrency(pendingMonth),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: `Atrasados (${overdueCount})`,
      value: formatCurrency(overdueTotal),
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="card">
          <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
            <Icon size={18} className={color} />
          </div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className={`mt-0.5 text-xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
