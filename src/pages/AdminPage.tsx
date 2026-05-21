import React, { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useUserManagement } from '@/hooks/use-user-management'
import { useProducers } from '@/hooks/use-producers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Trash2, UserPlus, Mail, Users, Tractor } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Visualizador',
}
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  editor: 'bg-blue-100 text-blue-700 border-blue-200',
  viewer: 'bg-slate-100 text-slate-600 border-slate-200',
}

export default function AdminPage() {
  const { user, profile, isAdmin } = useAuth()
  const { users, loading, error, inviteUser, updateRole, removeUser } = useUserManagement(
    profile?.company_id,
    isAdmin,
  )
  const { producers, loading: loadingProducers } = useProducers(profile?.company_id || undefined)

  const [invEmail, setInvEmail] = useState('')
  const [invName, setInvName] = useState('')
  const [invRole, setInvRole] = useState('editor')
  const [invLoading, setInvLoading] = useState(false)
  const [invErr, setInvErr] = useState('')
  const [invMsg, setInvMsg] = useState('')

  if (!isAdmin) return <Navigate to="/" replace />

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInvLoading(true)
    setInvErr('')
    setInvMsg('')
    const { error: err } = await inviteUser(invEmail, invName, invRole)
    if (err) {
      setInvErr(err.message || String(err))
    } else {
      setInvMsg(`Convite enviado para ${invEmail}.`)
      setInvEmail('')
      setInvName('')
      setInvRole('editor')
    }
    setInvLoading(false)
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const err = await updateRole(userId, newRole)
    if (err) alert(`Erro ao atualizar role: ${err.message}`)
  }

  const handleRemove = async (u: any) => {
    if (!confirm(`Remover ${u.name} da empresa? O usuário perderá o acesso aos dados.`)) return
    const err = await removeUser(u.id)
    if (err) alert(`Erro ao remover usuário: ${err.message}`)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Equipe & Usuários</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie acessos e convites para {profile?.companies?.name}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[350px_1fr] gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Convidar Membro</h2>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                {invErr && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{invErr}</div>
                )}
                {invMsg && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{invMsg}</div>
                )}

                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={invName}
                    onChange={(e) => setInvName(e.target.value)}
                    required
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={invEmail}
                    onChange={(e) => setInvEmail(e.target.value)}
                    required
                    placeholder="joao@escritorio.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nível de Acesso</Label>
                  <Select value={invRole} onValueChange={setInvRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Visualizador (Leitura)</SelectItem>
                      <SelectItem value="editor">Editor (Leitura e Escrita)</SelectItem>
                      <SelectItem value="admin">Administrador (Total)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={invLoading}
                  className="w-full bg-lcdpr-primary hover:bg-lcdpr-primary/90 mt-2"
                >
                  {invLoading ? 'Enviando...' : 'Enviar Convite'}
                </Button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-400" />
                Usuários Ativos
              </h2>
              <Badge variant="secondary" className="font-mono">
                {users.length}
              </Badge>
            </div>

            <div className="flex-1 overflow-auto">
              {loading && <div className="p-8 text-center text-slate-400">Carregando...</div>}
              {error && <div className="p-8 text-center text-red-500">{error}</div>}

              <div className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isMe = u.id === user?.id
                  return (
                    <div
                      key={u.id}
                      className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg shadow-inner">
                          {(u.name || '?').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-md flex items-center gap-2">
                            {u.name || 'Usuário Pendente'}
                            {isMe && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 px-1.5 border-blue-200 text-blue-600"
                              >
                                Você
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                            Adicionado em {new Date(u.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Select
                          disabled={isMe}
                          value={u.role}
                          onValueChange={(val) => handleUpdateRole(u.id, val)}
                        >
                          <SelectTrigger
                            className={`w-[140px] h-9 text-xs font-semibold ${ROLE_COLORS[u.role] || ''}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>

                        {!isMe && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(u)}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-9 w-9"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Tractor className="h-5 w-5 text-slate-400" />
                Produtores Ativos
              </h2>
              <Badge variant="secondary" className="font-mono">
                {producers.length}
              </Badge>
            </div>
            <div className="p-6 overflow-auto">
              {loadingProducers && <div className="text-center text-slate-400">Carregando...</div>}
              {!loadingProducers && producers.length === 0 && (
                <div className="text-center text-slate-500">Nenhum produtor encontrado.</div>
              )}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {producers.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col relative"
                  >
                    <span className="font-semibold text-slate-800">{p.name}</span>
                    <span className="text-sm text-slate-500">CPF: {p.cpf}</span>
                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                        <Link to={`/`}>Abrir Painel</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
