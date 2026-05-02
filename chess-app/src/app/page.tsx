import type { Metadata } from 'next'
import TopBar from '@/components/layout/TopBar'
import { AI_OPPONENTS } from '@/lib/aiOpponents'
import LobbyClient from '@/components/lobby/LobbyClient'

export const metadata: Metadata = {
  title: 'Play — Grandmaster AI Chess Arena',
  description: 'Choose your AI opponent and start a chess match.',
}

const PROVIDER_ICONS: Record<string, string> = {
  gemini: '/icons/google-logo.png',
  groq: '/icons/groq.png',
  ollama: '/icons/ollama.png',
  gpt: '/icons/chatgpt.png',
  meta: '/icons/meta.png',
  alibaba: '/icons/Alibaba-com.png',
  mixtral: '/icons/mistral-color.png',
}

export default function LobbyPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <TopBar title="Grandmaster AI Arena" />

      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Live Arena</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-on-surface tracking-tighter mb-4 uppercase">
              Select Your <span className="text-primary">AI Model</span>
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-base md:text-lg leading-relaxed opacity-80">
              Enter the arena and challenge the world's most sophisticated chess intelligences.
              Each AI model features unique tactical evolution and distinct strategic patterns.
            </p>
          </div>

          <LobbyClient 
            opponents={AI_OPPONENTS} 
            providerIcons={PROVIDER_ICONS} 
          />
        </div>
      </main>
    </div>
  )
}
