'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useReceivables } from '@/hooks/useReceivables'
import ReceivableList from '@/components/ReceivableList'
import ReceivableForm from '@/components/ReceivableForm'
import { formatCurrency, currentYearMonth } from '@/lib/utils'
import { format, parseISO, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { NewReceivable, Receivable } from '@/types'

export default function RecebimentosView() {
  const [yearMonth, setYearMonth] = useState(currentYearMonth())
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Receivable | null>(null)

  const { items, loading, error, add, update, remove, togglePaid } = useReceivables(yearMonth)

  const monthDate  = parseISO(`${yearMonth}-01`)
  const monthTitle = format(monthDate, 'MMMM yyyy', { locale: ptBR })
  const prevMonth  = () => setYearMonth(format(subMonths(monthDate, 1), 'yyyy-MM'))
  const nextMonth  = () => setYearMonth(format(addMonths(monthDate, 1), 'yyyy-MM'))

  const today         = new Date().toISOString().slice(0, 10)
  const totalMonth    = items.reduce((s, r) => s + r.amount, 0)
  const receivedMonth = items.reduce((s, r) => s + (r.paid ? r.amount : 0), 0)
  const tenPercent    = receivedMonth * 0.1
  const dueItems      = items.filter(r => !r.paid && r.due_date >= today)
  const overdueItems2 = items.filter(r => !r.paid && r.due_date < today)
  const pendingAmount = dueItems.reduce((s, r) => s + r.amount, 0)
  const overdueAmount = overdueItems2.reduce((s, r) => s + r.amount, 0)
  const openAmount    = pendingAmount + overdueAmount

  const handleSave = async (data: NewReceivable) => {
    if (editing) await update(editing.id, data)
    else await add(data)
    setEditing(null)
  }

  const handleEdit   = (item: Receivable) => { setEditing(item); setShowForm(true) }
  const handleDelete = async (item: Receivable) => { await remove(item.id) }
  const openNew      = () => { setEditing(null); setShowForm(true) }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold capitalize text-gray-900">{monthTitle}</h1>
          <p className="mt-0.5 text-sm text-gray-500">{items.length} lançamentos</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} />
          <span className="hidden sm:inline">Novo recebimento</span>
        </button>
      </div>

      {/* Month mini-summary */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="card text-center">
            <p className="text-xs text-gray-500">Recebido</p>
            <p className="mt-0.5 text-base font-bold text-green-600">{formatCurrency(receivedMonth)}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-500">10% do recebido</p>
            <p className="mt-0.5 text-base font-bold text-purple-600">{formatCurrency(tenPercent)}</p>
          </div>
          {/* Em aberto: shows total + sub-labels */}
          <div className="card text-center">
            <p className="text-xs text-gray-500">Em aberto</p>
            <p className="mt-0.5 text-base font-bold text-amber-600">{formatCurrency(openAmount)}</p>
            {openAmount > 0 && (
              <div className="mt-1.5 flex justify-center gap-2 text-[10px] text-gray-400">
                <span>A vencer: {formatCurrency(pendingAmount)}</span>
                <span>·</span>
                <span className={overdueAmount > 0 ? 'text-red-400' : ''}>
                  Vencido: {formatCurrency(overdueAmount)}
                </span>
              </div>
            )}
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="mt-0.5 text-base font-bold text-gray-800">{formatCurrency(totalMonth)}</p>
          </div>
        </div>
      )}

      {/* Month navigator — allows past AND future */}
      <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
        <button onClick={prevMonth} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold capitalize text-gray-700">{monthTitle}</span>
        <button onClick={nextMonth} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* List */}
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

      {/* Form modal */}
      {showForm && (
        <ReceivableForm
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
