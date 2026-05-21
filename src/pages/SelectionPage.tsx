import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useProducers } from '@/hooks/use-producers'
import { cpfOk } from '@/lib/utils'
import { ProducerCard } from '@/components/ProducerCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function SelectionPage() {
  const navigate = useNavigate()
  const { profile, isEditor, isAdmin } = useAuth()
  const { producers, loading, error, addProducer, deactivateProducer } = useProducers(
    profile?.company_id,
  )

  const [search, setSearch] = useState('')
  const [showAddProd, setShowAddProd] = useState(false)
  const [newCPF, setNewCPF] = useState('')
  const [newName, setNewName] = useState('')
  const [addErr, setAddErr] = useState('')
  const [adding, setAdding] = useState(false)

  const filtered = useMemo(
    () =>
      producers.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.cpf.includes(search.replace(/\D/g, '')),
      ),
    [producers, search],
  )

  const handleAddProducer = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddErr('')
    setAdding(true)
    const cpfLimpo = newCPF.replace(/\D/g, '')

    if (!cpfOk(cpfLimpo)) {
      setAddErr('CPF inválido — verifique os dígitos verificadores.')
      setAdding(false)
      return
    }

    const { error: err } = await addProducer({ cpf: cpfLimpo, name: newName })
    if (err) {
      setAddErr(err.code === '23505' ? 'CPF já cadastrado para esta empresa.' : err.message)
    } else {
      setShowAddProd(false)
      setNewCPF('')
      setNewName('')
    }
    setAdding(false)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Produtores Rurais</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie os livros caixa digitais dos seus clientes.
          </p>
        </div>
        {isEditor && (
          <Button
            onClick={() => setShowAddProd(true)}
            className="bg-lcdpr-primary hover:bg-lcdpr-primary/90 h-10 px-5 rounded-xl shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Produtor
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por nome ou CPF..."
              className="w-full pl-12 h-14 rounded-2xl bg-white border-slate-200 shadow-sm text-base focus-visible:ring-lcdpr-primary/20"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 flex items-center">
              Erro ao carregar produtores: {error}
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <>
              {filtered.length === 0 && !error ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">
                    Nenhum produtor encontrado
                  </h3>
                  <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                    {producers.length === 0
                      ? 'Você ainda não possui produtores cadastrados. Clique em "Novo Produtor" para começar.'
                      : 'Nenhum produtor corresponde à sua pesquisa. Tente buscar por outro termo.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-1">
                  {filtered.map((producer) => (
                    <ProducerCard
                      key={producer.id}
                      producer={producer}
                      isEditor={isEditor}
                      isAdmin={isAdmin}
                      onOpen={(year) => navigate(`/lcdpr/${producer.id}/${year}`)}
                      onDeactivate={() => deactivateProducer(producer.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={showAddProd} onOpenChange={setShowAddProd}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl">
          <div className="p-6 pt-8 pb-4">
            <DialogHeader>
              <DialogTitle className="text-2xl">Novo Produtor Rural</DialogTitle>
              <DialogDescription>
                Cadastre um novo produtor para gerenciar o LCDPR.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleAddProducer} className="px-6 pb-8 space-y-5">
            {addErr && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                {addErr}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cpf">
                CPF <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cpf"
                value={newCPF}
                onChange={(e) => setNewCPF(e.target.value)}
                required
                placeholder="000.000.000-00"
                maxLength={14}
                className="font-mono h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                placeholder="Nome do produtor rural"
                className="h-12"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddProd(false)}
                className="flex-1 h-12 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={adding}
                className="flex-1 h-12 rounded-xl bg-lcdpr-primary hover:bg-lcdpr-primary/90"
              >
                {adding ? 'Salvando...' : 'Cadastrar Produtor'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
