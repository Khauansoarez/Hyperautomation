import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ResultsContent from './ResultsContent'

export const dynamic = 'force-dynamic'

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const attempt = await prisma.attempt.findUnique({
        where: { id },
        include: {
            answers: {
                include: {
                    question: true
                }
            }
        }
    })

    if (!attempt) {
        notFound()
    }

    return <ResultsContent attempt={attempt} />
}
