"use client"
import { useMemo, useState } from 'react'
import type { RoadmapSummary } from '@/types/roadmap'
import SearchBar from './SearchBar'
import RoadmapCard from './RoadmapCard'

export default function HomeClient({ roadmaps }: { roadmaps: RoadmapSummary[] }) {
  const [query, setQuery] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  
  const q = query.toLowerCase().trim()
  const filtered = useMemo(() => {
    if (!q) return roadmaps
    return roadmaps.filter(r => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
  }, [q, roadmaps])

  const orderedCategories: RoadmapSummary['category'][] = [
    'Finance Topics',
    'Professional Certifications & Specialist Roles',
    'Banking & Financial Services',
    'Capital Markets & Investment',
    'Advisory, Planning & Consulting',
    'Insurance & Risk',
    'Corporate Finance Roles',
    'Fintech & Emerging Roles',
  ]

  const grouped = useMemo(() => {
    const map = new Map<string, RoadmapSummary[]>()
    for (const item of filtered) {
      const arr = map.get(item.category) ?? []
      arr.push(item)
      map.set(item.category, arr)
    }
    return map
  }, [filtered])

  const hasTopics = (grouped.get('Finance Topics')?.length ?? 0) > 0
  const firstCareerIndex = hasTopics
    ? orderedCategories.findIndex(c => c !== 'Finance Topics' && (grouped.get(c)?.length ?? 0) > 0)
    : -1

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const isCollapsed = (category: string) => collapsedCategories.has(category)

  return (
    <div>
      <SearchBar query={query} onChange={setQuery} />

      {orderedCategories.map((category, idx) => {
        const items = grouped.get(category) ?? []
        if (!items.length) return null
        const collapsed = isCollapsed(category)
        
        const section = (
          <section key={category} className={idx === 0 ? 'mt-8' : 'mt-10'}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{category}</h2>
              <button
                onClick={() => toggleCategory(category)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-transparent text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                aria-label={collapsed ? `Expand ${category}` : `Collapse ${category}`}
              >
                <svg
                  className={`h-5 w-5 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {!collapsed && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(r => (
                  <RoadmapCard key={r.slug} roadmap={r} />
                ))}
              </div>
            )}
          </section>
        )

        if (hasTopics && idx === firstCareerIndex) {
          return (
            <div key={`career-group-${category}`}>
              <div className="mt-10 mb-4 flex items-center">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                <span className="mx-3 text-base uppercase tracking-wide text-slate-900 dark:text-slate-100">Careers in Finance</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>
              {section}
            </div>
          )
        }

        return section
      })}
    </div>
  )
}

