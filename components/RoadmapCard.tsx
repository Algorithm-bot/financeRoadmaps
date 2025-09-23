import Link from 'next/link'
import type { RoadmapSummary } from '@/types/roadmap'
import { sanitizeAndParseHTML } from '@/lib/utils'

export default function RoadmapCard({ roadmap }: { roadmap: RoadmapSummary }) {
  return (
    <Link href={`/roadmaps/${roadmap.slug}`} className="card block hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex h-full flex-col">
        <div className="mb-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">{roadmap.category}</div>
        <div className="text-lg font-semibold">{roadmap.title}</div>
        <div className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{sanitizeAndParseHTML(roadmap.description)}</div>
      </div>
    </Link>
  )
}

