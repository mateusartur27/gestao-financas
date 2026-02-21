'use client'

import { useEffect, useState } from 'react'
import { X, Save } from 'lucide-react'
import { todayISO } from '@/lib/utils'
import type { NewReceivable, Receivable } from '@/types'

interface Props {
  initial?: Receivable | null
  onSave: (data: NewReceivable) => Promise<void>
  onClose: () => void
}

const EMPTY: NewReceivable = {
  description: '',
  amount: 0,
  due_date: todayISO(),
  paid: false,
  paid_at: null,
}

export default function ReceivableForm({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<NewReceivable>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setForm({
        description: initial.description,
        amount: initial.amount,
        due_date: initial.due_date,
        paid: initial.paid,
        paid_at: initial.paid_at,
      })
    } else {
      setForm({ ...EMPTY, due_date: todayISO() })
    }
  }, [initial])

  const set = <K extends keyof NewReceivable>(key: K, value: NewReceivable[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handlePaidToggle = (checked: boolean) => {
    setForm(prev => ({
      ...prev,
      paid: checked,
      paid_at: checked ? (prev.paid_at ?? todayISO()) : null,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) { setError('Informe uma descrição.'); return }
    if (!form.amount || form.amount <= 0) { setError('O valor deve ser maior que zero.'); return }
    setSaving(true)
    setError(null)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {initial ? 'Editar recebimento' : 'Novo recebimento'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>
          )}

          {/* Descrição */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Descrição</label>
            <input
              className="input"
              type="text"
              placeholder="Ex: Salário, Freelance, Aluguel..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Valor + Data */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Valor (R$)</label>
              <input
                className="input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                value={form.amount || ''}
                onChange={e => set('amount', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Data prevista</label>
              <input
                className="input"
                type="date"
                value={form.due_date}
                onChange={e => set('due_date', e.target.value)}
              />
            </div>
          </div>

          {/* Pago? */}
          <div className="rounded-xl bg-gray-50 p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.paid}
                  onChange={e => handlePaidToggle(e.target.checked)}
                />
                <div className={`h-6 w-11 rounded-full transition ${form.paid ? 'bg-brand-500' : 'bg-gray-300'}`} />
                <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${form.paid ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {form.paid ? 'Recebido' : 'Ainda não recebido'}
              </span>
            </label>

            {form.paid && (
              <div className="mt-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Data do recebimento</label>
                <input
                  className="input"
                  type="date"
                  value={form.paid_at ?? ''}
                  onChange={e => set('paid_at', e.target.value || null)}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              <Save size={15} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
