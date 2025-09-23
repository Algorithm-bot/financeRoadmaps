"use client"
import { useMemo, useState } from 'react'
import type { RoadmapSummary } from '@/types/roadmap'
import SearchBar from './SearchBar'
import RoadmapCard from './RoadmapCard'

export default function HomeClient({ roadmaps }: { roadmaps: RoadmapSummary[] }) {
  const [query, setQuery] = useState('')
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

  return (
    <div>
      <SearchBar query={query} onChange={setQuery} />

      {orderedCategories.map((category, idx) => {
        const items = grouped.get(category) ?? []
        if (!items.length) return null
        const section = (
          <section key={category} className={idx === 0 ? 'mt-8' : 'mt-10'}>
            <h2 className="mb-4 text-xl font-semibold">{category}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(r => (
                <RoadmapCard key={r.slug} roadmap={r} />
              ))}
            </div>
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

