import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

type Profile = {
  id: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
  company_id: string
  companies?: { name: string }
}

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  authError: string | null
  signIn: (email: string, pass: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  isAdmin: boolean
  isEditor: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (!currentSession?.user) {
        setProfile(null)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (!currentSession?.user) {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      setLoading(true)
      supabase
        .from('profiles')
        .select('*, companies(*)')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            setAuthError('Perfil não encontrado. Contate o administrador.')
            setProfile(null)
          } else {
            setProfile(data as Profile)
            setAuthError(null)
          }
          setLoading(false)
        })
    }
  }, [user])

  const signIn = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const isAdmin = profile?.role === 'admin'
  const isEditor = profile?.role === 'admin' || profile?.role === 'editor'

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, authError, signIn, signOut, isAdmin, isEditor }}
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
