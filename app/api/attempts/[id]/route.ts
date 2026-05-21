import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isAuthorized(request: Request) {
  const token = process.env.ADMIN_ATTEMPTS_TOKEN
  return Boolean(token) && request.headers.get('x-admin-token') === token
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if attempt exists first
    const attempt = await prisma.attempt.findUnique({
      where: { id }
    })
    
    if (!attempt) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      )
    }

    // Delete the attempt and its related answers
    await prisma.answer.deleteMany({
      where: { attemptId: id }
    })

    await prisma.attempt.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting attempt:', error)
    return NextResponse.json(
      { error: 'Failed to delete attempt' },
      { status: 500 }
    )
  }
}
