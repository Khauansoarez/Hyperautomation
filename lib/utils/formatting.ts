import { Attempt } from '@/lib/types'

// Formatação de data para o padrão brasileiro
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(dateObj.getTime())) return 'Data indisponível'

  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Cálculo de porcentagem
export function calculatePercentage(score: number, total: number): number {
  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) return 0
  return Math.round((score / total) * 100)
}

// Verificação de aprovação (70% é a nota mínima)
export function isPassed(score: number, total: number): boolean {
  return calculatePercentage(score, total) >= 70
}

// Status do quiz baseado no progresso
export function getQuizStatus(answered: number, total: number, completed: boolean): {
  status: string
  color: string
  percentage: number
} {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 60
  const safeAnswered = Math.min(Math.max(Number(answered) || 0, 0), safeTotal)

  if (completed) {
    const percentage = Math.round((safeAnswered / safeTotal) * 100)
    return {
      status: `Concluído (${percentage}%)`,
      color: '#22c55e',
      percentage
    }
  }
  
  if (safeAnswered === 0) {
    return {
      status: 'Não iniciado',
      color: '#6b7280',
      percentage: 0
    }
  }
  
  const percentage = Math.round((safeAnswered / safeTotal) * 100)
  return {
    status: 'Em progresso',
    color: '#f59e0b',
    percentage
  }
}

// Normalização de texto para comparação
export function normalizeText(text: string): string {
  return text
    .replace(/^[A-Z]\.\s*/i, '') // Remove "A. " prefix
    .trim()
    .toUpperCase()
}

// Formatação do nome do usuário
export function formatUserName(userName: string): string {
  return userName.trim() || 'Anônimo'
}

// Geração de identificador único para simulado
export function generateSimuladoId(attempt: Attempt, index: number, totalAttempts: number): string {
  return `Simulado #${totalAttempts - index}`
}
