import { supabase } from '@/lib/supabase/client'

export const getCompanies = async () => {
  const { data, error } = await supabase.from('companies').select('*')
  return { data, error }
}

export const getProducers = async () => {
  const { data, error } = await supabase.from('producers').select('*')
  return { data, error }
}

export const getFiles = async (producerId: string) => {
  const { data, error } = await supabase
    .from('lcdpr_files')
    .select('*')
    .eq('producer_id', producerId)
  return { data, error }
}

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return { data, error }
}
