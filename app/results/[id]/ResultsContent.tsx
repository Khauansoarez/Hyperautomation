'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

    const getLetter = (i: number) => String.fromCharCode(65 + i)
    const normalizeOptionText = (text: string) => text.replace(/^[A-Z]\.\s*/i, '').trim()

    return (
        <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>

            {/* Header */}
            <header className="results-header" style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <Link href="/" aria-label="Voltar para a página inicial do simulado" style={{ display: 'inline-flex' }}>
                        <Image
                            src="/zello-logo-removebg-preview.png"
                            alt="Zello"
                            width={112}
                            height={40}
                            style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
                        />
                    </Link>
                    <ThemeToggle />
                </div>
                <div style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                }}>
                    Resultado do Simulado
                </div>
                <Image
                    src="/fabrica-removebg-preview.png"
                    alt="Fábrica"
                    width={180}
                    height={120}
                    style={{ height: '120px', width: 'auto' }}
                />
            </header>

            <div style={{
                width: '100%',
                maxWidth: '800px',
                margin: '0 auto',
                padding: '40px 20px 100px'
            }}>

                {/* User + date */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <p style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        marginBottom: '4px'
                    }}>
                        {attempt.userName}
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {new Date(attempt.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>

                {/* Score Card */}
                <div style={{
                    border: `3px solid ${passed ? 'var(--success)' : 'var(--error)'}`,
                    borderRadius: '12px',
                    padding: '40px',
                    backgroundColor: passed ? 'var(--success-bg)' : 'var(--error-bg)',
                    textAlign: 'center',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        fontSize: '64px',
                        fontWeight: 700,
                        color: passed ? 'var(--success)' : 'var(--error)',
                        marginBottom: '8px',
                        lineHeight: 1
                    }}>
                        {percentage}%
                    </div>
                    <div style={{
                        fontSize: 'var(--font-size-lg)',
                        color: 'var(--text-secondary)',
                        marginBottom: '20px'
                    }}>
                        {correctAnswers} de {totalQuestions} questões corretas
                    </div>
                    <div style={{
                        display: 'inline-block',
                        padding: '8px 24px',
                        borderRadius: '20px',
                        backgroundColor: passed ? 'var(--success)' : 'var(--error)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 700,
                        letterSpacing: '0.04em'
                    }}>
                        {passed ? '✓ Aprovado' : '✗ Reprovado'}
                    </div>
                </div>

                {/* Questions Review */}
                <h2 style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 600,
                    marginBottom: '20px',
                    color: 'var(--text-primary)'
                }}>
                    Revisão das Questões
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                    {attempt.answers.map((answer, idx) => {
                        const isCorrect = answer.isCorrect
                        const selectedOptions = answer.selected
                            .split('\n')
                            .map(normalizeOptionText)
                            .filter(Boolean)

                        return (
                            <div
                                key={answer.id}
                                className="card"
                                style={{
                                    borderColor: isCorrect ? 'var(--success)' : 'var(--error)',
                                    padding: '20px'
                                }}
                            >
                                {/* Question header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px'
                                }}>
                                    <span style={{
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        Questão {idx + 1}
                                    </span>
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: isCorrect ? 'var(--success)' : 'var(--error)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {isCorrect ? '✓ Correta' : '✗ Incorreta'}
                                    </span>
                                </div>

                                {/* Question text */}
                                <div style={{
                                    fontSize: 'var(--font-size-base)',
                                    lineHeight: '1.65',
                                    color: 'var(--text-primary)',
                                    marginBottom: '16px',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {answer.question.content}
                                </div>

                                {/* Options */}
                                <div className="alternatives-container" style={{ marginBottom: '14px' }}>
                                    {answer.question.options.map((opt, optIdx) => {
                                        const letter = getLetter(optIdx)
                                        const optionText = normalizeOptionText(opt)
                                        const isSelected = selectedOptions.includes(optionText)
                                        const isCorrectAnswer = answer.question.correctAnswer?.includes(letter)

                                        let cardClass = 'alternative-card'
                                        if (isCorrectAnswer) cardClass += ' correct'
                                        else if (isSelected && !isCorrect) cardClass += ' incorrect'
                                        else cardClass += ' disabled'

                                        return (
                                            <div key={optIdx} className={cardClass} style={{ cursor: 'default' }}>
                                                <div className={`alternative-letter ${isCorrectAnswer ? '' : isSelected ? '' : 'neutral'}`}>
                                                    {isCorrectAnswer ? '✓' : isSelected && !isCorrect ? '✗' : letter}
                                                </div>
                                                <div className="alternative-text">
                                                    {optionText}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Explanation toggle */}
                                {answer.question.explanation && (
                                    <button
                                        onClick={() => toggleExplanation(answer.id)}
                                        className="btn btn-outline"
                                        style={{
                                            fontSize: '13px',
                                            padding: '8px 14px',
                                            minHeight: 'unset',
                                            borderColor: isCorrect ? 'var(--success)' : 'var(--error)',
                                            color: isCorrect ? 'var(--success)' : 'var(--error)',
                                            marginBottom: expandedExplanations.has(answer.id) ? '12px' : '0'
                                        }}
                                    >
                                        {expandedExplanations.has(answer.id) ? '▼' : '▶'}
                                        &nbsp;{isCorrect ? 'Ver Explicação' : 'Por que errei?'}
                                    </button>
                                )}

                                {/* Explanation body */}
                                {answer.question.explanation && expandedExplanations.has(answer.id) && (
                                    <div className="animate-slideUp" style={{
                                        padding: '14px 16px',
                                        backgroundColor: isCorrect ? 'var(--success-bg)' : 'var(--error-bg)',
                                        border: `1px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}`,
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            color: isCorrect ? 'var(--success)' : 'var(--error)',
                                            marginBottom: '8px'
                                        }}>
                                            {isCorrect ? 'Explicação' : 'Explicação (por que errou)'}
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            lineHeight: '1.6',
                                            color: 'var(--text-primary)',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {answer.question.explanation}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <Link href={simuladoType ? `/quiz?type=${simuladoType}` : '/quiz'} className="btn btn-primary" style={{ textAlign: 'center', justifyContent: 'center' }}>
                        Novo Simulado
                    </Link>
                    <Link href="/resultados" className="btn btn-outline" style={{ textAlign: 'center', justifyContent: 'center' }}>
                        Ver Histórico
                    </Link>
                    <Link href="/" className="btn btn-outline" style={{ textAlign: 'center', justifyContent: 'center' }}>
                        Página Inicial
                    </Link>
                </div>
            </div>
        </div>
    )
}
