'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Attempt } from '@/lib/types'
import { calculatePercentage, formatDate, generateSimuladoId, isPassed } from '@/lib/utils/formatting'

interface AttemptItemProps {
    attempt: Attempt
    index: number
    totalAttempts: number
    onDelete: () => void
}

export default function AttemptItem({ attempt, index, totalAttempts, onDelete }: AttemptItemProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const percentage = calculatePercentage(attempt.score, attempt.total)
    const passed = isPassed(attempt.score, attempt.total)
    const formattedDate = formatDate(attempt.createdAt)
    const simuladoId = generateSimuladoId(attempt, index, totalAttempts)

    const handleDelete = async () => {
        if (!showConfirm) {
            setShowConfirm(true)
            return
        }

        setIsDeleting(true)
        try {
            const adminToken = window.prompt('Digite o token administrativo para apagar este resultado:')
            if (!adminToken) {
                setShowConfirm(false)
                return
            }

            const response = await fetch(`/api/attempts/${attempt.id}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-token': adminToken
                }
            })

            if (!response.ok) throw new Error('Falha ao apagar tentativa')

            onDelete()
        } catch (error) {
            console.error('Error deleting attempt:', error)
            alert('Não foi possível apagar este resultado.')
        } finally {
            setIsDeleting(false)
            setShowConfirm(false)
        }
    }

    return (
        <article className="attempt-item">
            <Link href={`/results/${attempt.id}`} className="attempt-item__main">
                <div className={`score-ring ${passed ? 'score-ring--pass' : 'score-ring--fail'}`}>
                    {percentage}%
                </div>

                <div>
                    <h3>{attempt.userName || 'Anônimo'}</h3>
                    <p>{simuladoId} · {formattedDate}</p>
                </div>
            </Link>

            <div className="attempt-item__meta">
                <strong>{attempt.score}/{attempt.total}</strong>
                <span>{passed ? 'Aprovado' : 'Revisar'}</span>
            </div>

            <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={`btn btn-outline btn-compact ${showConfirm ? 'btn-warning' : ''}`}
            >
                {isDeleting ? '...' : showConfirm ? 'Confirmar' : 'Apagar'}
            </button>
        </article>
    )
}
