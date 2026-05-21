import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type OrgUser = {
  id: string
  name: string
  role: string
  created_at: string
}

export function useUserManagement(companyId?: string, isAdmin?: boolean) {
  const [users, setUsers] = useState<OrgUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin || !companyId) return
    setLoading(true)
    setError(null)
    supabase
      .from('profiles')
      .select('id, name, role, created_at')
      .eq('company_id', companyId)
      .order('name')
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setUsers((data as OrgUser[]) || [])
        setLoading(false)
      })
  }, [companyId, isAdmin])

  const inviteUser = async (email: string, name: string, role = 'editor') => {
    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: { email, name, role, company_id: companyId },
    })
    return { data, error }
  }

  const updateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .eq('company_id', companyId)

    if (!error)
      setUsers((u) => u.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    return error
  }

  const removeUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ company_id: null }).eq('id', userId)

    if (!error) setUsers((u) => u.filter((user) => user.id !== userId))
    return error
  }

  return { users, loading, error, inviteUser, updateRole, removeUser }
}
