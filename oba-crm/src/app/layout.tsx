import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OBA – Gestão de Avaliações Psicológicas',
  description: 'CRM do OBA para gestão de crianças encaminhadas para avaliação psicológica',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
