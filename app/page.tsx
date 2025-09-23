import Header from '@/components/Header'
import HomeClient from '@/components/HomeClient'
import { getAllRoadmaps } from '@/lib/roadmaps'

export default async function HomePage() {
  const roadmaps = await getAllRoadmaps()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container max-w-6xl py-6">
        <HomeClient roadmaps={roadmaps} />
      </main>
    </div>
  )
}

