'use client'

import { readStoredTheme, writeStoredTheme } from '@/lib/utils/storage'

export default function ThemeToggle() {
  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || readStoredTheme()
    const next = current === 'dark' ? 'light' : 'dark'

    document.documentElement.setAttribute('data-theme', next)
    writeStoredTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      title="Alternar tema"
      aria-label="Alternar tema claro ou escuro"
    >
      ◐
    </button>
  )
}
