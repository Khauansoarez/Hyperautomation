'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { submitQuiz } from '@/lib/actions'
import ThemeToggle from '@/components/ThemeToggle'
import QuizTimer from '@/components/QuizTimer'
import QuestionCard from '@/components/quiz/QuestionCard'
import ConfirmModal from '@/components/quiz/ConfirmModal'
import UserNameForm from '@/components/quiz/UserNameForm'
import EmptyState from '@/components/EmptyState'
import type { QuizQuestion } from '@/lib/types'
import { getSimuladoInfo } from '@/lib/simulados'
import type { SimuladoType } from '@/lib/simulados'
import { readSimuladoProgress, writeSimuladoProgress } from '@/lib/utils/storage'

interface QuizRunnerProps {
    questions: QuizQuestion[]
    simuladoType: SimuladoType
}

interface QuestionMapProps {
    questions: QuizQuestion[]
    currentIndex: number
    answers: Record<string, string[]>
    reviewedQuestionIds: Set<string>
    isTransitioning: boolean
    onQuestionSelect: (index: number) => void
}

function QuestionMap({
    questions,
    currentIndex,
    answers,
    reviewedQuestionIds,
    isTransitioning,
    onQuestionSelect
}: QuestionMapProps) {
    return (
        <section className="question-map" aria-label="Navegação direta entre questões">
            <div className="question-map__header">
                <div>
                    <strong>Navegação</strong>
                    <span>{questions.length} questões</span>
                </div>
            </div>

            <div className="question-map__grid">
                {questions.map((question, index) => {
                    const isCurrent = index === currentIndex
                    const isAnswered = Boolean(answers[question.id]?.length)
                    const isMarkedForReview = reviewedQuestionIds.has(question.id)
                    const stateClass = isCurrent
                        ? 'question-map__item--current'
                        : isAnswered
                            ? 'question-map__item--answered'
                            : 'question-map__item--empty'
                    const reviewClass = isMarkedForReview ? 'question-map__item--review' : ''

                    return (
                        <button
                            key={question.id}
                            type="button"
                            className={`question-map__item ${stateClass} ${reviewClass}`}
                            onClick={() => onQuestionSelect(index)}
                            disabled={isTransitioning}
                            aria-current={isCurrent ? 'step' : undefined}
                            aria-label={`Ir para questão ${index + 1}${isAnswered ? ', respondida' : ', não respondida'}${isMarkedForReview ? ', marcada para revisão' : ''}`}
                        >
                            {index + 1}
                        </button>
                    )
                })}
            </div>

            <div className="question-map__legend" aria-hidden="true">
                <span><i className="legend-dot legend-dot--current" />Atual</span>
                <span><i className="legend-dot legend-dot--answered" />Respondida</span>
                <span><i className="legend-dot legend-dot--review" />Revisar</span>
                <span><i className="legend-dot legend-dot--empty" />Pendente</span>
            </div>
        </section>
    )
}

