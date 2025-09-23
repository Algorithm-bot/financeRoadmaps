## Finance Roadmaps

Interactive finance education and career roadmaps built with Next.js (App Router), Tailwind CSS, and React Flow.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS, `next-themes`
- **Graph**: React Flow 11
- **Language**: TypeScript

## Getting Started

1) Install dependencies
```bash
npm install
```

2) Run dev server
```bash
npm run dev
```

Visit `http://localhost:3000`

3) Build/Start
```bash
npm run build
npm run start
```

## Project Structure

```text
app/
  layout.tsx                 # Global layout and providers
  page.tsx                   # Home page (lists all roadmaps)
  roadmaps/[slug]/page.tsx   # Dynamic roadmap page
components/
  ClientProviders.tsx        # Theme provider (next-themes)
  Header.tsx                 # Top navigation with theme toggle
  HomeClient.tsx             # Home page client component, search & sections
  RoadmapCard.tsx            # Card for roadmap summaries
  RoadmapDiagram.tsx         # Interactive React Flow diagram + details drawer
  SearchBar.tsx              # Client search input
data/roadmaps/
  *.json                     # Roadmap data files
lib/
  roadmaps.ts                # Filesystem loading of roadmap JSON (server)
  utils.ts                   # Tailwind merge helper
styles/
  globals.css                # Global styles & Tailwind layers
types/
  roadmap.ts                 # TypeScript data model
tailwind.config.ts           # Tailwind configuration
```

## Data Model
Defined in `types/roadmap.ts`:

```ts
export type Resource = {
  type: 'article' | 'video' | 'tool' | 'course' | 'book'
  title: string
  url: string
}

export type RoadmapNode = {
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
  category: 'Finance Topics' | 'Finance Careers'
  slug: string
  stages: RoadmapStage[]
  layout?: 'radial' | 'flow'
}
```

## Data Loading
- `lib/roadmaps.ts` reads JSON files in `data/roadmaps` and exposes:
  - `getAllRoadmaps()` → `RoadmapSummary[]` for the home page listing.
  - `getRoadmapBySlug(slug)` → `Roadmap | null` for the detail page.
- The dynamic route `app/roadmaps/[slug]/page.tsx` uses these helpers and statically generates params via `generateStaticParams`.

## Components

- `Header.tsx`
  - Site header with a theme toggle powered by `next-themes`.

- `HomeClient.tsx`
  - Client-side filtering with `SearchBar`.
  - Renders two sections: “Finance Topics” and “Finance Careers”.

- `RoadmapCard.tsx`
  - Displays `RoadmapSummary` (category, title, description) and links to a roadmap.

- `SearchBar.tsx`
  - Controlled input for search queries.

- `RoadmapDiagram.tsx`
  - Interactive diagram powered by React Flow.
  - Supports two layouts:
    - **Radial** (default): center node → stage ring → child nodes.
    - **Flow**: vertical stages on left; child nodes to the right.
  - **Dragging**: all nodes are draggable.
  - **Position persistence**: node positions are saved to `localStorage` under the key `nodePositions` on drag stop.
  - **On load**: reads `nodePositions` and applies saved coordinates for all nodes (center, stages, and children) across both layouts.
  - **Reset Layout**: floating button clears `nodePositions` and reloads default positions.
  - **Details drawer**: selecting a node opens a sliding drawer from the right with label, description, and resources.

### React Flow behavior
- Controlled nodes via `onNodesChange` and `applyNodeChanges`.
- Drag stop handler logs and saves the position:
```ts
const handleNodeDragStop = useCallback((event, node: Node) => {
  console.log(`Node moved: ${node.data?.label || node.id}`, node.position)
  const saved = JSON.parse(localStorage.getItem('nodePositions') || '{}')
  saved[node.id] = node.position
  localStorage.setItem('nodePositions', JSON.stringify(saved))
}, [])
```
- Reset layout button:
```ts
const handleResetLayout = useCallback(() => {
  localStorage.removeItem('nodePositions')
  window.location.reload()
}, [])
```

## Theming & Styling
- `next-themes` manages light/dark mode (`class` strategy). See `ClientProviders.tsx`.
- Tailwind CSS for styling; global layers in `styles/globals.css`.
- Responsive layout using Tailwind utilities.

## Adding a New Roadmap
1) Create a new JSON file in `data/roadmaps/`, e.g. `my-topic.json`.
2) Follow `types/roadmap.ts` shape. Example:
```json
{
  "title": "Stock Market Basics",
  "description": "Learn the fundamentals of stock markets",
  "category": "Finance Topics",
  "slug": "stock-market-basics",
  "layout": "radial",
  "stages": [
    { "title": "Introduction", "nodes": [
      { "id": "what-is-stock", "label": "What is a Stock?", "description": "..." }
    ]}
  ]
}
```
3) Visit `/roadmaps/my-topic`.

Notes:
- Set `layout` to `radial` or `flow` per roadmap.
- Node `id` must be unique across the roadmap.

## Scripts
- `npm run dev` – start dev server on port 3000
- `npm run build` – production build
- `npm run start` – run production build on port 3000
- `npm run type-check` – TypeScript check

## Accessibility & UX
- Keyboard-accessible controls where applicable.
- High-contrast dark mode supported.
- Diagram fills the viewport; details presented in an accessible drawer.

## Deployment
- Any Node-compatible host supporting Next.js 14.
- Ensure filesystem-based data under `data/roadmaps/` is available at build time.

## License
MIT

