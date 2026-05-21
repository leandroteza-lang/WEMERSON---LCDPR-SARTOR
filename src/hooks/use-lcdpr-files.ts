import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { debounce } from '@/lib/utils'

export type LCDPRFile = {
  id: string
  producer_id: string
  year: number
  data: any[]
  status: 'draft' | 'review' | 'finalized'
  score: number | null
  issues_count: number
  updated_at: string
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
      .select('id, year, status, score, issues_count, updated_at')
      .eq('producer_id', producerId)
      .order('year', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setFiles((data as unknown as LCDPRFile[]) || [])
      })
  }, [producerId])

  const loadYear = async (year: number) => {
    const { data, error } = await supabase
      .from('lcdpr_files')
      .select('*')
      .eq('producer_id', producerId)
      .eq('year', year)
      .single()

    if (!error && data) setCurrent(data as LCDPRFile)
    return { data, error }
  }

  const _doSave = useRef(
    debounce(async (fileId: string, rows: any[], meta: any) => {
      setSaving(true)
      setSaveError(null)
      const { error } = await supabase
        .from('lcdpr_files')
        .update({ data: rows, ...meta })
        .eq('id', fileId)

      if (error) {
        setSaveError(error.message)
      } else {
        setLastSaved(new Date())
      }
      setSaving(false)
    }, 1500),
  ).current

  useEffect(() => {
    return () => _doSave.flush()
  }, [_doSave])

  const saveCurrentYear = (rows: any[], auditResult: any) => {
    if (!current) return
    setCurrent((c) => (c ? { ...c, data: rows } : null))
    _doSave(current.id, rows, {
      score: auditResult?.score ?? null,
      issues_count: auditResult?.issues?.length ?? 0,
      issues_data: auditResult?.issues?.slice(0, 50) ?? [],
    })
  }

  const createYear = async (year: number, cpf: string, name: string) => {
    const blank = [
      {
        id: 0,
        reg: '0000',
        parts: [
          '0000',
          'LCDPR',
          '0013',
          cpf.replace(/\D/g, ''),
          name,
          '0',
          '0',
          '',
          `0101${year}`,
          `3112${year}`,
        ],
      },
      { id: 1, reg: '0010', parts: ['0010', '1'] },
      { id: 2, reg: '0030', parts: ['0030', '', '', '', '', '', '', '', '', ''] },
      { id: 3, reg: '9999', parts: ['9999', '', '', '', '', '', '3'] },
    ]
    const { data, error } = await supabase
      .from('lcdpr_files')
      .insert({ producer_id: producerId, year, data: blank, status: 'draft' })
      .select('id, year, status, score, issues_count, updated_at')
      .single()

    if (error) {
      return {
        data: null,
        error: error.code === '23505' ? `LCDPR ${year} já existe.` : error.message,
      }
    } else {
      setFiles((f) => [data as unknown as LCDPRFile, ...f])
      return { data, error: null }
    }
  }

  const finalizeYear = async () => {
    if (!current) return { error: new Error('Nenhum arquivo carregado') }
    const { error } = await supabase
      .from('lcdpr_files')
      .update({ status: 'finalized', submitted_at: new Date().toISOString() })
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
