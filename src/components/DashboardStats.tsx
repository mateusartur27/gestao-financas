'use client'

import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Clock, AlertCircle, CheckCircle2, Wallet } from 'lucide-react'
import type { DashboardSummary } from '@/types'

interface Props { summary: DashboardSummary }

export default function DashboardStats({ summary }: Props) {
  const { totalPeriod, receivedPeriod, pendingPeriod, receivedAll, overdueTotal, overdueCount } = summary

  const stats = [
    {
      label: 'Total do período',
      value: formatCurrency(totalPeriod),
      icon: TrendingUp,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: 'Recebido no período',
      value: formatCurrency(receivedPeriod),
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'A receber no período',
      value: formatCurrency(pendingPeriod),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Recebido total',
      value: formatCurrency(receivedAll),
      icon: Wallet,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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

