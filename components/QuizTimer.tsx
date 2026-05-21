'use client'

import { useEffect, useMemo, useState } from 'react'

interface QuizTimerProps {
  isRunning: boolean
  totalSeconds?: number
  onTimeUp?: () => void
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.floor(safeSeconds / 60)
  const remainder = safeSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

export default function QuizTimer({ isRunning, totalSeconds = 5400, onTimeUp }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds)

  useEffect(() => {
    setTimeLeft(totalSeconds)
  }, [totalSeconds])

  useEffect(() => {
    if (!isRunning) return

    if (timeLeft <= 0) {
      onTimeUp?.()
      return
    }

    const tick = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(tick)
          onTimeUp?.()
          return 0
        }

        return previous - 1
      })
    }, 1000)

    return () => window.clearInterval(tick)
  }, [isRunning, onTimeUp, timeLeft])

  const state = useMemo(() => {
    if (timeLeft <= 60) return 'urgent'
    if (timeLeft <= 300) return 'warning'
    return 'normal'
  }, [timeLeft])

  return (
    <div className={`quiz-timer quiz-timer--${state}`} aria-live="polite">
      <span>Tempo restante</span>
      <strong>{formatTime(timeLeft)}</strong>
    </div>
  )
}
