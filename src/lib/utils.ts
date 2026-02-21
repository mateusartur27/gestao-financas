import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/** Formats a YYYY-MM-DD string to "dd/MM/yyyy" */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = parseISO(dateStr)
  return isValid(d) ? format(d, 'dd/MM/yyyy', { locale: ptBR }) : '—'
}

/** Returns today as YYYY-MM-DD */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Formats a number as BRL currency */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/** Returns "Jan/25" style label from YYYY-MM */
export function monthLabel(yearMonth: string): string {
  const d = parseISO(`${yearMonth}-01`)
  return format(d, 'MMM/yy', { locale: ptBR })
}

/** Returns current YYYY-MM */
export function currentYearMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

/** Checks if a due_date (YYYY-MM-DD) is overdue and not paid */
export function isOverdue(dueDate: string, paid: boolean): boolean {
  if (paid) return false
  return dueDate < todayISO()
}

/** Groups ISO date by YYYY-MM */
export function toYearMonth(dateStr: string): string {
  return dateStr.slice(0, 7)
}
