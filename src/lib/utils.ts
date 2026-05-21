import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseMoney(val: string | number): number {
  if (typeof val === 'number') return val
  if (!val) return 0
  const clean = val.replace(/[^\d,-]/g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

export function fmtBRL(val: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

export function cpfOk(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '')
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  let rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(cleanCPF.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(cleanCPF.charAt(10))) return false

  return true
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number,
): { (...args: Parameters<T>): void; flush: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(...args)
      lastArgs = null
    }, ms)
  }

  debounced.flush = () => {
    if (lastArgs) {
      if (timeoutId) clearTimeout(timeoutId)
      fn(...lastArgs)
      lastArgs = null
    }
  }

  return debounced
}
