import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fmtBRL } from '@/lib/utils'
import { LCDPRContent } from '@/types/lcdpr'

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function TabQ200({ content }: { content: LCDPRContent }) {
  const summary = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({
      month: i,
      name: MONTHS[i],
      entries: 0,
      exits: 0,
      balance: 0,
    }))

    let currentBalance = 0

    const sortedQ100 = [...(content.q100 || [])].sort((a, b) => a.date.localeCompare(b.date))

    sortedQ100.forEach((entry) => {
      if (!entry.date) return
      const parts = entry.date.split('-')
      if (parts.length < 3) return
      const mIndex = parseInt(parts[1], 10) - 1

      if (mIndex >= 0 && mIndex <= 11) {
        const val = Number(entry.value) || 0
        if (entry.entry_type === 'entry') data[mIndex].entries += val
        else data[mIndex].exits += val
      }
    })

    data.forEach((s) => {
      s.balance = currentBalance + s.entries - s.exits
      currentBalance = s.balance
    })

    return data
  }, [content.q100])

  return (
    <div className="p-8 max-w-4xl">
      <h3 className="text-lg font-medium text-slate-800 mb-4">Resumo Mensal (Q200)</h3>
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Mês</TableHead>
            <TableHead className="text-right">Receitas (+)</TableHead>
            <TableHead className="text-right">Despesas (-)</TableHead>
            <TableHead className="text-right">Saldo Final</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summary.map((s) => (
            <TableRow key={s.month}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell className="text-right text-emerald-600">{fmtBRL(s.entries)}</TableCell>
              <TableCell className="text-right text-red-600">{fmtBRL(s.exits)}</TableCell>
              <TableCell
                className={`text-right font-bold ${s.balance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}
              >
                {fmtBRL(s.balance)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
