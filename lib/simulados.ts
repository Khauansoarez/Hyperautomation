export const SIMULADO_TYPES = ['v1', 'v2', 'v3', 'v4', 'v5'] as const

export type SimuladoType = (typeof SIMULADO_TYPES)[number]

export type SimuladoInfo = {
  id: SimuladoType
  title: string
  questionCount: number
  durationMinutes: number
  accent: string
  description: string
}

export const SIMULADOS: SimuladoInfo[] = [
  {
    id: 'v1',
    title: 'Simulado V1',
    questionCount: 60,
    durationMinutes: 90,
    accent: '#38bdf8',
    description: 'Fundamentos de automação e integração'
  },
  {
    id: 'v2',
    title: 'Simulado V2',
    questionCount: 60,
    durationMinutes: 90,
    accent: '#a78bfa',
    description: 'Cenários práticos de Composer e Flow'
  },
  {
    id: 'v3',
    title: 'Simulado V3',
    questionCount: 60,
    durationMinutes: 90,
    accent: '#f59e0b',
    description: 'Governança, APIs e observabilidade'
  },
  {
    id: 'v4',
    title: 'Simulado V4',
    questionCount: 60,
    durationMinutes: 90,
    accent: '#22c55e',
    description: 'Arquitetura e lifecycle de automações'
  },
  {
    id: 'v5',
    title: 'Simulado V5',
    questionCount: 60,
    durationMinutes: 90,
    accent: '#ef4444',
    description: 'Versão hard com cenários enterprise'
  }
]

export function parseSimuladoType(value?: string | null): SimuladoType | null {
  const normalized = value?.toLowerCase()
  return SIMULADO_TYPES.find((type) => type === normalized) ?? null
}

export function getSimuladoInfo(type: SimuladoType): SimuladoInfo {
  return SIMULADOS.find((simulado) => simulado.id === type) ?? SIMULADOS[1]
}
