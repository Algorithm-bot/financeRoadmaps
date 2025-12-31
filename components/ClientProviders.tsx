"use client"
import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}

