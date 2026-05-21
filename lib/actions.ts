'use server'

import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'
import { validateSelectedOptions } from './utils/validation'

export async function submitQuiz(answers: Record<string, string[]>, questionIds: string[], userName: string = 'Anônimo') {
    const questions = await prisma.question.findMany({
        where: { id: { in: questionIds } },
        orderBy: { createdAt: 'asc' }
    })

    let score = 0
    const total = questions.length

    const answersData = questions.map((q) => {
        const selectedOptions = answers[q.id] || []
        const isCorrect = validateSelectedOptions(selectedOptions, q.options, q.correctAnswer)

        if (isCorrect) score++

        return {
            questionId: q.id,
            selected: selectedOptions.join('\n'),
            isCorrect
        }
    })

    const createdAttempt = await prisma.attempt.create({
        data: {
            score: 0,
            total,
            userName,
            answers: {
                create: answersData.map((a) => ({
                    questionId: a.questionId,
                    selected: a.selected,
                    isCorrect: a.isCorrect
                }))
            }
        }
    })

    // Update score
    await prisma.attempt.update({
        where: { id: createdAttempt.id },
        data: { score }
    })

    revalidatePath('/')
    return createdAttempt.id
}
