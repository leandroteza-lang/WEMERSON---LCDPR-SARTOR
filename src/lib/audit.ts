export type AuditIssue = {
  lineId: number
  reg: string
  message: string
  severity: 'high' | 'medium' | 'low'
}

export type AuditResult = {
  score: number
  issues: AuditIssue[]
}

export function audit(rows: any[]): AuditResult {
  const issues: AuditIssue[] = []

  if (!rows || rows.length === 0) {
    return {
      score: 0,
      issues: [{ lineId: 0, reg: 'Geral', message: 'Nenhum dado encontrado', severity: 'high' }],
    }
  }

  let totalQ100 = 0
  let validQ100 = 0

  rows.forEach((row) => {
    if (row.reg === 'Q100') {
      totalQ100++
      let valid = true

      // Basic checks for Q100
      const date = row.parts[1]
      const account = row.parts[2]
      const value = parseFloat(row.parts[7])

      if (!date) {
        issues.push({ lineId: row.id, reg: 'Q100', message: 'Data ausente', severity: 'high' })
        valid = false
      }
      if (!account) {
        issues.push({ lineId: row.id, reg: 'Q100', message: 'Conta ausente', severity: 'high' })
        valid = false
      }
      if (isNaN(value) || value <= 0) {
        issues.push({ lineId: row.id, reg: 'Q100', message: 'Valor inválido', severity: 'high' })
        valid = false
      }

      if (valid) validQ100++
    }
  })

  let score = 100
  if (totalQ100 > 0) {
    score = Math.round((validQ100 / totalQ100) * 100)
  } else if (issues.length > 0) {
    score = 0
  }

  return { score, issues }
}
