'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BarChart3, CheckCircle2, ListChecks, ShieldCheck } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { useMemo, useSyncExternalStore } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import type { SimuladoProgress } from '@/lib/types'
import { getQuizStatus } from '@/lib/utils/formatting'
import { SIMULADOS, type SimuladoInfo } from '@/lib/simulados'

type SimuladoCardProps = {
  simulado: SimuladoInfo
  savedProgress?: SimuladoProgress[string]
}

type StatItem = {
  label: string
  value: string
}

type BenefitItem = {
  icon: ReactNode
  title: string
  label: string
}

type StatusTone = 'neutral' | 'warning' | 'success'

type StatusBadgeProps = {
  label: string
  tone: StatusTone
}

const stats: StatItem[] = [
  { value: `${SIMULADOS.length}`, label: 'versões' },
  { value: '60', label: 'questões por prova' },
  { value: '90 min', label: 'tempo por prova' },
  { value: 'local', label: 'progresso salvo' }
]

const benefits: BenefitItem[] = [
  {
    icon: <ShieldCheck size={18} aria-hidden="true" />,
    title: 'Modo prova',
    label: 'Tentativa cronometrada e sem interrupções.'
  },
  {
    icon: <ListChecks size={18} aria-hidden="true" />,
    title: 'Sem gabarito',
    label: 'Respostas ocultas até o envio final.'
  },
  {
    icon: <CheckCircle2 size={18} aria-hidden="true" />,
    title: 'Correção final',
    label: 'Resumo de desempenho ao concluir.'
  },
  {
    icon: <BarChart3 size={18} aria-hidden="true" />,
    title: 'Revisão detalhada',
    label: 'Revise respostas e acompanhe progresso.'
  }
]

function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${tone}`}>
      {label}
    </span>
  )
}

function SimuladosHeader() {
  return (
    <section className="simulados-header">
      <div className="simulados-header__content">
        <span className="page-kicker">MuleSoft Hyperautomation Specialist</span>
        <h1>Simulados MuleSoft</h1>
        <p>Treine em ambiente próximo da prova real, com revisão ao final e progresso salvo localmente.</p>
      </div>

      <Link href="/resultados" className="btn btn-outline btn-compact simulados-header__results">
        Ver resultados
      </Link>
    </section>
  )
}

function StatsStrip() {
  return (
    <section className="stats-strip" aria-label="Resumo da plataforma">
      {stats.map((stat) => (
        <div className="stat-pill" key={`${stat.value}-${stat.label}`}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  )
}

function BenefitsRow() {
  return (
    <section className="benefits-row" aria-label="Características do modo prova">
      {benefits.map((benefit) => (
        <div className="benefit-item" key={benefit.title}>
          <span className="benefit-item__icon">{benefit.icon}</span>
          <strong>{benefit.title}</strong>
          <span>{benefit.label}</span>
        </div>
      ))}
    </section>
  )
}

function LearningPathHint() {
  return (
    <section className="learning-path-hint" aria-label="Trilha sugerida">
      <strong>Trilha sugerida</strong>
      <span>Comece pelo V1 para consolidar fundamentos e avance até o V5 para cenários enterprise mais exigentes.</span>
    </section>
  )
}

function getCardActionLabel(percentage: number, completed?: boolean) {
  if (percentage > 0 && !completed) return 'Continuar simulado'
  return 'Iniciar simulado'
}

function getStatusMeta(percentage: number, completed?: boolean): StatusBadgeProps {
  if (completed) return { label: 'Concluído', tone: 'success' }
  if (percentage > 0) return { label: 'Em andamento', tone: 'warning' }
  return { label: 'Não iniciado', tone: 'neutral' }
}

function SimuladoCard({ simulado, savedProgress }: SimuladoCardProps) {
  const progress = getQuizStatus(
    savedProgress?.answered ?? 0,
    savedProgress?.total ?? simulado.questionCount,
    savedProgress?.completed ?? false
  )
  const status = getStatusMeta(progress.percentage, savedProgress?.completed)

  return (
    <Link
      href={`/quiz?type=${simulado.id}`}
      className="simulado-card"
      style={{ '--card-accent': simulado.accent } as CSSProperties}
    >
      <div className="simulado-card__header">
        <span className="version-pill">{simulado.id.toUpperCase()}</span>
        <StatusBadge label={status.label} tone={status.tone} />
      </div>

      <div className="simulado-card__body">
        <h3>{simulado.title}</h3>
        <p>{simulado.description}</p>
      </div>

      <div className="metric-row" aria-label="Informações do simulado">
        <span>
          <strong>{simulado.questionCount}</strong> questões
        </span>
        <span>
          <strong>{simulado.durationMinutes}</strong> minutos
        </span>
      </div>

      <div className="card-progress">
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${progress.percentage}%` }} />
        </div>
      </div>

      <div className="simulado-card__footer">
        <span className="card-cta">
          {getCardActionLabel(progress.percentage, savedProgress?.completed)}
        </span>
        <span className="card-arrow" aria-hidden="true">→</span>
      </div>
    </Link>
  )
}

function SimuladosPage({ progressData }: { progressData: SimuladoProgress }) {
  return (
    <main className="app-shell simulados-page">
      <header className="topbar">
        <div className="brand">
          <Image src="/zello-logo-removebg-preview.png" alt="Zello" width={112} height={40} className="brand__logo" priority />
          <span className="brand__divider" />
          <span>Plataforma de simulados</span>
        </div>
        <div className="topbar__actions">
          <ThemeToggle />
        </div>
      </header>

      <SimuladosHeader />
      <StatsStrip />
      <BenefitsRow />

      <section className="section-heading">
        <div>
          <h2>Escolha um simulado</h2>
          <p>Comece uma nova tentativa ou continue de onde parou.</p>
        </div>
      </section>

      <LearningPathHint />

      <section className="simulado-grid" aria-label="Lista de simulados disponíveis">
        {SIMULADOS.map((simulado) => (
          <SimuladoCard
            key={simulado.id}
            simulado={simulado}
            savedProgress={progressData[simulado.id]}
          />
        ))}
      </section>
    </main>
  )
}

export default function Home() {
  const progressSnapshot = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('storage', onStoreChange)
      return () => window.removeEventListener('storage', onStoreChange)
    },
    () => {
      try {
        return window.localStorage.getItem('simuladoProgress') || ''
      } catch {
        return ''
      }
    },
    () => ''
  )

  const progressData = useMemo<SimuladoProgress>(() => {
    if (!progressSnapshot) return {}

    try {
      return JSON.parse(progressSnapshot)
    } catch {
      return {}
    }
  }, [progressSnapshot])

  return <SimuladosPage progressData={progressData} />
}
