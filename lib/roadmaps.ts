import { promises as fs } from 'fs'
import path from 'path'
import type { Roadmap, RoadmapSummary } from '@/types/roadmap'

const dataDir = path.join(process.cwd(), 'data', 'roadmaps')

function normalizeRoadmap(json: unknown): Roadmap | null {
  if (!json) return null
  const candidate = Array.isArray(json) ? (json[0] as unknown) : json
  if (candidate && typeof candidate === 'object') {
    const r = candidate as Roadmap
    if ((r as any).stages && (r as any).slug) {
      return r
    }
  }
  return null
}

export async function getAllRoadmaps(): Promise<RoadmapSummary[]> {
  const files = await fs.readdir(dataDir)
  const jsonFiles = files.filter(f => f.endsWith('.json'))
  const all: RoadmapSummary[] = []
  for (const file of jsonFiles) {
    try {
      const content = await fs.readFile(path.join(dataDir, file), 'utf8')
      const parsed = normalizeRoadmap(JSON.parse(content))
      if (!parsed) continue
      const fallbackTitle = parsed.slug || path.basename(file, '.json')
      all.push({
        title: parsed.title ?? fallbackTitle,
        description: parsed.description,
        category: parsed.category,
        slug: parsed.slug,
      })
    } catch (error) {
      // Skip files that cannot be parsed
      continue
    }
  }
  return all.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
}

export async function getRoadmapBySlug(slug: string): Promise<Roadmap | null> {
  const filePath = path.join(dataDir, `${slug}.json`)
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return normalizeRoadmap(JSON.parse(content))
  } catch (e) {
    return null
  }
}

