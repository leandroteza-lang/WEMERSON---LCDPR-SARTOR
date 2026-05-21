import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export type Producer = {
  id: string
  company_id: string
  cpf: string
  name: string
  active: boolean
  notes: string | null
}

export function useProducers(companyId?: string) {
  const [producers, setProducers] = useState<Producer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('producers')
      .select('*')
      .eq('company_id', companyId)
      .eq('active', true)
      .order('name')

    if (err) {
      setError(err.message)
    } else {
      setProducers(data || [])
    }
    setLoading(false)
  }, [companyId])

  useEffect(() => {
    load()
  }, [load])

  const addProducer = async ({
    cpf,
    name,
    notes,
  }: {
    cpf: string
    name: string
    notes?: string
  }) => {
    const { data, error: err } = await supabase
      .from('producers')
      .insert({ company_id: companyId, cpf, name, notes })
      .select()
      .single()

    if (!err && data) {
      setProducers((p) => [...p, data].sort((a, b) => a.name.localeCompare(b.name)))
    }
    return { data, error: err }
  }

  const deactivateProducer = async (id: string) => {
    const { error: err } = await supabase.from('producers').update({ active: false }).eq('id', id)

    if (err) return err
    setProducers((p) => p.filter((prod) => prod.id !== id))
    return null
  }

  return { producers, loading, error, addProducer, deactivateProducer, reload: load }
}
