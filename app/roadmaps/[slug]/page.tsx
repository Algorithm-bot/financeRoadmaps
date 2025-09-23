import Header from '@/components/Header'
import RoadmapDiagram from '@/components/RoadmapDiagram'
import { getRoadmapBySlug, getAllRoadmaps } from '@/lib/roadmaps'
import { notFound } from 'next/navigation'
import { sanitizeAndParseHTML } from '@/lib/utils'

interface Params {
  params: { slug: string }
}

export async function generateStaticParams() {
  const all = await getAllRoadmaps()
  return all.map(r => ({ slug: r.slug }))
}

export default async function RoadmapPage({ params }: Params) {
  const roadmap = await getRoadmapBySlug(params.slug)
  if (!roadmap) return notFound()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container max-w-6xl py-6">
        <h1 className="text-2xl font-bold">{roadmap.title}</h1>
        <div className="mt-2 text-slate-600 dark:text-slate-300">{sanitizeAndParseHTML(roadmap.description)}</div>
        <div className="mt-6">
          <RoadmapDiagram roadmap={roadmap} />
        </div>
      </main>
    </div>
  )
}

