import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Plus } from 'lucide-react'
import { LCDPRContent } from '@/types/lcdpr'

export function TabQ100({
  content,
  updateContent,
  readOnly,
}: {
  content: LCDPRContent
  updateContent: any
  readOnly: boolean
}) {
  const q100 = content.q100 || []
  const properties = content.properties || []
  const accounts = content.accounts || []

  if (accounts.length === 0) {
    return (
      <div className="p-8 text-center text-amber-600 font-medium">
        Por favor, cadastre ao menos uma conta bancária (0050) antes de adicionar lançamentos.
      </div>
    )
  }

  const addRow = () => {
    updateContent({
      q100: [
        ...q100,
        {
          id: Date.now().toString(),
          date: '',
          property_id: '',
          account_id: '',
          doc_num: '',
          doc_type: '1',
          history: '',
          value: 0,
          entry_type: 'entry',
        },
      ],
    })
  }

  const updateRow = (id: string, field: string, value: any) => {
    updateContent({ q100: q100.map((r) => (r.id === id ? { ...r, [field]: value } : r)) })
  }

  const deleteRow = (id: string) => {
    updateContent({ q100: q100.filter((r) => r.id !== id) })
  }

  return (
    <div className="p-0 overflow-auto">
      <div className="min-w-[1200px]">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-[130px]">Data</TableHead>
              <TableHead className="w-[180px]">Imóvel</TableHead>
              <TableHead className="w-[180px]">Conta</TableHead>
              <TableHead className="w-[120px]">Nº Doc.</TableHead>
              <TableHead className="w-[140px]">Tipo Doc.</TableHead>
              <TableHead>Histórico</TableHead>
              <TableHead className="w-[120px]">Tipo</TableHead>
              <TableHead className="w-[140px]">Valor</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {q100.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                  Nenhum lançamento registrado.
                </TableCell>
              </TableRow>
            )}
            {q100.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="p-2">
                  <Input
                    type="date"
                    disabled={readOnly}
                    value={row.date}
                    onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Select
                    disabled={readOnly}
                    value={row.property_id}
                    onValueChange={(v) => updateRow(row.id, 'property_id', v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-2">
                  <Select
                    disabled={readOnly}
                    value={row.account_id}
                    onValueChange={(v) => updateRow(row.id, 'account_id', v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.bank} - {a.account}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    disabled={readOnly}
                    value={row.doc_num}
                    onChange={(e) => updateRow(row.id, 'doc_num', e.target.value)}
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Select
                    disabled={readOnly}
                    value={row.doc_type}
                    onValueChange={(v) => updateRow(row.id, 'doc_type', v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Nota Fiscal</SelectItem>
                      <SelectItem value="2">2 - Fatura</SelectItem>
                      <SelectItem value="3">3 - Recibo</SelectItem>
                      <SelectItem value="4">4 - Contrato</SelectItem>
                      <SelectItem value="5">5 - Folha Pag.</SelectItem>
                      <SelectItem value="6">6 - Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    disabled={readOnly}
                    value={row.history}
                    onChange={(e) => updateRow(row.id, 'history', e.target.value)}
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Select
                    disabled={readOnly}
                    value={row.entry_type}
                    onValueChange={(v) => updateRow(row.id, 'entry_type', v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Receita (+)</SelectItem>
                      <SelectItem value="exit">Despesa (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    type="number"
                    disabled={readOnly}
                    value={row.value || ''}
                    onChange={(e) => updateRow(row.id, 'value', parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs text-right"
                  />
                </TableCell>
                <TableCell className="p-2 text-center">
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRow(row.id)}
                      className="h-8 w-8 p-0 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!readOnly && (
          <div className="p-4">
            <Button onClick={addRow} variant="outline" size="sm" className="w-full border-dashed">
              <Plus className="h-4 w-4 mr-2" /> Adicionar Lançamento
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
