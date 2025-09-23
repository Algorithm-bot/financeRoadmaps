"use client"
import type { ChangeEvent } from 'react'

export default function SearchBar({ query, onChange }: { query: string; onChange: (value: string) => void }) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)
  return (
    <div className="relative">
      <input
        value={query}
        onChange={handleChange}
        placeholder="Search roadmaps by title or category..."
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm outline-none ring-blue-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
        aria-label="Search roadmaps"
      />
    </div>
  )
}

