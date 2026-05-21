'use client'

import { Flag } from 'lucide-react'
import type { QuizQuestion } from '@/lib/types'

interface QuestionCardProps {
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  selectedLetters: string[]
  isMarkedForReview: boolean
  onOptionSelect: (optionIndex: number) => void
  onToggleReview: () => void
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedLetters,
  isMarkedForReview,
  onOptionSelect,
  onToggleReview
}: QuestionCardProps) {
  const options = Array.isArray(question.options) ? question.options : []

  return (
    <article className="question-card">
      <div className="question-card__header">
        <div>
          <span className="eyebrow">Questão {questionNumber} de {totalQuestions}</span>
          <strong>Leia o enunciado e selecione a melhor alternativa.</strong>
        </div>
        <div className="question-card__actions">
          {question.multiSelect && (
            <span className="info-pill">Múltiplas respostas</span>
          )}
          <button
            type="button"
            onClick={onToggleReview}
            className={`review-toggle ${isMarkedForReview ? 'review-toggle--active' : ''}`}
            aria-pressed={isMarkedForReview}
            title={isMarkedForReview ? 'Remover marcação de revisão' : 'Marcar questão para revisar'}
          >
            <Flag size={16} aria-hidden="true" />
            <span>{isMarkedForReview ? 'Revisar marcada' : 'Revisar depois'}</span>
          </button>
        </div>
      </div>

      <div className="question-card__prompt">
        <h2>{question.content || 'Questão sem enunciado disponível.'}</h2>
      </div>

      <div className="option-list" role="group" aria-label="Alternativas">
        {options.map((option, index) => {
          const letter = String.fromCharCode(65 + index)
          const isSelected = selectedLetters.includes(letter)

          return (
            <button
              key={`${question.id}-${letter}`}
              type="button"
              onClick={() => onOptionSelect(index)}
              className={`option-card ${isSelected ? 'option-card--selected' : ''}`}
              aria-pressed={isSelected}
              aria-label={`Alternativa ${letter}: ${option.replace(/^[A-Z][.)]\s*/i, '')}`}
            >
              <span className="option-card__letter">{letter}</span>
              <span className="option-card__text">
                {option.replace(/^[A-Z][.)]\s*/i, '')}
              </span>
              <span className="option-card__state" aria-hidden="true">
                {isSelected ? 'Selecionada' : 'Selecionar'}
              </span>
            </button>
          )
        })}
      </div>
    </article>
  )
}
