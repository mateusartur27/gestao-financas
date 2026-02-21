'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { useReceivables } from '@/hooks/useReceivables'
import ReceivableList from '@/components/ReceivableList'
import ReceivableForm from '@/components/ReceivableForm'
import { formatCurrency, currentYearMonth, isOverdue } from '@/lib/utils'
import { format, parseISO, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { NewReceivable, Receivable } from '@/types'

export default function RecebimentosPage() {
  const [yearMonth, setYearMonth] = useState(currentYearMonth())
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Receivable | null>(null)

  const { items, loading, error, add, update, remove, togglePaid } = useReceivables(yearMonth)

  const monthDate  = parseISO(`${yearMonth}-01`)
  const monthTitle = format(monthDate, 'MMMM yyyy', { locale: ptBR })
  const prevMonth  = () => setYearMonth(subMonths(monthDate, 1).toISOString().slice(0, 7))
  const nextMonth  = () => setYearMonth(addMonths(monthDate, 1).toISOString().slice(0, 7))

  const totalMonth    = items.reduce((s, r) => s + r.amount, 0)
  const receivedMonth = items.reduce((s, r) => s + (r.paid ? r.amount : 0), 0)
  const pendingMonth  = totalMonth - receivedMonth
  const overdueCount  = items.filter(r => isOverdue(r.due_date, r.paid)).length

  const handleSave = async (data: NewReceivable) => {
    if (editing) await update(editing.id, data)
    else await add(data)
    setEditing(null)
  }

  const handleEdit  = (item: Receivable) => { setEditing(item); setShowForm(true) }
  const handleDelete = async (item: Receivable) => { await remove(item.id) }
  const openNew = () => { setEditing(null); setShowForm(true) }

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold capitalize text-gray-900">{monthTitle}</h1>
            <p className="mt-0.5 text-sm text-gray-500">{items.length} lançamentos</p>
          </div>
          <button onClick={openNew} className="btn-primary">
            <Plus size={16} /> Novo recebimento
          </button>
        </div>

        {/* Month mini-summary */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="mt-0.5 text-base font-bold text-gray-900">{formatCurrency(totalMonth)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-500">Recebido</p>
              <p className="mt-0.5 text-base font-bold text-brand-600">{formatCurrency(receivedMonth)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-500">Pendente{overdueCount > 0 ? ` (${overdueCount} atras.)` : ''}</p>
              <p className={`mt-0.5 text-base font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-amber-600'}`}>
                {formatCurrency(pendingMonth)}
              </p>
            </div>
          </div>
        )}

        {/* Month navigator */}
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
          <button onClick={prevMonth} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-semibold capitalize text-gray-700">{monthTitle}</span>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            disabled={yearMonth >= currentYearMonth()}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <ReceivableList
            items={items}
            onTogglePaid={togglePaid}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showForm && (
          <ReceivableForm
            initial={editing}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditing(null) }}
          />
        )}
      </div>
    </AppShell>
  )
}
