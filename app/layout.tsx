import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getEventConfig } from '@/lib/eventConfig'

const inter = Inter({ subsets: ['latin'] })
const config = getEventConfig()

export const metadata: Metadata = {
  title: `${config.event.name} ${config.event.year}`,
  description: `Track your achievements and drinks at ${config.event.name} ${config.event.year}`,
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/icon-192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/icon-512.png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          {children}
        </div>
      </body>
    </html>
  )
} 