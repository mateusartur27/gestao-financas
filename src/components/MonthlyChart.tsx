'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { formatCurrency, monthLabel, toYearMonth } from '@/lib/utils'
import type { Receivable, MonthlyStats } from '@/types'

function buildMonthlyStats(items: Receivable[], months: number): MonthlyStats[] {
  // Build last N months array
  const result: MonthlyStats[] = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const ym = d.toISOString().slice(0, 7)
    result.push({ month: ym, label: monthLabel(ym), total: 0, received: 0, pending: 0 })
  }

  for (const item of items) {
    const ym = toYearMonth(item.due_date)
    const slot = result.find(r => r.month === ym)
    if (!slot) continue
    slot.total += item.amount
    if (item.paid) slot.received += item.amount
    else slot.pending += item.amount
  }

  return result
}

const fmt = (v: number) => formatCurrency(v)

interface Props { items: Receivable[]; months?: number }

export default function MonthlyChart({ items, months = 6 }: Props) {
  const data = buildMonthlyStats(items, months)

  return (
    <div className="card">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Recebimentos — últimos {months} meses</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11 }}
            width={52}
          />
          <Tooltip formatter={(val: number) => fmt(val)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="received" name="Recebido"  fill="#22c55e" radius={[6,6,0,0]} />
          <Bar dataKey="pending"  name="Pendente"  fill="#fbbf24" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
