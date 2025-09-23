export type Resource = {
  type: 'article' | 'video' | 'tool' | 'course' | 'book'
  title: string
  url: string
}

export type RoadmapNode = {
  bulletPoints: any
  id: string
  label: string
  description?: string
  resources?: Resource[]
  completed?: boolean
}

export type RoadmapStage = {
  title: string
  nodes: RoadmapNode[]
}

export type Roadmap = {
  title: string
  description: string
  category:
    | 'Finance Topics'
    | 'Professional Certifications & Specialist Roles'
    | 'Banking & Financial Services'
    | 'Capital Markets & Investment'
    | 'Advisory, Planning & Consulting'
    | 'Insurance & Risk'
    | 'Corporate Finance Roles'
    | 'Fintech & Emerging Roles'
  slug: string
  stages: RoadmapStage[]
  layout?: 'radial' | 'flow'
}

export type RoadmapSummary = Pick<Roadmap, 'title' | 'description' | 'category' | 'slug'>

