import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isAuthorized(request: Request) {
  const token = process.env.ADMIN_ATTEMPTS_TOKEN
  return Boolean(token) && request.headers.get('x-admin-token') === token
}

export async function GET() {
  try {
    const attempts = await prisma.attempt.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const totalAttempts = await prisma.attempt.count()
    const averageScoreRaw = totalAttempts > 0
      ? (await prisma.attempt.aggregate({ _avg: { score: true } }))._avg.score
      : 0
    const averageTotalRaw = totalAttempts > 0
      ? (await prisma.attempt.aggregate({ _avg: { total: true } }))._avg.total
      : 0

    const averageScore = Number(averageScoreRaw).toFixed(1)
    const averageTotal = Number(averageTotalRaw).toFixed(1)
    const totalQuestions = attempts[0]?.total ?? 0

    return NextResponse.json({
      totalQuestions,
      attempts,
      totalAttempts,
      averageScore,
      averageTotal
    })
  } catch (error) {
    console.error('Error fetching attempts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attempts' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete all answers first (due to foreign key constraint)
    await prisma.answer.deleteMany({})

    // Delete all attempts
    await prisma.attempt.deleteMany({})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing all attempts:', error)
    return NextResponse.json(
      { error: 'Failed to clear attempts' },
      { status: 500 }
    )
  }
}
