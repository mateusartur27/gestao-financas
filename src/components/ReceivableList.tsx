'use client'

import { useState } from 'react'
import { Check, Pencil, Trash2, Clock, CircleDollarSign } from 'lucide-react'
import { formatDate, formatCurrency, isOverdue } from '@/lib/utils'
import type { Receivable } from '@/types'

interface Props {
  items: Receivable[]
  onTogglePaid: (item: Receivable) => Promise<void>
  onEdit: (item: Receivable) => void
  onDelete: (item: Receivable) => void
}

export default function ReceivableList({ items, onTogglePaid, onEdit, onDelete }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleToggle = async (item: Receivable) => {
    setLoadingId(item.id)
    await onTogglePaid(item)
    setLoadingId(null)
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
        <CircleDollarSign size={40} className="mb-3 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">Nenhum recebimento neste mês</p>
        <p className="mt-1 text-xs text-gray-400">Clique em &ldquo;Novo recebimento&rdquo; para adicionar</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {items.map(item => {
        const overdue = isOverdue(item.due_date, item.paid)
        return (
          <li
            key={item.id}
            className={`card flex items-start gap-4 transition ${
              item.paid ? 'opacity-80' : overdue ? 'ring-1 ring-red-200' : ''
            }`}
          >
            {/* Toggle paid button */}
            <button
              onClick={() => handleToggle(item)}
              disabled={loadingId === item.id}
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                item.paid
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-gray-300 hover:border-brand-400'
              }`}
              title={item.paid ? 'Marcar como pendente' : 'Marcar como recebido'}
            >
              {item.paid && <Check size={13} strokeWidth={3} />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Row 1: description + action buttons */}
              <div className="flex items-start justify-between gap-2">
                <span className={`text-sm font-semibold leading-snug ${item.paid ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {item.description}
                </span>
                {/* Actions */}
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    onClick={() => onEdit(item)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { onDelete(item); setConfirmDeleteId(null) }}
                        className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      title="Excluir"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: badge + dates */}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {item.paid ? (
                  <span className="badge-paid"><Check size={10} /> Recebido</span>
                ) : overdue ? (
                  <span className="badge-overdue"><Clock size={10} /> Atrasado</span>
                ) : (
                  <span className="badge-pending"><Clock size={10} /> Pendente</span>
                )}
                <span className="text-xs text-gray-500">
                  Vencimento: <strong className="text-gray-700">{formatDate(item.due_date)}</strong>
                </span>
                {item.paid && item.paid_at && (
                  <span className="text-xs text-gray-500">
                    Recebido em: <strong className="text-brand-700">{formatDate(item.paid_at)}</strong>
                  </span>
                )}
              </div>

              {/* Row 3: amount */}
              <p className={`mt-1.5 text-base font-bold ${item.paid ? 'text-brand-600' : overdue ? 'text-red-600' : 'text-gray-800'}`}>
                {formatCurrency(item.amount)}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
