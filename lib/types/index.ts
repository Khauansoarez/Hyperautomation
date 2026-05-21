import type { SimuladoType } from '@/lib/simulados'

// Tipos centralizados do sistema de simulados

export interface Question {
  id: string
  content: string
  options: string[]
  correctAnswer: string
  explanation?: string | null
  simuladoType?: SimuladoType
  createdAt?: Date
}

export interface QuizQuestion {
  id: string
  content: string
  options: string[]
  explanation?: string | null
  simuladoType?: SimuladoType
  multiSelect: boolean
}

export interface Answer {
  id: string
  attemptId: string
  questionId: string
  selected: string
  isCorrect: boolean
  question?: Question
}

export interface Attempt {
  id: string
  score: number
  total: number
  userName: string
  createdAt: Date | string
  answers?: Answer[]
}

export interface QuizState {
  currentIndex: number
  answers: Record<string, string[]>
  isSubmitting: boolean
  userName: string
  nameSubmitted: boolean
  showConfirmModal: boolean
  isTransitioning: boolean
  transitionDirection: 'next' | 'prev'
}

export interface SimuladoProgress {
  [key: string]: {
    answered: number
    total: number
    completed: boolean
  }
}

export interface SimuladoInfo {
  id: SimuladoType
  title: string
  description: string
  questionCount: number
  durationMinutes: number
  accent: string
}

export type QuizStatus = 'Não iniciado' | 'Em progresso' | 'Concluído'
export type Theme = 'light' | 'dark'
