"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'

export default function Header() {
  const { setTheme, resolvedTheme } = useTheme()
  const { user, loading, signInWithGoogle, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Wait for mount to avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  // Close mobile menu when route changes or screen resizes
  useEffect(() => {
    const handleResize = () => setIsMobileMenuOpen(false)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSignIn = async () => {
    setSigningIn(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await logout()
      setIsMobileMenuOpen(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Reusable User Badge Component to avoid code duplication between Mobile/Desktop
  const UserBadge = () => (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 dark:border-slate-800 dark:bg-slate-900">
      {user?.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName || 'User'}
          referrerPolicy="no-referrer"
          className="h-6 w-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
            }
          }}
        />
      ) : null}
      
      <div 
        className={`${user?.photoURL ? 'hidden' : 'flex'} h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900`}
      >
        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
      </div>

      <span className="max-w-[100px] truncate text-xs font-medium text-slate-700 dark:text-slate-300">
        {user?.displayName?.split(' ')[0] || 'User'}
      </span>
    </div>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-950/80 supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        
        {/* --- Logo Section --- */}
        <Link 
          href="/" 
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-80 dark:text-white"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
            <Image 
              src="/favicon.png" 
              alt="FinRasta Logo" 
              width={32} 
              height={32}
              className="object-contain"
            />
          </div>
          <span className="text-lg">FinRasta</span>
        </Link>

        {/* --- Right Actions (Desktop & Mobile) --- */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Desktop Navigation (Hidden on Mobile) */}
          <nav className="hidden items-center gap-4 md:flex">
            <Link 
              href="/" 
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Home
            </Link>
            
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <UserBadge />
                    <button
                      onClick={handleSignOut}
                      className="text-sm font-medium text-slate-500 transition-colors hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    disabled={signingIn}
                    className="group relative inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition-all hover:bg-slate-800 hover:ring-2 hover:ring-slate-900 hover:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 dark:hover:ring-slate-50 dark:hover:ring-offset-slate-950"
                  >
                    {signingIn ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <>
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Sign in</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Theme Toggle (Visible on both) */}
          {mounted && (
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="group flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-transparent text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            >
              {resolvedTheme === 'dark' ? (
                <svg className="h-4 w-4 transition-transform group-hover:-rotate-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 transition-transform group-hover:rotate-45" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          )}

          {/* Mobile Menu Button (Hidden on Desktop) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 md:hidden dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {isMobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* --- Mobile Menu Drawer --- */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 top-16 w-full border-b border-slate-200 bg-white/95 p-4 backdrop-blur-md shadow-lg dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Home
            </Link>
            
            <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

            {!loading && (
              <div className="flex flex-col gap-4">
                {user ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Signed in as:</span>
                      <UserBadge />
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleSignIn();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={signingIn}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 disabled:opacity-70 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    {signingIn ? 'Connecting...' : 'Sign in with Google'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}