export interface LCDPRIdentification {
  name: string
  tax_id: string
  start_date: string
  end_date: string
  tax_type: string
  address: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zip: string
  }
}

export interface LCDPRPartner {
  id: string
  name: string
  tax_id: string
  percentage: number
}

export interface LCDPRProperty {
  id: string
  name: string
  cafir: string
  incra: string
  registration: string
  ownership: string
  partners: LCDPRPartner[]
}

export interface LCDPRAccount {
  id: string
  bank: string
  agency: string
  account: string
}

export interface LCDPRQ100 {
  id: string
  date: string
  property_id: string
  account_id: string
  doc_num: string
  doc_type: string
  history: string
  value: number
  entry_type: 'entry' | 'exit'
}

export interface LCDPRContent {
  identification: LCDPRIdentification
  properties: LCDPRProperty[]
  accounts: LCDPRAccount[]
  q100: LCDPRQ100[]
}
