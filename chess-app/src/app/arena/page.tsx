import TopBar from '@/components/layout/TopBar'
import Link from 'next/link'

export default function ArenaPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Chess AI Hub" subtitle="AI Arena" />
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <span className="material-symbols-outlined text-6xl text-outline mb-4 block">smart_toy</span>
          <h2 className="text-headline-md font-bold text-on-surface mb-2">AI Arena Coming Soon</h2>
          <p className="text-on-surface-variant text-body-sm mb-6">Watch AI models battle each other in real-time.</p>
          <Link href="/" className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold text-sm hover:brightness-110 transition-all inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-base">play_circle</span>
            Play vs AI
          </Link>
        </div>
      </main>
    </div>
  )
}
