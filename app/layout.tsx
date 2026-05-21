import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Simulado',
  description: 'Sistema de Simulado para concursos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="space-grotesk-font">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('theme')
                  const preferred = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                  document.documentElement.setAttribute('data-theme', preferred)
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'dark')
                }
              })()
            `
          }}
        />
        <main className="min-h-screen p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  )
}
