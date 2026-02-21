'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { formatCurrency, monthLabel } from '@/lib/utils'
import type { Receivable, MonthlyStats, DateMode } from '@/types'

function getItemMonth(item: Receivable, mode: DateMode): string {
  if (mode === 'paid_at' && item.paid && item.paid_at) {
    return item.paid_at.slice(0, 7)
  }
  return item.due_date.slice(0, 7)
}

function buildMonthsRange(start: string, end: string): string[] {
  const months: string[] = []
  let [y, m] = start.split('-').map(Number)
  const [ey, em] = end.split('-').map(Number)
  while (y < ey || (y === ey && m <= em)) {
    months.push(`${y}-${String(m).padStart(2, '0')}`)
    m++
    if (m > 12) { m = 1; y++ }
  }
  return months
}

function buildMonthlyStats(
  items: Receivable[],
  startMonth: string,
  endMonth: string,
  dateMode: DateMode,
): MonthlyStats[] {
  const monthsList = buildMonthsRange(startMonth, endMonth)
  const result: MonthlyStats[] = monthsList.map(ym => ({
    month: ym,
    label: monthLabel(ym),
    total: 0,
    received: 0,
    pending: 0,
  }))

  for (const item of items) {
    const ym = getItemMonth(item, dateMode)
    const slot = result.find(r => r.month === ym)
    if (!slot) continue
    slot.total += item.amount
    if (item.paid) slot.received += item.amount
    else slot.pending += item.amount
  }

  return result
}

const fmt = (v: number) => formatCurrency(v)

interface Props {
  items: Receivable[]
  startMonth: string
  endMonth: string
  dateMode?: DateMode
}

export default function MonthlyChart({ items, startMonth, endMonth, dateMode = 'due_date' }: Props) {
  const data = buildMonthlyStats(items, startMonth, endMonth, dateMode)

  return (
    <div className="card">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">
        Recebimentos por mês
        {dateMode === 'paid_at' && (
          <span className="ml-1.5 text-xs font-normal text-gray-400">(por data de pagamento)</span>
        )}
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11 }}
            width={52}
          />
          <Tooltip formatter={(val: number) => fmt(val)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="received" name="Recebido" fill="#22c55e" radius={[6, 6, 0, 0]} />
          <Bar dataKey="pending"  name="Pendente" fill="#fbbf24" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
