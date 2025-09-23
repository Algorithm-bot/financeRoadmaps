"use client"
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="container max-w-6xl flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-emerald-500" />
          Finance Roadmaps
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/" className="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Home</Link>
          {mounted && (
            <button
              aria-label="Toggle theme"
              className="rounded-md border border-slate-200 px-3 py-1 text-sm dark:border-slate-700"
              onClick={() => setTheme((resolvedTheme === 'dark' ? 'light' : 'dark'))}
            >
              {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

