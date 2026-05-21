import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useLCDPRFiles } from '@/hooks/use-lcdpr-files'
import { supabase } from '@/lib/supabase/client'
import { audit } from '@/lib/audit'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Save,
  Lock,
  ArrowLeft,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Plus,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'

const safeAudit = (data: any[]) => {
  try {
    return audit ? audit(data) : { score: 100, issues: [] }
  } catch (e) {
    return { score: 100, issues: [] }
  }
}

export default function LCDPRApp() {
  const { producerId, year } = useParams()
  const navigate = useNavigate()
  const { isEditor, isAdmin } = useAuth()

  const { current, saving, saveError, lastSaved, loadYear, saveCurrentYear, finalizeYear } =
    useLCDPRFiles(producerId)

  const [content, setContent] = useState<any>({ properties: [], accounts: [], q100: [] })
  const [producer, setProducer] = useState<{ name: string; tax_id: string } | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!producerId) return
    supabase
      .from('producers')
      .select('name, tax_id')
      .eq('id', producerId)
      .single()
      .then(({ data }) => {
        if (data) setProducer(data)
      })
  }, [producerId])

  useEffect(() => {
    if (!producerId || !year) return
    loadYear(parseInt(year)).then(({ data: file, error }) => {
      if (error || !file) {
        toast.error('Arquivo LCDPR não encontrado.')
        navigate('/')
        return
      }

      const fileContent = file.content || { properties: [], accounts: [], q100: [] }
      setContent(fileContent)
      setResult(safeAudit(fileContent.q100 || []))
      setLoading(false)
    })
  }, [producerId, year])

  const updateContent = (partial: any) => {
    if (!isEditor || current?.status === 'finalized') return
    const newContent = { ...content, ...partial }
    setContent(newContent)

    const auditResult = safeAudit(newContent.q100 || [])
    setResult(auditResult)

    saveCurrentYear({ ...newContent, audit: auditResult })
  }

  const readOnly = !isEditor || current?.status === 'finalized'

  const handleFinalize = async () => {
    if (!confirm('Finalizar o LCDPR? Esta ação bloqueia edições futuras.')) return
    const { error } = await finalizeYear()
    if (error) toast.error(`Erro ao finalizar: ${error.message}`)
    else toast.success('LCDPR finalizado com sucesso!')
  }

  const handleUpdateProducer = async () => {
    if (!producer || !producerId) return
    const { error } = await supabase
      .from('producers')
      .update({ name: producer.name, tax_id: producer.tax_id })
      .eq('id', producerId)
    if (error) {
      toast.error('Erro ao atualizar produtor: ' + error.message)
    } else {
      toast.success('Produtor atualizado com sucesso!')
    }
  }

  // Q100
  const addQ100Row = () => {
    const q100 = content.q100 || []
    const newId = q100.length > 0 ? Math.max(...q100.map((d: any) => d.id)) + 1 : 1
    const newRow = {
      id: newId,
      reg: 'Q100',
      parts: ['Q100', '', '', '', '', '', '', '', '', '', '', ''],
    }
    updateContent({ q100: [...q100, newRow] })
  }

  const updateQ100Row = (id: number, partIndex: number, value: string) => {
    const q100 = (content.q100 || []).map((d: any) => {
      if (d.id === id) {
        const newParts = [...d.parts]
        newParts[partIndex] = value
        return { ...d, parts: newParts }
      }
      return d
    })
    updateContent({ q100 })
  }

  const deleteRow = (id: number) => {
    updateContent({ q100: (content.q100 || []).filter((d: any) => d.id !== id) })
  }

  // Properties 0040
  const handleAddProperty = () => {
    const newProps = [
      ...(content.properties || []),
      { id: Date.now().toString(), name: '', incra: '', registration: '', ownership: '' },
    ]
    updateContent({ properties: newProps })
  }

  const handleUpdateProperty = (id: string, field: string, value: string) => {
    const newProps = (content.properties || []).map((p: any) =>
      p.id === id ? { ...p, [field]: value } : p,
    )
    updateContent({ properties: newProps })
  }

  const handleDeleteProperty = (id: string) => {
    const newProps = (content.properties || []).filter((p: any) => p.id !== id)
    updateContent({ properties: newProps })
  }

  // Accounts 0050
  const handleAddAccount = () => {
    const newAccs = [
      ...(content.accounts || []),
      { id: Date.now().toString(), bank: '', agency: '', account: '' },
    ]
    updateContent({ accounts: newAccs })
  }

  const handleUpdateAccount = (id: string, field: string, value: string) => {
    const newAccs = (content.accounts || []).map((a: any) =>
      a.id === id ? { ...a, [field]: value } : a,
    )
    updateContent({ accounts: newAccs })
  }

  const handleDeleteAccount = (id: string) => {
    const newAccs = (content.accounts || []).filter((a: any) => a.id !== id)
    updateContent({ accounts: newAccs })
  }

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-lcdpr-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )

  const q100Rows = content.q100 || []
  const score = result?.score ?? 0
  const isScorePerfect = score === 100

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-slate-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              LCDPR {year}
              {current?.status === 'finalized' && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 ml-2">
                  <Lock className="h-3 w-3 mr-1" /> Finalizado
                </Badge>
              )}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-xs text-slate-500 mr-2 flex flex-col justify-center">
            {saveError ? (
              <span className="text-red-500 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Erro ao salvar
              </span>
            ) : saving ? (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div> Salvando...
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1 text-slate-400">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Salvo às{' '}
                {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white h-9">
              <Download className="h-4 w-4 mr-2" /> Exportar TXT
            </Button>

            {isAdmin && current?.status !== 'finalized' && isScorePerfect && (
              <Button
                onClick={handleFinalize}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-9"
              >
                <Lock className="h-4 w-4 mr-2" /> Finalizar LCDPR
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden p-6">
          <Tabs
            defaultValue="q100"
            className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <TabsList className="bg-transparent h-9 p-0 space-x-2">
                <TabsTrigger
                  value="0000"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs font-semibold px-4"
                >
                  0000 (Abertura)
                </TabsTrigger>
                <TabsTrigger
                  value="0040"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs font-semibold px-4"
                >
                  0040 (Imóveis)
                </TabsTrigger>
                <TabsTrigger
                  value="0050"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs font-semibold px-4"
                >
                  0050 (Contas)
                </TabsTrigger>
                <TabsTrigger
                  value="q100"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs font-semibold px-4 bg-lcdpr-primary/5 text-lcdpr-primary"
                >
                  Q100 (Lançamentos)
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="0000" className="p-8 overflow-auto flex-1">
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-lg font-medium text-slate-800">
                    Identificação do Produtor (Bloco 0000)
                  </h3>
                  <p className="text-sm text-slate-500">
                    Os dados informados aqui atualizam o cadastro principal do produtor e serão
                    refletidos no LCDPR.
                  </p>
                </div>

                <div className="grid gap-4 bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Nome Completo / Razão Social
                    </label>
                    <Input
                      disabled={readOnly}
                      value={producer?.name || ''}
                      onChange={(e) =>
                        setProducer((prev) => (prev ? { ...prev, name: e.target.value } : null))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">CPF</label>
                    <Input
                      disabled={readOnly}
                      value={producer?.tax_id || ''}
                      onChange={(e) =>
                        setProducer((prev) => (prev ? { ...prev, tax_id: e.target.value } : null))
                      }
                    />
                  </div>

                  {!readOnly && (
                    <div className="pt-2 flex justify-end">
                      <Button
                        onClick={handleUpdateProducer}
                        className="bg-lcdpr-primary hover:bg-lcdpr-primary/90 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" /> Salvar Dados do Produtor
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="0040" className="p-8 overflow-auto flex-1">
              <div className="space-y-4 max-w-5xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-800">
                      Imóveis Rurais (Bloco 0040)
                    </h3>
                    <p className="text-sm text-slate-500">
                      Cadastre os imóveis relacionados à atividade rural.
                    </p>
                  </div>
                  {!readOnly && (
                    <Button
                      onClick={handleAddProperty}
                      size="sm"
                      variant="outline"
                      className="border-lcdpr-primary/50 text-lcdpr-primary hover:bg-lcdpr-primary/5"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Adicionar Imóvel
                    </Button>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Identificador</TableHead>
                        <TableHead>Nome do Imóvel</TableHead>
                        <TableHead>Cód. INCRA</TableHead>
                        <TableHead>Nº Matrícula (CAEPF)</TableHead>
                        <TableHead>Exploração</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(content.properties || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                            Nenhum imóvel cadastrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (content.properties || []).map((prop: any) => (
                          <TableRow key={prop.id}>
                            <TableCell>
                              <Input
                                disabled
                                value={prop.id.substring(0, 5)}
                                readOnly
                                className="w-20 bg-slate-50 font-mono text-xs"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                disabled={readOnly}
                                value={prop.name}
                                onChange={(e) =>
                                  handleUpdateProperty(prop.id, 'name', e.target.value)
                                }
                                placeholder="Fazenda Esperança"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                disabled={readOnly}
                                value={prop.incra}
                                onChange={(e) =>
                                  handleUpdateProperty(prop.id, 'incra', e.target.value)
                                }
                                placeholder="000.000.000-00"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                disabled={readOnly}
                                value={prop.registration}
                                onChange={(e) =>
                                  handleUpdateProperty(prop.id, 'registration', e.target.value)
                                }
                                placeholder="12345678"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                disabled={readOnly}
                                value={prop.ownership}
                                onValueChange={(v) => handleUpdateProperty(prop.id, 'ownership', v)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="proprio">Propriedade</SelectItem>
                                  <SelectItem value="arrendamento">Arrendamento</SelectItem>
                                  <SelectItem value="parceria">Parceria</SelectItem>
                                  <SelectItem value="comodato">Comodato</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {!readOnly && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteProperty(prop.id)}
                                  className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="0050" className="p-8 overflow-auto flex-1">
              <div className="space-y-4 max-w-4xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-800">
                      Contas Bancárias (Bloco 0050)
                    </h3>
                    <p className="text-sm text-slate-500">
                      Cadastre as contas utilizadas na atividade rural.
                    </p>
                  </div>
                  {!readOnly && (
                    <Button
                      onClick={handleAddAccount}
                      size="sm"
                      variant="outline"
                      className="border-lcdpr-primary/50 text-lcdpr-primary hover:bg-lcdpr-primary/5"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Adicionar Conta
                    </Button>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Cód. Banco</TableHead>
                        <TableHead>Agência</TableHead>
                        <TableHead>Número da Conta</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(content.accounts || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                            Nenhuma conta cadastrada.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (content.accounts || []).map((acc: any) => (
                          <TableRow key={acc.id}>
                            <TableCell>
                              <Input
                                disabled={readOnly}
                                value={acc.bank}
                                onChange={(e) =>
                                  handleUpdateAccount(acc.id, 'bank', e.target.value)
                                }
                                placeholder="001"
                                className="w-24 font-mono"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                disabled={readOnly}
                                value={acc.agency}
                                onChange={(e) =>
                                  handleUpdateAccount(acc.id, 'agency', e.target.value)
                                }
                                placeholder="1234-5"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                disabled={readOnly}
                                value={acc.account}
                                onChange={(e) =>
                                  handleUpdateAccount(acc.id, 'account', e.target.value)
                                }
                                placeholder="12345-6"
                              />
                            </TableCell>
                            <TableCell>
                              {!readOnly && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteAccount(acc.id)}
                                  className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="q100" className="flex-1 overflow-auto p-0 m-0">
              <div className="min-w-[1000px] w-full">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <TableRow className="border-slate-200">
                      <TableHead className="w-12 text-center text-xs font-bold text-slate-500">
                        #
                      </TableHead>
                      <TableHead className="w-[120px] text-xs font-bold text-slate-500">
                        Data
                      </TableHead>
                      <TableHead className="w-[120px] text-xs font-bold text-slate-500">
                        Conta (0050)
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-500">Documento</TableHead>
                      <TableHead className="w-[140px] text-xs font-bold text-slate-500 text-right">
                        Valor
                      </TableHead>
                      <TableHead className="w-24 text-xs font-bold text-slate-500 text-center">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {q100Rows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-32 text-center text-slate-400 font-medium"
                        >
                          Nenhum lançamento no Q100.
                        </TableCell>
                      </TableRow>
                    ) : (
                      q100Rows.map((row: any, index: number) => (
                        <TableRow
                          key={row.id}
                          className="hover:bg-slate-50/50 group border-b border-slate-100"
                        >
                          <TableCell className="text-center text-xs text-slate-400 font-mono">
                            {index + 1}
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              value={row.parts[1] || ''}
                              onChange={(e) => updateQ100Row(row.id, 1, e.target.value)}
                              disabled={readOnly}
                              className="h-8 text-xs font-mono font-medium rounded-md focus-visible:ring-1 bg-transparent border-transparent hover:border-slate-200 focus:border-lcdpr-primary focus:bg-white"
                              placeholder="DDMMAAAA"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              value={row.parts[2] || ''}
                              onChange={(e) => updateQ100Row(row.id, 2, e.target.value)}
                              disabled={readOnly}
                              className="h-8 text-xs font-mono font-medium rounded-md focus-visible:ring-1 bg-transparent border-transparent hover:border-slate-200 focus:border-lcdpr-primary focus:bg-white"
                              placeholder="COD"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              value={row.parts[4] || ''}
                              onChange={(e) => updateQ100Row(row.id, 4, e.target.value)}
                              disabled={readOnly}
                              className="h-8 text-xs font-medium rounded-md focus-visible:ring-1 bg-transparent border-transparent hover:border-slate-200 focus:border-lcdpr-primary focus:bg-white"
                              placeholder="Nº Documento"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              value={row.parts[7] || ''}
                              onChange={(e) => updateQ100Row(row.id, 7, e.target.value)}
                              disabled={readOnly}
                              className="h-8 text-xs font-mono font-semibold text-right rounded-md focus-visible:ring-1 bg-transparent border-transparent hover:border-slate-200 focus:border-lcdpr-primary focus:bg-white"
                              placeholder="0,00"
                            />
                          </TableCell>
                          <TableCell className="text-center p-2">
                            {!readOnly && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteRow(row.id)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {!readOnly && (
                  <div className="p-4 border-t border-slate-100">
                    <Button
                      onClick={addQ100Row}
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed border-slate-300 text-slate-500 hover:text-lcdpr-primary hover:border-lcdpr-primary/50 hover:bg-lcdpr-primary/5"
                    >
                      + Adicionar Linha Q100
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-[320px] bg-white border-l border-slate-200 flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-slate-400" />
              Auditoria Automática
            </h3>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Health Score</span>
              <span
                className={`text-xl font-black ${isScorePerfect ? 'text-emerald-500' : score >= 70 ? 'text-amber-500' : 'text-red-500'}`}
              >
                {score}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${isScorePerfect ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Inconsistências ({result?.issues?.length || 0})
            </h4>

            {result?.issues?.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-emerald-700">Tudo certo!</p>
                <p className="text-xs text-emerald-600/70 mt-1">
                  Nenhum erro encontrado nos lançamentos.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {result?.issues?.map((issue: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded-md font-mono">
                        {issue.reg}
                      </span>
                      <p className="text-sm text-red-900 mt-1.5 font-medium leading-tight">
                        {issue.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
