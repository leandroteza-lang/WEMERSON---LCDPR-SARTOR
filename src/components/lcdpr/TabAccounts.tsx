import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export function TabAccounts({
  content,
  updateContent,
  readOnly,
}: {
  content: LCDPRContent
  updateContent: any
  readOnly: boolean
}) {
  const accounts = content.accounts || []

  const addAccount = () => {
    updateContent({
      accounts: [...accounts, { id: Date.now().toString(), bank: '', agency: '', account: '' }],
    })
  }

  const updateAccount = (id: string, field: string, value: string) => {
    updateContent({ accounts: accounts.map((a) => (a.id === id ? { ...a, [field]: value } : a)) })
  }

  const deleteAccount = (id: string) => {
    updateContent({ accounts: accounts.filter((a) => a.id !== id) })
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-800">Contas Bancárias (0050)</h3>
        {!readOnly && (
          <Button onClick={addAccount} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Adicionar Conta
          </Button>
        )}
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Cód. Banco</TableHead>
            <TableHead>Agência</TableHead>
            <TableHead>Conta</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                Nenhuma conta cadastrada.
              </TableCell>
            </TableRow>
          )}
          {accounts.map((acc) => (
            <TableRow key={acc.id}>
              <TableCell>
                <Input
                  disabled={readOnly}
                  value={acc.bank}
                  onChange={(e) => updateAccount(acc.id, 'bank', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  disabled={readOnly}
                  value={acc.agency}
                  onChange={(e) => updateAccount(acc.id, 'agency', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  disabled={readOnly}
                  value={acc.account}
                  onChange={(e) => updateAccount(acc.id, 'account', e.target.value)}
                />
              </TableCell>
              <TableCell>
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAccount(acc.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
