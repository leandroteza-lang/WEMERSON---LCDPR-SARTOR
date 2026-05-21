import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Profile = {
  id: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
  company_id: string
  companies?: { name: string }
}

type AuthContextType = {
  user: any
  profile: Profile | null
  loading: boolean
  authError: string | null
  signIn: (email: string, pass: string) => Promise<any>
  signOut: () => Promise<void>
  isAdmin: boolean
  isEditor: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user)
      else setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadProfile(session.user)
      else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (u: any) => {
    setUser(u)
    setAuthError(null)
    const { data, error } = await supabase
      .from('profiles')
      .select('*, companies(*)')
      .eq('id', u.id)
      .single()

    if (error) {
      setAuthError('Perfil não encontrado. Contate o administrador.')
      setProfile(null)
    } else {
      setProfile(data as Profile)
    }
    setLoading(false)
  }

  const signIn = (email: string, pass: string) =>
    supabase.auth.signInWithPassword({ email, password: pass })
  const signOut = () => supabase.auth.signOut()

  const isAdmin = profile?.role === 'admin'
  const isEditor = profile?.role === 'admin' || profile?.role === 'editor'

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, authError, signIn, signOut, isAdmin, isEditor }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
