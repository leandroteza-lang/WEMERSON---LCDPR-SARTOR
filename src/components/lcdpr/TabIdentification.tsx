import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LCDPRContent } from '@/types/lcdpr'

export function TabIdentification({
  content,
  updateContent,
  readOnly,
}: {
  content: LCDPRContent
  updateContent: any
  readOnly: boolean
}) {
  const ident = content.identification
  const addr = ident.address

  const updateIdent = (field: string, value: string) =>
    updateContent({ identification: { ...ident, [field]: value } })
  const updateAddr = (field: string, value: string) =>
    updateContent({ identification: { ...ident, address: { ...addr, [field]: value } } })

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <section>
        <h3 className="text-lg font-medium text-slate-800 mb-4">
          Dados do Produtor Rural (0000/0010/0030)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome Completo / Razão Social</Label>
            <Input
              disabled={readOnly}
              value={ident.name}
              onChange={(e) => updateIdent('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>CPF</Label>
            <Input
              disabled={readOnly}
              value={ident.tax_id}
              onChange={(e) => updateIdent('tax_id', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Data Início</Label>
            <Input
              type="date"
              disabled={readOnly}
              value={ident.start_date}
              onChange={(e) => updateIdent('start_date', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Data Fim</Label>
            <Input
              type="date"
              disabled={readOnly}
              value={ident.end_date}
              onChange={(e) => updateIdent('end_date', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Forma de Apuração</Label>
            <Select
              disabled={readOnly}
              value={ident.tax_type}
              onValueChange={(v) => updateIdent('tax_type', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Livro Caixa</SelectItem>
                <SelectItem value="2">Apuração Simplificada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-medium text-slate-800 mb-4">Endereço</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Rua / Logradouro</Label>
            <Input
              disabled={readOnly}
              value={addr.street}
              onChange={(e) => updateAddr('street', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número</Label>
              <Input
                disabled={readOnly}
                value={addr.number}
                onChange={(e) => updateAddr('number', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input
                disabled={readOnly}
                value={addr.zip}
                onChange={(e) => updateAddr('zip', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bairro</Label>
            <Input
              disabled={readOnly}
              value={addr.neighborhood}
              onChange={(e) => updateAddr('neighborhood', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                disabled={readOnly}
                value={addr.city}
                onChange={(e) => updateAddr('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado (UF)</Label>
              <Input
                disabled={readOnly}
                value={addr.state}
                onChange={(e) => updateAddr('state', e.target.value)}
                maxLength={2}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
