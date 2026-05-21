'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import AttemptItem from './AttemptItem'
import ThemeToggle from '@/components/ThemeToggle'
import EmptyState from '@/components/EmptyState'

interface Attempt {
    id: string
    score: number
    total: number
    userName: string
    createdAt: string
}

type AttemptsResponse = {
    attempts?: Attempt[]
    totalQuestions?: number
    totalAttempts?: number
    averageScore?: string
    averageTotal?: string
}

export default function ResultadosPage() {
    const [attempts, setAttempts] = useState<Attempt[]>([])
    const [totalQuestions, setTotalQuestions] = useState(0)
    const [totalAttempts, setTotalAttempts] = useState(0)
    const [averageScore, setAverageScore] = useState('0')
    const [averageTotal, setAverageTotal] = useState('0')
    const [isLoading, setIsLoading] = useState(true)
    const [isClearingAll, setIsClearingAll] = useState(false)
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [loadError, setLoadError] = useState('')

    const fetchData = async () => {
        setLoadError('')
        try {
            const response = await fetch('/api/attempts')
            if (!response.ok) throw new Error('Falha ao buscar resultados')

            const data = await response.json() as AttemptsResponse
            const safeAttempts = Array.isArray(data.attempts) ? data.attempts : []

            setAttempts(safeAttempts)
            setTotalQuestions(Number(data.totalQuestions) || 0)
            setTotalAttempts(Number(data.totalAttempts) || safeAttempts.length)
            setAverageScore(data.averageScore || '0')
            setAverageTotal(data.averageTotal || '0')
        } catch (error) {
            console.error('Error fetching data:', error)
            setLoadError('Não foi possível carregar o histórico agora.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleClearAll = async () => {
        if (!showClearConfirm) {
            setShowClearConfirm(true)
            return
        }

        setIsClearingAll(true)
        try {
            const adminToken = window.prompt('Digite o token administrativo para limpar todo o histórico:')
            if (!adminToken) {
                setShowClearConfirm(false)
                return
            }

            const response = await fetch('/api/attempts', {
                method: 'DELETE',
                headers: {
                    'x-admin-token': adminToken
                }
            })

            if (!response.ok) throw new Error('Falha ao limpar tentativas')

            setAttempts([])
            setTotalAttempts(0)
            setAverageScore('0')
            setAverageTotal('0')
            setShowClearConfirm(false)
        } catch (error) {
            console.error('Error clearing attempts:', error)
            alert('Não foi possível limpar o histórico.')
        } finally {
            setIsClearingAll(false)
        }
    }

    const averagePercent = Math.round((parseFloat(averageScore) / Math.max(parseFloat(averageTotal), 1)) * 100)

    if (isLoading) {
        return (
            <main className="app-shell app-shell--center">
                <div className="loading-card">Carregando resultados...</div>
            </main>
        )
    }

    return (
        <main className="app-shell">
            <header className="topbar">
                <div>
                    <div className="eyebrow">Histórico</div>
                    <h1 className="page-title">Resultados dos simulados</h1>
                </div>
                <div className="topbar__actions">
                    {attempts.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            disabled={isClearingAll}
                            className={`btn btn-outline btn-compact ${showClearConfirm ? 'btn-warning' : ''}`}
                        >
                            {isClearingAll ? 'Limpando...' : showClearConfirm ? 'Confirmar limpeza' : 'Limpar histórico'}
                        </button>
                    )}
                    <ThemeToggle />
                    <Link href="/" className="btn btn-outline btn-compact">
                        Home
                    </Link>
                </div>
            </header>

            {loadError ? (
                <EmptyState
                    title="Histórico indisponível"
                    description={loadError}
                    actionHref="/"
                    actionLabel="Voltar para a home"
                />
            ) : attempts.length === 0 ? (
                <EmptyState
                    title="Nenhum resultado salvo"
                    description="Finalize um simulado para ver acertos, erros, percentual e revisão das questões."
                    actionHref="/"
                    actionLabel="Iniciar um simulado"
                />
            ) : (
                <>
                    <section className="stats-grid">
                        <div className="stat-card">
                            <span>Total de questões</span>
                            <strong>{totalQuestions}</strong>
                        </div>
                        <div className="stat-card">
                            <span>Tentativas</span>
                            <strong>{totalAttempts}</strong>
                        </div>
                        <div className="stat-card">
                            <span>Média de acertos</span>
                            <strong>{averageScore} / {averageTotal}</strong>
                            <small>{averagePercent}%</small>
                        </div>
                    </section>

                    <section className="results-list">
                        <div className="section-heading">
                            <div>
                                <h2>Simulados realizados</h2>
                                <p>Abra uma tentativa para revisar as respostas e o gabarito.</p>
                            </div>
                        </div>

                        {attempts.map((attempt, index) => (
                            <AttemptItem
                                key={attempt.id}
                                attempt={attempt}
                                index={index}
                                totalAttempts={attempts.length}
                                onDelete={fetchData}
                            />
                        ))}
                    </section>
                </>
            )}
        </main>
    )
}