export default function QuizRunner({ questions, simuladoType }: QuizRunnerProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string[]>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [userName, setUserName] = useState('')
    const [nameSubmitted, setNameSubmitted] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [reviewedQuestionIds, setReviewedQuestionIds] = useState<Set<string>>(new Set())
    const router = useRouter()

    const simulado = getSimuladoInfo(simuladoType)
    const safeQuestions = useMemo(
        () => questions.filter((question) => question.content?.trim() && question.options.length >= 2),
        [questions]
    )
    const total = safeQuestions.length
    const currentQuestion = safeQuestions[currentIndex]
    const answeredCount = Object.keys(answers).length
    const progressPercent = total > 0 ? Math.round((answeredCount / total) * 100) : 0
    const selectedLetters = currentQuestion ? answers[currentQuestion.id] || [] : []
    const reviewedCount = reviewedQuestionIds.size
    const currentQuestionMarkedForReview = currentQuestion ? reviewedQuestionIds.has(currentQuestion.id) : false

    const saveProgress = useCallback((completed = false, answered = answeredCount) => {
        const progressData = readSimuladoProgress()

        writeSimuladoProgress({
            ...progressData,
            [simuladoType]: {
                answered,
                total,
                completed
            }
        })
    }, [answeredCount, simuladoType, total])

    useEffect(() => {
        if (nameSubmitted && total > 0) {
            saveProgress(false, Object.keys(answers).length)
        }
    }, [answers, nameSubmitted, saveProgress, total])

    const handleSelect = (optionIndex: number) => {
        if (!currentQuestion || optionIndex < 0 || optionIndex >= currentQuestion.options.length) return

        const letter = String.fromCharCode(65 + optionIndex)

        setAnswers(prev => {
            const current = prev[currentQuestion.id] || []
            const newSelection = currentQuestion.multiSelect
                ? current.includes(letter)
                    ? current.filter(l => l !== letter)
                    : [...current, letter]
                : [letter]

            return {
                ...prev,
                [currentQuestion.id]: newSelection
            }
        })
    }

    const handleToggleReview = () => {
        if (!currentQuestion) return

        setReviewedQuestionIds(prev => {
            const next = new Set(prev)
            if (next.has(currentQuestion.id)) {
                next.delete(currentQuestion.id)
            } else {
                next.add(currentQuestion.id)
            }
            return next
        })
    }

    const handleNext = () => {
        if (currentIndex < total - 1 && !isTransitioning) {
            setIsTransitioning(true)
            window.setTimeout(() => {
                setCurrentIndex(prev => Math.min(prev + 1, total - 1))
                setIsTransitioning(false)
            }, 120)
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0 && !isTransitioning) {
            setIsTransitioning(true)
            window.setTimeout(() => {
                setCurrentIndex(prev => Math.max(prev - 1, 0))
                setIsTransitioning(false)
            }, 120)
        }
    }

    const handleQuestionSelect = (index: number) => {
        if (index === currentIndex || index < 0 || index >= total || isTransitioning) return

        setIsTransitioning(true)
        window.setTimeout(() => {
            setCurrentIndex(index)
            setIsTransitioning(false)
        }, 80)
    }

    const handleSubmit = async () => {
        if (isSubmitting || total === 0) return

        setIsSubmitting(true)
        setShowConfirmModal(false)
        try {
            const selectedOptionsByQuestion = Object.fromEntries(
                Object.entries(answers).map(([questionId, letters]) => {
                    const question = safeQuestions.find(q => q.id === questionId)
                    const selectedOptions = question
                        ? letters
                            .map((letter) => question.options[letter.charCodeAt(0) - 65])
                            .filter(Boolean)
                        : []

                    return [questionId, selectedOptions]
                })
            )

            const attemptId = await submitQuiz(
                selectedOptionsByQuestion,
                safeQuestions.map(q => q.id),
                userName || 'Anônimo'
            )
            saveProgress(true, total)
            router.push(`/results/${attemptId}`)
        } catch (e) {
            console.error(e)
            alert('Erro ao enviar simulado. Tente novamente em instantes.')
            setIsSubmitting(false)
        }
    }

    const handleFinishClick = () => {
        if (isSubmitting || isTransitioning) return

        if (answeredCount < total || reviewedCount > 0) {
            setShowConfirmModal(true)
            return
        }

        handleSubmit()
    }

    if (total === 0) {
        return (
            <main className="app-shell app-shell--center">
                <EmptyState
                    title="Nenhuma questão válida"
                    description="Este simulado não tem questões suficientes para iniciar uma tentativa."
                    actionHref="/"
                    actionLabel="Voltar para a home"
                />
            </main>
        )
    }

    if (!nameSubmitted) {
        return (
            <main className="app-shell app-shell--center">
                <header className="topbar topbar--floating">
                    <Link href="/" className="brand" aria-label="Voltar para a home">
                        <Image src="/zello-logo-removebg-preview.png" alt="Zello" width={112} height={40} className="brand__logo" />
                        <span>{simulado.title}</span>
                    </Link>
                    <ThemeToggle />
                </header>
                <UserNameForm onSubmit={(name) => {
                    setUserName(name)
                    setNameSubmitted(true)
                }} />
            </main>
        )
    }

    return (
        <main className="quiz-shell">
            <header className="quiz-header">
                <Link href="/" className="btn btn-outline btn-compact">
                    Voltar
                </Link>
                <div className="quiz-title">
                    <span>{simulado.title}</span>
                    <small>Questão {currentIndex + 1} de {total}</small>
                </div>
                <div className="quiz-header__actions">
                    <ThemeToggle />
                    <QuizTimer
                        isRunning={!isSubmitting}
                        totalSeconds={simulado.durationMinutes * 60}
                        onTimeUp={handleSubmit}
                    />
                </div>

                <div className="quiz-header__status" aria-label="Status da prova">
                    <div>
                        <span>Respondidas</span>
                        <strong>{answeredCount}/{total}</strong>
                    </div>
                    <div>
                        <span>Conclusão</span>
                        <strong>{progressPercent}%</strong>
                    </div>
                    <div>
                        <span>Para revisar</span>
                        <strong>{reviewedCount}</strong>
                    </div>
                    <div className="quiz-header__progress">
                        <span>Progresso</span>
                        <div className="progress-track" aria-hidden="true">
                            <span style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="quiz-layout">
                <aside className="quiz-sidebar">
                    <QuestionMap
                        questions={safeQuestions}
                        currentIndex={currentIndex}
                        answers={answers}
                        reviewedQuestionIds={reviewedQuestionIds}
                        isTransitioning={isTransitioning}
                        onQuestionSelect={handleQuestionSelect}
                    />
                </aside>

                <div className="quiz-main">
                    <QuestionCard
                        question={currentQuestion}
                        questionNumber={currentIndex + 1}
                        totalQuestions={total}
                        selectedLetters={selectedLetters}
                        isMarkedForReview={currentQuestionMarkedForReview}
                        onOptionSelect={handleSelect}
                        onToggleReview={handleToggleReview}
                    />

                    <nav className="quiz-navigation" aria-label="Navegação entre questões">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0 || isTransitioning}
                            className="btn btn-outline"
                        >
                            Anterior
                        </button>

                        <span>{currentIndex + 1} / {total}</span>

                        <button
                            onClick={handleNext}
                            disabled={currentIndex === total - 1 || isTransitioning}
                            className="btn btn-primary"
                        >
                            Próxima
                        </button>
                    </nav>

                    <div className="finish-panel">
                        <button
                            onClick={handleFinishClick}
                            disabled={isTransitioning || isSubmitting}
                            className="btn btn-danger"
                        >
                            {isSubmitting ? 'Enviando...' : 'Finalizar simulado'}
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleSubmit}
                title="Finalizar simulado?"
                message={
                    answeredCount < total && reviewedCount > 0
                        ? `Ainda há ${total - answeredCount} questão(ões) sem resposta e ${reviewedCount} marcada(s) para revisão. Você pode finalizar agora ou continuar revisando.`
                        : answeredCount < total
                            ? `Ainda há ${total - answeredCount} questão(ões) sem resposta. Você pode finalizar agora ou continuar revisando.`
                            : `Você marcou ${reviewedCount} questão(ões) para revisão. Finalizar mesmo assim?`
                }
                confirmText="Finalizar"
                cancelText="Continuar"
                isLoading={isSubmitting}
            />

            {isSubmitting && (
                <div className="loading-overlay">
                    <div className="loading-card">Enviando simulado...</div>
                </div>
            )}
        </main>
    )
}
