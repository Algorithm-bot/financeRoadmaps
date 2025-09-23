import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="container max-w-6xl py-10">
      <h1 className="text-2xl font-semibold">Not Found</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">The requested roadmap does not exist.</p>
      <Link href="/" className="mt-4 inline-block rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Back to Home</Link>
    </main>
  )
}

