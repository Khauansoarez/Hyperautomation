import { Question } from '@/lib/types'

// Validação de resposta correta
export function validateAnswer(
  selectedLetters: string[],
  correctAnswer: string
): boolean {
  const correctLetters = correctAnswer
    .split(',')
    .map(l => l.trim().toUpperCase().replace(/[^A-Z]/g, ''))
    .filter(l => l)

  const selectedSet = new Set(
    selectedLetters
      .map(l => l.trim().toUpperCase().replace(/[^A-Z]/g, ''))
      .filter(l => l)
  )
  const correctSet = new Set(correctLetters)

  return correctSet.size > 0 &&
    correctSet.size === selectedSet.size &&
    [...correctSet].every(letter => selectedSet.has(letter))
}

export function validateSelectedOptions(
  selectedOptions: string[],
  options: string[],
  correctAnswer: string
): boolean {
  const correctOptions = correctAnswer
    .split(',')
    .map(letter => letter.trim().toUpperCase().replace(/[^A-Z]/g, ''))
    .filter(Boolean)
    .map(letter => {
      const index = letter.charCodeAt(0) - 65
      return options[index]
    })
    .filter(Boolean)
    .map(normalizeOptionText)

  const selectedSet = new Set(selectedOptions.map(normalizeOptionText).filter(Boolean))
  const correctSet = new Set(correctOptions)

  return correctSet.size > 0 &&
    correctSet.size === selectedSet.size &&
    [...correctSet].every(option => selectedSet.has(option))
}

// Verifica se é múltipla escolha
export function isMultiSelect(correctAnswer: string): boolean {
  return correctAnswer.includes(',')
}

// Normalização de resposta para comparação
export function normalizeAnswer(answer: string): string {
  return answer.trim()
    .replace(/[.]+/g, '')
    .replace(/\s+/g, '')
    .toUpperCase()
}

export function normalizeOptionText(option: string): string {
  return option
    .replace(/^[A-Z][.)]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

// Validação de dados do simulado
export function validateSimuladoData(questions: Question[]): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!questions || questions.length === 0) {
    errors.push('Nenhuma questão encontrada')
    return { isValid: false, errors }
  }

  questions.forEach((question, index) => {
    if (!question.content?.trim()) {
      errors.push(`Questão ${index + 1}: Conteúdo vazio`)
    }

    if (!question.options || question.options.length < 2) {
      errors.push(`Questão ${index + 1}: Pelo menos 2 opções são necessárias`)
    }

    if (!question.correctAnswer?.trim()) {
      errors.push(`Questão ${index + 1}: Resposta correta não definida`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}
