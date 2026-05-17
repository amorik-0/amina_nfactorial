import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/Nav'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CodeCheckers: Fog of War',
  description: 'Learn programming through strategic gameplay. Move pieces with code.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${nunito.variable} h-full antialiased`}
        style={{ background: '#F0ECBF', fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}
      >
        <Nav />
        {children}
      </body>
    </html>
  )
}
