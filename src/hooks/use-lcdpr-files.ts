import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { debounce } from '@/lib/utils'

export type LCDPRFile = {
  id: string
  producer_id: string
  year: number
  content: any
  status: 'draft' | 'review' | 'finalized'
  created_at: string
}

export function useLCDPRFiles(producerId?: string) {
  const [files, setFiles] = useState<LCDPRFile[]>([])
  const [current, setCurrent] = useState<LCDPRFile | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    if (!producerId) {
      setFiles([])
      setCurrent(null)
      return
    }
    supabase
      .from('lcdpr_files')
      .select('id, year, status, created_at, content')
      .eq('producer_id', producerId)
      .order('year', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setFiles((data as LCDPRFile[]) || [])
      })
  }, [producerId])

  const loadYear = async (year: number) => {
    const { data, error } = await supabase
      .from('lcdpr_files')
      .select('*')
      .eq('producer_id', producerId)
      .eq('year', year)
      .single()

    if (!error && data) {
      setCurrent(data as LCDPRFile)
    }
    return { data, error }
  }

  const _doSave = useRef(
    debounce(async (fileId: string, content: any) => {
      setSaving(true)
      setSaveError(null)
      const { error } = await supabase.from('lcdpr_files').update({ content }).eq('id', fileId)

      if (error) {
        setSaveError(error.message)
      } else {
        setLastSaved(new Date())
      }
      setSaving(false)
    }, 1500),
  ).current

  useEffect(() => {
    return () => {
      if (_doSave && typeof _doSave.flush === 'function') {
        _doSave.flush()
      }
    }
  }, [_doSave])

  const saveCurrentYear = (content: any) => {
    if (!current) return
    setCurrent((c) => (c ? { ...c, content } : null))
    _doSave(current.id, content)
  }

  const createYear = async (year: number, cpf?: string, name?: string) => {
    const blankContent = {
      properties: [],
      accounts: [],
      q100: [],
    }
    const { data, error } = await supabase
      .from('lcdpr_files')
      .insert({ producer_id: producerId!, year, content: blankContent, status: 'draft' })
      .select('*')
      .single()

    if (error) {
      return {
        data: null,
        error: error.code === '23505' ? `LCDPR ${year} já existe.` : error.message,
      }
    } else {
      setFiles((f) => [data as LCDPRFile, ...f])
      return { data, error: null }
    }
  }

  const finalizeYear = async () => {
    if (!current) return { error: new Error('Nenhum arquivo carregado') }
    const { error } = await supabase
      .from('lcdpr_files')
      .update({ status: 'finalized' })
      .eq('id', current.id)

    if (error) return { error }
    setCurrent((c) => (c ? { ...c, status: 'finalized' } : null))
    setFiles((f) =>
      f.map((file) => (file.id === current.id ? { ...file, status: 'finalized' } : file)),
    )
    return { error: null }
  }

  return {
    files,
    current,
    saving,
    saveError,
    lastSaved,
    loadYear,
    saveCurrentYear,
    createYear,
    finalizeYear,
  }
}
