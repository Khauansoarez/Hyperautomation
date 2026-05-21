import { PrismaClient, SimuladoType } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const docsDir = path.join(process.cwd(), 'docs')

type RawQuestion = {
  content: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

function normalizeQuestion(q: RawQuestion) {
  return JSON.stringify({
    content: q.content.trim(),
    options: q.options.map((option) => option.trim()),
    correctAnswer: q.correctAnswer.trim(),
    explanation: q.explanation?.trim() ?? null,
  })
}

async function replaceQuestions(type: SimuladoType, questions: RawQuestion[]) {
  await prisma.$transaction(async (tx) => {
    const existingQuestions = await tx.question.findMany({
      where: { simuladoType: type },
      select: { id: true },
    })

    const existingQuestionIds = existingQuestions.map((question) => question.id)

    if (existingQuestionIds.length > 0) {
      const affectedAnswers = await tx.answer.findMany({
        where: { questionId: { in: existingQuestionIds } },
        select: { attemptId: true },
        distinct: ['attemptId'],
      })
      const affectedAttemptIds = affectedAnswers.map((answer) => answer.attemptId)

      if (affectedAttemptIds.length > 0) {
        await tx.answer.deleteMany({
          where: { attemptId: { in: affectedAttemptIds } },
        })
        await tx.attempt.deleteMany({
          where: { id: { in: affectedAttemptIds } },
        })
      }

      await tx.question.deleteMany({
        where: { simuladoType: type },
      })
    }

    await tx.question.createMany({
      data: questions.map((q) => ({
        content: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ?? null,
        simuladoType: type,
      })),
    })
  })
}

async function main() {
  const files: { name: string; type: SimuladoType }[] = [
    { name: 'Simulado.json', type: SimuladoType.v1 },
    { name: 'Simulado V2.json', type: SimuladoType.v2 },
    { name: 'Simulado V3.json', type: SimuladoType.v3 },
    { name: 'Simulado V4.json', type: SimuladoType.v4 },
    { name: 'Simulado V5.json', type: SimuladoType.v5 },
  ]

  for (const file of files) {
    const filePath = path.join(docsDir, file.name)

    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${file.name}`)
      continue
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    const data: RawQuestion[] = JSON.parse(raw)

    const questions = data.slice(0, 60)
    if (questions.length !== 60) {
      console.warn(
        `WARN: ${file.name} tem ${questions.length} questões. Esperado: 60.`
      )
    }

    const existingQuestions = await prisma.question.findMany({
      where: { simuladoType: file.type },
      select: {
        content: true,
        options: true,
        correctAnswer: true,
        explanation: true,
      },
    })

    const existingSignatures = new Set(existingQuestions.map(normalizeQuestion))
    const jsonSignatures = new Set(questions.map(normalizeQuestion))
    const isInSync =
      existingQuestions.length === questions.length &&
      existingSignatures.size === jsonSignatures.size &&
      [...jsonSignatures].every((signature) => existingSignatures.has(signature))

    if (!isInSync) {
      console.log(
        `Syncing ${questions.length} questions for simuladoType: ${file.type}...`
      )

      await replaceQuestions(file.type, questions)

      console.log(`Successfully synced ${file.type}`)
    } else {
      console.log(
        `Database questions for type ${file.type} are already in sync with ${file.name}. Skipping seed.`
      )
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
