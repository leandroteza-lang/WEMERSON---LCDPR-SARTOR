import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, AlertCircle, Trash2 } from 'lucide-react'
import { Producer } from '@/hooks/use-producers'
import { useLCDPRFiles } from '@/hooks/use-lcdpr-files'

const STATUS_BADGE = {
  draft: { cls: 'bg-slate-100 text-slate-600', label: 'Rascunho' },
  review: { cls: 'bg-amber-100 text-amber-700', label: 'Em Revisão' },
  finalized: { cls: 'bg-emerald-100 text-emerald-700', label: 'Finalizado' },
}

export function ProducerCard({
  producer,
  isEditor,
  isAdmin,
  onOpen,
  onDeactivate,
}: {
  producer: Producer
  isEditor: boolean
  isAdmin: boolean
  onOpen: (year: number) => void
  onDeactivate: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showNewYear, setShowNewYear] = useState(false)
  const [newYear, setNewYear] = useState(new Date().getFullYear())
  const [creating, setCreating] = useState(false)
  const [createErr, setCreateErr] = useState('')

  const { files, createYear } = useLCDPRFiles(producer.id)

  const fmtCPF = (cpf: string) =>
    cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

  const yearsExisting = new Set(files.map((f) => f.year))
  const nextYear = new Date().getFullYear() + 1
  const availableYears = Array.from({ length: 12 }, (_, i) => nextYear - i).filter(
    (y) => !yearsExisting.has(y),
  )

  const handleCreateYear = async () => {
    setCreating(true)
    setCreateErr('')
    const { error } = await createYear(newYear, producer.cpf, producer.name)
    if (error) {
      setCreateErr(error)
    } else {
      setShowNewYear(false)
      onOpen(newYear)
    }
    setCreating(false)
  }

  return (
    <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-lcdpr-primary/10 flex items-center justify-center text-lcdpr-primary font-bold text-lg">
            {producer.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{producer.name}</h3>
            <p className="text-sm text-slate-500 font-mono">{fmtCPF(producer.cpf)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Desativar ${producer.name}?`)) onDeactivate()
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
            {files.length} ano(s)
          </Badge>
          {expanded ? (
            <ChevronUp className="text-slate-400 h-5 w-5" />
          ) : (
            <ChevronDown className="text-slate-400 h-5 w-5" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          <div className="divide-y divide-slate-100">
            {files.map((file) => {
              const badge = STATUS_BADGE[file.status] || STATUS_BADGE.draft
              const scoreColor =
                (file.score ?? 0) >= 90
                  ? 'text-emerald-600'
                  : (file.score ?? 0) >= 70
                    ? 'text-amber-600'
                    : 'text-red-600'
              return (
                <div
                  key={file.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-slate-700 text-lg">{file.year}</span>
                    <Badge variant="outline" className={`border-none ${badge.cls}`}>
                      {badge.label}
                    </Badge>
                    {file.score !== null && (
                      <span className={`text-sm font-bold ${scoreColor}`}>Score {file.score}%</span>
                    )}
                    {file.issues_count > 0 && (
                      <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                        <AlertCircle className="h-4 w-4" /> {file.issues_count}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400">
                      Atualizado em {new Date(file.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                    <Button
                      onClick={() => onOpen(file.year)}
                      variant={file.status === 'finalized' ? 'outline' : 'default'}
                      size="sm"
                      className={
                        file.status !== 'finalized'
                          ? 'bg-lcdpr-primary hover:bg-lcdpr-primary/90'
                          : ''
                      }
                    >
                      {file.status === 'finalized' ? 'Visualizar' : 'Abrir'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {isEditor && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 border-dashed">
              {createErr && <p className="text-sm text-red-600 mb-2">{createErr}</p>}
              {!showNewYear ? (
                <Button
                  variant="link"
                  onClick={() => setShowNewYear(true)}
                  className="text-lcdpr-primary p-0 h-auto font-semibold"
                >
                  + Criar Novo Ano
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <select
                    value={newYear}
                    onChange={(e) => setNewYear(+e.target.value)}
                    className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-lcdpr-primary"
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={handleCreateYear}
                    disabled={creating}
                    size="sm"
                    className="bg-lcdpr-accent text-slate-900 hover:bg-lcdpr-accent/90"
                  >
                    {creating ? 'Criando...' : 'Criar LCDPR'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewYear(false)
                      setCreateErr('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
