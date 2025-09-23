import '../styles/globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import ClientProviders from '@/components/ClientProviders'

export const metadata: Metadata = {
  title: 'Finance Roadmaps',
  description: 'Interactive finance education and career roadmaps',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}

