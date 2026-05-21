import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Lock, Download, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function LCDPRHeader({
  year,
  current,
  saving,
  saveError,
  lastSaved,
  finalizeYear,
  isAdmin,
}: any) {
  const navigate = useNavigate()

  const handleFinalize = async () => {
    if (!confirm('Finalizar o LCDPR? Esta ação bloqueia edições futuras.')) return
    const { error } = await finalizeYear()
    if (error) toast.error(`Erro ao finalizar: ${error.message}`)
    else toast.success('LCDPR finalizado com sucesso!')
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-slate-500">
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

          {isAdmin && current?.status !== 'finalized' && (
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
  )
}
