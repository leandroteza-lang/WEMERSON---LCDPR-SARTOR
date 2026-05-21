import React, { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [tab, setTab] = useState<'login' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    try {
      const { error } = await signIn(email, pass)
      if (error) {
        setErr(
          error.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos.'
            : error.message,
        )
      }
    } catch (error: any) {
      setErr(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    setMsg('')
    // Not implemented fully based on context, but mocking the flow
    setTimeout(() => {
      setMsg('Link de recuperação enviado (simulado).')
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-lcdpr-primary shadow-lg">
            <span className="text-white text-3xl font-black tracking-tighter">L</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">LCDPR Master</h1>
          <p className="text-slate-500 text-sm mt-2">
            Sistema Profissional de Auditoria · Leiaute 1.3
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Entrar na sua conta</h2>
              {err && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
                  {err}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-600">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="contato@escritorio.com.br"
                  className="h-12 px-4 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-600">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 px-4 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-lcdpr-primary hover:bg-lcdpr-primary/90 text-md font-semibold mt-4"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  className="text-sm font-medium text-lcdpr-secondary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Recuperar senha</h2>
              <p className="text-sm text-slate-500 mb-6">
                Informe seu e-mail para receber o link de recuperação.
              </p>

              {err && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  {err}
                </div>
              )}
              {msg && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
                  {msg}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-slate-600">
                  E-mail
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="contato@escritorio.com.br"
                  className="h-12 px-4 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-lcdpr-primary hover:bg-lcdpr-primary/90 text-md font-semibold mt-4"
              >
                {loading ? 'Enviando...' : 'Enviar link'}
              </Button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login')
                    setErr('')
                    setMsg('')
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center justify-center w-full gap-2"
                >
                  ← Voltar ao login
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          Acesso exclusivo para usuários cadastrados por convite.
        </p>
      </div>
    </div>
  )
}
