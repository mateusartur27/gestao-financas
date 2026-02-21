'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDashboardData } from '@/hooks/useReceivables'
import { formatDate, formatCurrency } from '@/lib/utils'
import { RotateCcw, ArrowUp, ArrowDown, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import type { Receivable } from '@/types'

//  helpers 

const LS_KEY = 'dashboard-range'

function fmtYM(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function defaultRange() {
  const now = new Date()
  return {
    start: fmtYM(new Date(now.getFullYear(), now.getMonth() - 6, 1)),
    end:   fmtYM(new Date(now.getFullYear(), now.getMonth() + 3, 1)),
  }
}

type Status = 'a_vencer' | 'vencido' | 'pago'
type SortDir = 'asc' | 'desc'

function classify(item: Receivable, today: string): Status {
  if (item.paid) return 'pago'
  if (item.due_date < today) return 'vencido'
  return 'a_vencer'
}

//  component 

export default function DashboardView() {
  const { data: allItems, loading } = useDashboardData()

  const [range, setRange]           = useState(defaultRange)
  const [statusFilter, setStatus]   = useState<Set<Status>>(new Set(['a_vencer', 'vencido', 'pago']))
  const [sortDir, setSortDir]       = useState<SortDir>('asc')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const p = JSON.parse(saved)
        if (p.start && p.end) setRange(p)
      }
    } catch { /* ignore */ }
  }, [])

  const handleRange = (key: 'start' | 'end', val: string) => {
    setRange(prev => {
      const next = { ...prev, [key]: val }
      if (key === 'start' && next.start > next.end) next.end = next.start
      if (key === 'end'   && next.end < next.start)  next.start = next.end
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  const handleReset = () => {
    const d = defaultRange()
    setRange(d)
    try { localStorage.setItem(LS_KEY, JSON.stringify(d)) } catch { /* ignore */ }
  }

  const toggleStatus = (s: Status) => {
    setStatus(prev => {
      const next = new Set(prev)
      if (next.has(s)) { if (next.size > 1) next.delete(s) } else next.add(s)
      return next
    })
  }

  const today = new Date().toISOString().slice(0, 10)

  const periodItems = useMemo(() =>
    allItems.filter(r => r.due_date.slice(0, 7) >= range.start && r.due_date.slice(0, 7) <= range.end),
    [allItems, range]
  )

  const totalPeriod  = useMemo(() => periodItems.reduce((s, r) => s + r.amount, 0), [periodItems])
  const paidPeriod   = useMemo(() => periodItems.reduce((s, r) => s + (r.paid ? r.amount : 0), 0), [periodItems])
  const openItems    = useMemo(() => periodItems.filter(r => !r.paid), [periodItems])
  const openTotal    = useMemo(() => openItems.reduce((s, r) => s + r.amount, 0), [openItems])
  const toReceive    = useMemo(() => openItems.filter(r => r.due_date >= today).reduce((s, r) => s + r.amount, 0), [openItems, today])
  const overdueAmt   = useMemo(() => openItems.filter(r => r.due_date < today).reduce((s, r) => s + r.amount, 0), [openItems, today])
  const overdueCnt   = useMemo(() => openItems.filter(r => r.due_date < today).length, [openItems, today])

  const listItems = useMemo(() => {
    const filtered = periodItems.filter(r => statusFilter.has(classify(r, today)))
    return [...filtered].sort((a, b) => {
      const cmp = a.due_date.localeCompare(b.due_date)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [periodItems, statusFilter, sortDir, today])


  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-xl font-bold text-gray-900">Lancamentos</h1>
        <p className="mt-0.5 text-sm text-gray-500">Visao geral do periodo selecionado</p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">Mes inicial</p>
            <input type="month" className="input w-36 text-sm" value={range.start} max={range.end}
              onChange={e => handleRange('start', e.target.value)} />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">Mes final</p>
            <input type="month" className="input w-36 text-sm" value={range.end} min={range.start}
              onChange={e => handleRange('end', e.target.value)} />
          </div>
          <button onClick={handleReset} className="btn-secondary flex items-center gap-1.5 text-xs">
            <RotateCcw size={13} /> Voltar ao padrao
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Filtrar:</span>
          {([
            ['a_vencer', 'A vencer', 'amber'],
            ['vencido',  'Vencido',  'red'],
            ['pago',     'Pago',     'green'],
          ] as [Status, string, string][]).map(([key, label, color]) => {
            const active = statusFilter.has(key)
            const cls = {
              amber: active ? 'bg-amber-100 text-amber-800 ring-amber-300' : 'bg-gray-100 text-gray-400 ring-gray-200',
              red:   active ? 'bg-red-100 text-red-800 ring-red-300'       : 'bg-gray-100 text-gray-400 ring-gray-200',
              green: active ? 'bg-green-100 text-green-800 ring-green-300' : 'bg-gray-100 text-gray-400 ring-gray-200',
            }[color]
            return (
              <button key={key} onClick={() => toggleStatus(key)}
                className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${cls}`}>
                {label}
              </button>
            )
          })}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-500">Ordenar:</span>
            <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary flex items-center gap-1 text-xs px-2.5 py-1.5">
              {sortDir === 'asc' ? <><ArrowUp size={13} /> Mais antigo</> : <><ArrowDown size={13} /> Mais recente</>}
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {periodItems.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="card text-center">
            <p className="text-xs text-gray-500">Recebido</p>
            <p className="mt-0.5 text-base font-bold text-green-600">{formatCurrency(paidPeriod)}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-500">Em aberto</p>
            <p className={`mt-0.5 text-base font-bold ${overdueCnt > 0 ? 'text-red-600' : 'text-amber-600'}`}>
              {formatCurrency(openTotal)}
            </p>
            {openTotal > 0 && (
              <div className="mt-1.5 flex justify-center gap-2 text-[10px] text-gray-400">
                <span>A vencer: {formatCurrency(toReceive)}</span>
                <span>·</span>
                <span className={overdueCnt > 0 ? 'text-red-400' : ''}>
                  Vencido: {formatCurrency(overdueAmt)}
                </span>
              </div>
            )}
          </div>
          <div className="card text-center col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500">Total</p>
            <p className="mt-0.5 text-base font-bold text-gray-800">{formatCurrency(totalPeriod)}</p>
          </div>
        </div>
      )}

      {/* Listing */}
      {listItems.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">Nenhum lancamento encontrado para os filtros selecionados.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">
                  <th className="px-4 py-3 text-left">Descricao</th>
                  <th className="px-4 py-3 text-left">Vencimento</th>
                  <th className="px-4 py-3 text-left">Pagamento</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {listItems.map(item => {
                  const status = classify(item, today)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(item.due_date)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {item.paid && item.paid_at ? formatDate(item.paid_at) : ''}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800 whitespace-nowrap">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {status === 'pago' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                            <CheckCircle2 size={11} /> Pago
                          </span>
                        )}
                        {status === 'a_vencer' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                            <Clock size={11} /> A vencer
                          </span>
                        )}
                        {status === 'vencido' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-medium text-red-700">
                            <AlertCircle size={11} /> Vencido
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-400">
            {listItems.length} lancamento{listItems.length !== 1 ? 's' : ''} exibido{listItems.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}
