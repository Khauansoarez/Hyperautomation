'use client'

import Link from 'next/link'

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="app-shell app-shell--center">
      <section className="empty-state" role="alert">
        <div className="empty-state__mark">!</div>
        <h1>Algo saiu do esperado</h1>
        <p>
          A tela encontrou um erro, mas a plataforma continua disponível. Tente
          recarregar a página ou volte para a home.
        </p>
        <div className="action-row">
          <button className="btn btn-primary" onClick={reset}>
            Tentar novamente
          </button>
          <Link href="/" className="btn btn-outline">
            Voltar para a home
          </Link>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <pre className="error-detail">{error.message}</pre>
        )}
      </section>
    </main>
  )
}
