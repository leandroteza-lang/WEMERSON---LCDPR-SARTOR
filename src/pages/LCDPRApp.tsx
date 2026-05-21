import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useLCDPRFiles } from '@/hooks/use-lcdpr-files'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { LCDPRHeader } from '@/components/lcdpr/LCDPRHeader'
import { TabIdentification } from '@/components/lcdpr/TabIdentification'
import { TabProperties } from '@/components/lcdpr/TabProperties'
import { TabAccounts } from '@/components/lcdpr/TabAccounts'
import { TabQ100 } from '@/components/lcdpr/TabQ100'
import { TabQ200 } from '@/components/lcdpr/TabQ200'
import { LCDPRContent } from '@/types/lcdpr'

const defaultContent: LCDPRContent = {
  identification: {
    name: '',
    tax_id: '',
    start_date: '',
    end_date: '',
    tax_type: '1',
    address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
  },
  properties: [],
  accounts: [],
  q100: [],
}

export default function LCDPRApp() {
  const { producerId, year } = useParams()
  const navigate = useNavigate()
  const { isEditor, isAdmin } = useAuth() as any
  const { current, saving, saveError, lastSaved, loadYear, saveCurrentYear, finalizeYear } =
    useLCDPRFiles(producerId)

  const [content, setContent] = useState<LCDPRContent>(defaultContent)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!producerId || !year) return
    loadYear(parseInt(year)).then(({ data: file, error }) => {
      if (error || !file) {
        toast.error('Arquivo LCDPR não encontrado.')
        navigate('/')
        return
      }

      const loaded = (file.content as any) || {}
      let q100 = loaded.q100 || []
      if (q100.length > 0 && Array.isArray(q100[0].parts)) {
        q100 = []
      }

      setContent({
        identification: { ...defaultContent.identification, ...(loaded.identification || {}) },
        properties: loaded.properties || [],
        accounts: loaded.accounts || [],
        q100: q100,
      })
      setLoading(false)
    })
  }, [producerId, year])

  const updateContent = (partial: Partial<LCDPRContent>) => {
    if (!isEditor || current?.status === 'finalized') return
    const newContent = { ...content, ...partial }
    setContent(newContent)
    saveCurrentYear(newContent)
  }

  const readOnly = !isEditor || current?.status === 'finalized'

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-lcdpr-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <LCDPRHeader
        year={year}
        current={current}
        saving={saving}
        saveError={saveError}
        lastSaved={lastSaved}
        finalizeYear={finalizeYear}
        isAdmin={isAdmin}
      />

      <div className="flex-1 flex overflow-hidden p-6">
        <Tabs
          defaultValue="identification"
          className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
            <TabsList className="bg-transparent h-9 p-0 space-x-2">
              <TabsTrigger
                value="identification"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs font-semibold px-4"
              >
                0000/0010/0030 (Identificação)
              </TabsTrigger>
              <TabsTrigger
                value="properties"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs font-semibold px-4"
              >
                0040/0045 (Imóveis e Parceiros)
              </TabsTrigger>
              <TabsTrigger
                value="accounts"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs font-semibold px-4"
              >
                0050 (Contas Bancárias)
              </TabsTrigger>
              <TabsTrigger
                value="q100"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs font-semibold px-4 bg-lcdpr-primary/5 text-lcdpr-primary"
              >
                Q100 (Lançamentos)
              </TabsTrigger>
              <TabsTrigger
                value="q200"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs font-semibold px-4 text-emerald-600"
              >
                Q200 (Resumo Mensal)
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="identification" className="flex-1 overflow-auto p-0 m-0">
            <TabIdentification
              content={content}
              updateContent={updateContent}
              readOnly={readOnly}
            />
          </TabsContent>
          <TabsContent value="properties" className="flex-1 overflow-auto p-0 m-0">
            <TabProperties content={content} updateContent={updateContent} readOnly={readOnly} />
          </TabsContent>
          <TabsContent value="accounts" className="flex-1 overflow-auto p-0 m-0">
            <TabAccounts content={content} updateContent={updateContent} readOnly={readOnly} />
          </TabsContent>
          <TabsContent value="q100" className="flex-1 overflow-auto p-0 m-0">
            <TabQ100 content={content} updateContent={updateContent} readOnly={readOnly} />
          </TabsContent>
          <TabsContent value="q200" className="flex-1 overflow-auto p-0 m-0">
            <TabQ200 content={content} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
