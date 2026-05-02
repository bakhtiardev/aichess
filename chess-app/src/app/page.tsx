import type { Metadata } from 'next'
import Link from 'next/link'
import TopBar from '@/components/layout/TopBar'
import { AI_OPPONENTS } from '@/lib/aiOpponents'

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

          {/* Unified Character Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {AI_OPPONENTS.map((opponent) => (
              <div
                key={opponent.id}
                className="group relative bg-surface-container-high rounded-[2.5rem] border border-outline-variant hover:border-primary/50 transition-all duration-700 overflow-hidden flex flex-col h-[520px] shadow-sm hover:shadow-2xl hover:shadow-primary/10"
              >
                {/* Character Image Section */}
                <div className="relative h-full w-full overflow-hidden">
                  <img
                    src={opponent.avatarUrl}
                    alt={opponent.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                  />

                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-surface-container-high/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Scanning Effect */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 blur-sm animate-scan opacity-0 group-hover:opacity-100 z-30" />



                  {/* Minimal Info (Always Visible) */}
                  <div className="absolute bottom-0 left-0 w-full px-8 pb-2 pt-8 transition-transform duration-500 group-hover:-translate-y-32 z-20">
                    <div className="flex items-center gap-3 mb-3">

                      <div className="flex items-center gap-2">
                        {PROVIDER_ICONS[opponent.providerType] && (
                          <img
                            src={PROVIDER_ICONS[opponent.providerType]}
                            alt=""
                            className="w-5 h-5 object-contain shadow-sm"
                          />
                        )}
                        <span className="text-[11px] font-black text-on-surface uppercase tracking-widest group-hover:text-primary transition-colors">
                          {opponent.provider}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-on-surface leading-none tracking-tighter mb-2 group-hover:text-primary transition-colors">
                      {opponent.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">monitoring</span>
                      <span className="text-sm font-bold text-on-surface-variant">ELO {opponent.elo.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Hover Reveal (Sliding up) */}
                  <div className="absolute inset-x-0 bottom-0 p-8 pt-16 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-surface-container-high via-surface-container-high to-transparent z-20">
                    <div className="space-y-5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Strategy Profile</p>
                        <p className="text-sm font-bold text-on-surface">{opponent.playstyle}</p>
                      </div>

                      {/* Win Rate Bar */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                          <span>Win Rate</span>
                          <span>{opponent.winRate}%</span>
                        </div>
                        <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-1000 delay-300 w-0 group-hover:w-[var(--win-rate)]" style={{ '--win-rate': `${opponent.winRate}%` } as any} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Play Button */}
                <div className="p-8 bg-surface-container-high z-30">
                  <Link
                    href={`/play/${opponent.id}`}
                    className="w-full bg-primary text-on-primary hover:brightness-110 active:scale-[0.98] transition-all duration-300 font-black text-sm py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group/btn"
                  >
                    CHALLENGE MODEL
                  </Link>
                </div>

                {/* Hover Border Glow */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${opponent.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-2xl -z-10`} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
