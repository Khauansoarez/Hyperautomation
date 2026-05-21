import Link from 'next/link'

type EmptyStateProps = {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}

export default function EmptyState({
  title,
  description,
  actionHref = '/',
  actionLabel = 'Voltar para a home'
}: EmptyStateProps) {
  return (
    <section className="empty-state" aria-live="polite">
      <div className="empty-state__mark">!</div>
      <h1>{title}</h1>
      <p>{description}</p>
      <Link href={actionHref} className="btn btn-primary">
        {actionLabel}
      </Link>
    </section>
  )
}
