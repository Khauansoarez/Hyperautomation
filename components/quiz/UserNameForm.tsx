'use client'

import { useState } from 'react'

interface UserNameFormProps {
  onSubmit: (userName: string) => void
}

export default function UserNameForm({ onSubmit }: UserNameFormProps) {
  const [userName, setUserName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const start = (name: string) => {
    setIsSubmitting(true)
    onSubmit(name.trim() || 'Anônimo')
  }

  return (
    <section className="start-card">
      <div className="eyebrow">Antes de começar</div>
      <h1>Identifique sua tentativa</h1>
      <p>
        Seu nome aparece apenas no histórico local de resultados. Você também
        pode seguir como anônimo.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          start(userName)
        }}
        className="start-form"
      >
        <label htmlFor="user-name">Nome do participante</label>
        <input
          id="user-name"
          type="text"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          placeholder="Ex.: Ana Silva"
          autoComplete="name"
        />

        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? 'Preparando...' : 'Começar simulado'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => start('Anônimo')}
        disabled={isSubmitting}
        className="btn btn-outline"
      >
        Continuar como anônimo
      </button>
    </section>
  )
}
