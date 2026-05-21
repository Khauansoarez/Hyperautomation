import type { SimuladoProgress } from '@/lib/types'

const PROGRESS_KEY = 'simuladoProgress'
const THEME_KEY = 'theme'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readJsonStorage<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJsonStorage<T>(key: string, value: T) {
  if (!canUseStorage()) return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be blocked or full. The app should keep working without it.
  }
}

export function readSimuladoProgress() {
  return readJsonStorage<SimuladoProgress>(PROGRESS_KEY, {})
}

export function writeSimuladoProgress(progress: SimuladoProgress) {
  writeJsonStorage(PROGRESS_KEY, progress)
}

export function readStoredTheme() {
  if (!canUseStorage()) return 'dark'

  try {
    return window.localStorage.getItem(THEME_KEY) || 'dark'
  } catch {
    return 'dark'
  }
}

export function writeStoredTheme(theme: string) {
  if (!canUseStorage()) return

  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Non-critical preference.
  }
}
