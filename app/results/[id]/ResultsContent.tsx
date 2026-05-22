'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, ChevronRight, History, Home, RotateCcw, X } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import type { Prisma } from '@prisma/client'
import { calculatePercentage, isPassed } from '@/lib/utils/formatting'

type ResultAttempt = Prisma.AttemptGetPayload<{
    include: {
        answers: {
            include: {
                question: true
            }
        }
    }
}>

interface ResultsContentProps {
    attempt: ResultAttempt
}

export default function ResultsContent({ attempt }: ResultsContentProps) {
    const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(new Set())

    const toggleExplanation = (answerId: string) => {
        setExpandedExplanations(prev => {
            const newSet = new Set(prev)
            if (newSet.has(answerId)) {
                newSet.delete(answerId)
            } else {
                newSet.add(answerId)
            }
            return newSet
        })
    }

    const totalQuestions = attempt.total
    const correctAnswers = attempt.score
    const percentage = calculatePercentage(correctAnswers, totalQuestions)
    const passed = isPassed(correctAnswers, totalQuestions)
    const simuladoType = attempt.answers[0]?.question.simuladoType
    const incorrectAnswers = Math.max(totalQuestions - correctAnswers, 0)

    const getLetter = (i: number) => String.fromCharCode(65 + i)
    const normalizeOptionText = (text: string) => text.replace(/^[A-Z]\.\s*/i, '').trim()

    return (
        <main className="quiz-shell results-shell">
            <header className="quiz-header">
                <Link href={simuladoType ? `/quiz?type=${simuladoType}` : '/quiz'} className="btn btn-outline btn-compact">
                    Voltar
                </Link>

                <div className="quiz-title">
                    <span>Resultado do Simulado</span>
                    <small>{attempt.userName}</small>
                </div>

                <div className="quiz-header__actions">
                    <ThemeToggle />
                </div>

                <div className="quiz-header__status" aria-label="Resumo do resultado">
                    <div>
                        <span>Acertos</span>
                        <strong>{correctAnswers}/{totalQuestions}</strong>
                    </div>
                    <div>
                        <span>Resultado</span>
                        <strong>{percentage}%</strong>
                    </div>
                    <div>
                        <span>Status</span>
                        <strong className={passed ? 'status-pass' : 'status-fail'}>{passed ? 'Aprovado' : 'Reprovado'}</strong>
                    </div>
                    <div className="quiz-header__progress">
                        <span>Desempenho</span>
                        <div className={`progress-track ${passed ? 'progress-track--pass' : 'progress-track--fail'}`} aria-hidden="true">
                            <span style={{ width: `${percentage}%` }} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="quiz-layout results-layout">
                <aside className="quiz-sidebar results-sidebar">
                    <section className={`result-summary ${passed ? 'result-summary--pass' : 'result-summary--fail'}`}>
                        <span>Nota final</span>
                        <strong>{percentage}%</strong>
                        <p>{correctAnswers} de {totalQuestions} questões corretas</p>
                        <div className="result-summary__badge">
                            {passed ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
                            {passed ? 'Aprovado' : 'Reprovado'}
                        </div>
                    </section>

                    <section className="result-meta">
                        <span>Participante</span>
                        <strong>{attempt.userName}</strong>
                        <p>
                            {new Date(attempt.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </section>

                    <section className="result-breakdown" aria-label="Distribuição do resultado">
                        <div>
                            <span>Corretas</span>
                            <strong className="status-pass">{correctAnswers}</strong>
                        </div>
                        <div>
                            <span>Incorretas</span>
                            <strong className="status-fail">{incorrectAnswers}</strong>
                        </div>
                    </section>
                </aside>

                <div className="quiz-main results-main">
                    <section className="question-card result-overview">
                        <div className="question-card__header">
                            <div>
                                <span className="eyebrow">Resultado final</span>
                                <strong>Confira sua pontuação e revise as respostas.</strong>
                            </div>
                            <div className={`result-status-pill ${passed ? 'result-status-pill--pass' : 'result-status-pill--fail'}`}>
                                {passed ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
                                {passed ? 'Aprovado' : 'Reprovado'}
                            </div>
                        </div>

                        <div className="question-card__prompt result-overview__prompt">
                            <h2>{percentage}% de aproveitamento</h2>
                            <p>{correctAnswers} acerto(s), {incorrectAnswers} erro(s), {totalQuestions} questão(ões) no total.</p>
                        </div>
                    </section>

                    <div className="results-section-title">
                        <span className="eyebrow">Revisão</span>
                        <h2>Questões do simulado</h2>
                    </div>

                    <div className="results-review-list">
                    {attempt.answers.map((answer, idx) => {
                        const isCorrect = answer.isCorrect
                        const selectedOptions = answer.selected
                            .split('\n')
                            .map(normalizeOptionText)
                            .filter(Boolean)

                        return (
                            <div
                                key={answer.id}
                                className={`question-card result-question-card ${isCorrect ? 'result-question-card--correct' : 'result-question-card--incorrect'}`}
                            >
                                <div className="question-card__header">
                                    <div>
                                        <span className="eyebrow">Questão {idx + 1} de {totalQuestions}</span>
                                        <strong>{isCorrect ? 'Resposta correta' : 'Resposta incorreta'}</strong>
                                    </div>
                                    <span className={`result-status-pill ${isCorrect ? 'result-status-pill--pass' : 'result-status-pill--fail'}`}>
                                        {isCorrect ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
                                        {isCorrect ? 'Correta' : 'Incorreta'}
                                    </span>
                                </div>

                                <div className="question-card__prompt">
                                    <h2>{answer.question.content}</h2>
                                </div>

                                <div className="option-list result-option-list" role="group" aria-label={`Alternativas da questão ${idx + 1}`}>
                                    {answer.question.options.map((opt, optIdx) => {
                                        const letter = getLetter(optIdx)
                                        const optionText = normalizeOptionText(opt)
                                        const isSelected = selectedOptions.includes(optionText)
                                        const isCorrectAnswer = answer.question.correctAnswer?.includes(letter)

                                        const stateClass = isCorrectAnswer
                                            ? 'option-card--correct'
                                            : isSelected && !isCorrect
                                                ? 'option-card--incorrect'
                                                : 'option-card--muted'
                                        const stateLabel = isCorrectAnswer
                                            ? 'Resposta correta'
                                            : isSelected
                                                ? 'Sua escolha'
                                                : 'Não selecionada'

                                        return (
                                            <div key={optIdx} className={`option-card result-option-card ${stateClass}`}>
                                                <span className="option-card__letter">
                                                    {isCorrectAnswer ? <Check size={17} aria-hidden="true" /> : isSelected && !isCorrect ? <X size={17} aria-hidden="true" /> : letter}
                                                </span>
                                                <span className="option-card__text">{optionText}</span>
                                                <span className="option-card__state">{stateLabel}</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                {answer.question.explanation && (
                                    <button
                                        onClick={() => toggleExplanation(answer.id)}
                                        className="btn btn-outline"
                                        style={{ marginTop: '16px' }}
                                    >
                                        {expandedExplanations.has(answer.id) ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
                                        {isCorrect ? 'Ver explicação' : 'Por que errei?'}
                                    </button>
                                )}

                                {answer.question.explanation && expandedExplanations.has(answer.id) && (
                                    <div className="result-explanation animate-slideUp">
                                        <strong>{isCorrect ? 'Explicação' : 'Explicação da resposta'}</strong>
                                        <p>{answer.question.explanation}</p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    </div>

                    <nav className="finish-panel results-actions" aria-label="Ações do resultado">
                    <Link href={simuladoType ? `/quiz?type=${simuladoType}` : '/quiz'} className="btn btn-primary">
                        <RotateCcw size={18} aria-hidden="true" />
                        Novo Simulado
                    </Link>
                    <Link href="/resultados" className="btn btn-outline">
                        <History size={18} aria-hidden="true" />
                        Ver Histórico
                    </Link>
                    <Link href="/" className="btn btn-outline">
                        <Home size={18} aria-hidden="true" />
                        Página Inicial
                    </Link>
                    </nav>
                </div>
            </div>
        </main>
    )
}
