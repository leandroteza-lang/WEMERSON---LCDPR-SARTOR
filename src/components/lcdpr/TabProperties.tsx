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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, Plus, Users } from 'lucide-react'
import { LCDPRContent } from '@/types/lcdpr'

export function TabProperties({
  content,
  updateContent,
  readOnly,
}: {
  content: LCDPRContent
  updateContent: any
  readOnly: boolean
}) {
  const properties = content.properties || []

  const addProperty = () => {
    updateContent({
      properties: [
        ...properties,
        {
          id: Date.now().toString(),
          name: '',
          cafir: '',
          incra: '',
          registration: '',
          ownership: '1',
          partners: [],
        },
      ],
    })
  }

  const updateProp = (id: string, field: string, value: any) => {
    updateContent({
      properties: properties.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    })
  }

  const deleteProp = (id: string) => {
    updateContent({ properties: properties.filter((p) => p.id !== id) })
  }

  const addPartner = (propId: string) => {
    updateContent({
      properties: properties.map((p) =>
        p.id === propId
          ? {
              ...p,
              partners: [
                ...(p.partners || []),
                { id: Date.now().toString(), name: '', tax_id: '', percentage: 0 },
              ],
            }
          : p,
      ),
    })
  }

  const updatePartner = (propId: string, partnerId: string, field: string, value: any) => {
    updateContent({
      properties: properties.map((p) =>
        p.id === propId
          ? {
              ...p,
              partners: p.partners.map((pt) =>
                pt.id === partnerId ? { ...pt, [field]: value } : pt,
              ),
            }
          : p,
      ),
    })
  }

  const deletePartner = (propId: string, partnerId: string) => {
    updateContent({
      properties: properties.map((p) =>
        p.id === propId ? { ...p, partners: p.partners.filter((pt) => pt.id !== partnerId) } : p,
      ),
    })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-800">
          Imóveis Rurais (0040) e Parceiros (0045)
        </h3>
        {!readOnly && (
          <Button onClick={addProperty} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Adicionar Imóvel
          </Button>
        )}
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Nome do Imóvel</TableHead>
            <TableHead>CAFIR</TableHead>
            <TableHead>Exploração</TableHead>
            <TableHead>Parceiros</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                Nenhum imóvel cadastrado.
              </TableCell>
            </TableRow>
          )}
          {properties.map((prop) => (
            <TableRow key={prop.id}>
              <TableCell>
                <Input
                  disabled={readOnly}
                  value={prop.name}
                  onChange={(e) => updateProp(prop.id, 'name', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  disabled={readOnly}
                  value={prop.cafir}
                  onChange={(e) => updateProp(prop.id, 'cafir', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Select
                  disabled={readOnly}
                  value={prop.ownership}
                  onValueChange={(v) => updateProp(prop.id, 'ownership', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Exploração Individual</SelectItem>
                    <SelectItem value="2">Condomínio</SelectItem>
                    <SelectItem value="3">Imóvel Arrendado</SelectItem>
                    <SelectItem value="4">Parceria</SelectItem>
                    <SelectItem value="5">Comodato</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" /> {prop.partners?.length || 0}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Parceiros - {prop.name || 'Novo Imóvel'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>CPF/CNPJ</TableHead>
                            <TableHead>%</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {prop.partners?.map((pt) => (
                            <TableRow key={pt.id}>
                              <TableCell>
                                <Input
                                  disabled={readOnly}
                                  value={pt.name}
                                  onChange={(e) =>
                                    updatePartner(prop.id, pt.id, 'name', e.target.value)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  disabled={readOnly}
                                  value={pt.tax_id}
                                  onChange={(e) =>
                                    updatePartner(prop.id, pt.id, 'tax_id', e.target.value)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  disabled={readOnly}
                                  value={pt.percentage}
                                  onChange={(e) =>
                                    updatePartner(
                                      prop.id,
                                      pt.id,
                                      'percentage',
                                      parseFloat(e.target.value),
                                    )
                                  }
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>
                                {!readOnly && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deletePartner(prop.id, pt.id)}
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
                      {!readOnly && (
                        <Button
                          onClick={() => addPartner(prop.id)}
                          variant="outline"
                          size="sm"
                          className="mt-4 w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Adicionar Parceiro
                        </Button>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell>
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProp(prop.id)}
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
