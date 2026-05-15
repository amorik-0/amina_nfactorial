import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Checkers Duel — Play Online',
  description:
    'Play Checkers online with friends or against AI. Pass & Play, Multiplayer, and AI modes. No download needed.',
  keywords: ['checkers', 'draughts', 'board game', 'online', 'multiplayer', 'AI'],
  openGraph: {
    title: 'Checkers Duel',
    description: 'Classic checkers — play online with friends or AI.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen animated-bg antialiased">
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
