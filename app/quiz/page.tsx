import { prisma } from '@/lib/prisma'
import QuizRunner from './QuizRunner'
import { SimuladoType as PrismaSimuladoType } from '@prisma/client'
import { unstable_noStore as noStore } from 'next/cache'
import EmptyState from '@/components/EmptyState'
import { getSimuladoInfo, parseSimuladoType } from '@/lib/simulados'
import type { SimuladoType } from '@/lib/simulados'
import type { QuizQuestion } from '@/lib/types'

export const dynamic = 'force-dynamic'

const PRISMA_TYPE_BY_SIMULADO: Record<SimuladoType, PrismaSimuladoType> = {
    v1: PrismaSimuladoType.v1,
    v2: PrismaSimuladoType.v2,
    v3: PrismaSimuladoType.v3,
    v4: PrismaSimuladoType.v4,
    v5: PrismaSimuladoType.v5
}

function shuffle<T>(items: T[]) {
    const next = [...items]
    for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[next[i], next[j]] = [next[j], next[i]]
    }
    return next
}

function toQuizQuestion(question: {
    id: string
    content: string
    options: string[]
    correctAnswer: string
    explanation: string | null
}): QuizQuestion | null {
    if (!question.content?.trim()) return null
    if (!Array.isArray(question.options) || question.options.length < 2) return null

    const options = question.options.filter((option) => option?.trim())
    if (options.length < 2) return null

    return {
        id: question.id,
        content: question.content,
        options: shuffle(options),
        explanation: question.explanation || undefined,
        multiSelect: question.correctAnswer.includes(',')
    }
}

export default async function QuizPage({
    searchParams
}: {
    searchParams: Promise<{ type?: string }>
}) {
    noStore()

    const { type } = await searchParams
    const simuladoType = parseSimuladoType(type)

    if (!simuladoType) {
        return (
            <main className="app-shell app-shell--center">
                <EmptyState
                    title="Simulado não encontrado"
                    description="Escolha uma versão válida do simulado para iniciar a prova."
                    actionHref="/"
                    actionLabel="Escolher simulado"
                />
            </main>
        )
    }

    const questions = await prisma.question.findMany({
        where: {
            simuladoType: PRISMA_TYPE_BY_SIMULADO[simuladoType]
        },
        take: 60
    })

    const quizQuestions = shuffle(questions)
        .map(toQuizQuestion)
        .filter((question): question is QuizQuestion => Boolean(question))

    if (quizQuestions.length === 0) {
        const simulado = getSimuladoInfo(simuladoType)

        return (
            <main className="app-shell app-shell--center">
                <EmptyState
                    title={`${simulado.title} sem questões disponíveis`}
                    description="Não encontrei questões válidas para esta versão. Rode o seed ou selecione outro simulado."
                    actionHref="/"
                    actionLabel="Voltar para a home"
                />
            </main>
        )
    }

    return <QuizRunner questions={quizQuestions} simuladoType={simuladoType} />
}
