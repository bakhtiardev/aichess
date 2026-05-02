import type { Metadata } from 'next'
import Link from 'next/link'
import TopBar from '@/components/layout/TopBar'
import { AI_OPPONENTS } from '@/lib/aiOpponents'

export const metadata: Metadata = {
  title: 'Play — Grandmaster AI Chess Arena',
  description: 'Choose your AI opponent and start a chess match.',
}

const PROVIDER_META: Record<string, { label: string; icon: string; badge: string; color: string }> = {
  gemini: { label: 'Google DeepMind', icon: 'psychology', badge: 'Frontier Intelligence', color: 'text-blue-400' },
  groq: { label: 'Groq · World\'s Fastest', icon: 'bolt', badge: 'Lightning Fast', color: 'text-orange-400' },
  ollama: { label: 'On-Device AI', icon: 'computer', badge: 'Private & Local', color: 'text-green-400' },
}

export default function LobbyPage() {
  const groups = ['gemini', 'groq', 'ollama'] as const

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Grandmaster AI Arena" />

      <main className="flex-1 overflow-y-auto p-6 bg-background">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-black text-on-surface tracking-tighter mb-3">
              CHOOSE YOUR <span className="text-primary uppercase">Opponent</span>
            </h2>
            <p className="text-on-surface-variant max-w-lg mx-auto text-sm leading-relaxed">
              Select a world-class AI grandmaster. From OpenAI's logic to Meta's tactics, choose your challenge.
            </p>
          </div>

          {/* Grouped Opponent Cards */}
          {groups.map((providerType) => {
            const opponents = AI_OPPONENTS.filter((o) => o.providerType === providerType)
            if (opponents.length === 0) return null
            const meta = PROVIDER_META[providerType]

            return (
              <div key={providerType} className="mb-12">
                {/* Provider header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-2 rounded-xl bg-surface-container-highest border border-outline-variant shadow-sm`}>
                    <span className={`material-symbols-outlined text-2xl ${meta.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {meta.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-on-surface tracking-tight">{meta.label}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant opacity-70">
                      {meta.badge}
                    </span>
                  </div>
                </div>

                {/* Setup note for providers requiring setup */}
                {providerType === 'groq' && (
                  <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center gap-4 backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">key</span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      To challenge these grandmasters, add your free <code className="px-1.5 py-0.5 bg-primary/10 rounded text-primary font-mono font-bold">GROQ_API_KEY</code> to <code className="px-1.5 py-0.5 bg-surface-container-highest rounded font-mono">.env.local</code>.
                      Get it at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">console.groq.com</a>.
                    </p>
                  </div>
                )}
                {providerType === 'ollama' && (
                  <div className="mb-6 p-4 bg-green-500/5 border border-green-500/10 rounded-xl flex items-center gap-4 backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-green-500 text-xl">dns</span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Running 100% locally on your hardware. Ensure <span className="text-green-500 font-bold">Ollama</span> is active and you've pulled the models using <code className="px-1.5 py-0.5 bg-green-500/10 rounded text-green-500 font-mono font-bold">ollama pull llama3</code>.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {opponents.map((opponent) => (
                    <div
                      key={opponent.id}
                      className="group relative bg-surface-container-high rounded-[2rem] border border-outline-variant hover:border-primary/50 transition-all duration-700 overflow-hidden flex flex-col h-[480px] shadow-sm hover:shadow-2xl hover:shadow-primary/10"
                    >
                      {/* Character Image Section */}
                      <div className="relative h-full w-full overflow-hidden">
                        <img
                          src={opponent.avatarUrl}
                          alt={opponent.name}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                        />

                        {/* Ambient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-surface-container-high/20 to-transparent opacity-80" />
                        <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-container-high group-hover:opacity-0 transition-opacity duration-500`} />

                        {/* Scanning Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/30 blur-sm animate-scan opacity-0 group-hover:opacity-100" />

                        {/* Status Light */}
                        <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 z-20">
                          <span className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Active</span>
                        </div>

                        {/* Minimal Details (Always Visible) */}
                        <div className="absolute bottom-0 left-0 w-full p-8 transition-transform duration-500 group-hover:-translate-y-40">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="px-3 py-1 bg-primary/20 backdrop-blur-md rounded-lg border border-primary/30">
                              <span className="text-[11px] font-black text-primary tracking-tighter">LVL {Math.floor(opponent.elo / 100)}</span>
                            </div>
                            <span className="text-[11px] font-black text-on-surface-variant/70 uppercase tracking-widest">
                              {opponent.provider}
                            </span>
                          </div>
                          <h3 className="text-3xl font-black text-on-surface leading-tight tracking-tighter mb-1">
                            {opponent.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">monitoring</span>
                            <span className="text-sm font-bold text-on-surface-variant">ELO {opponent.elo.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Hover Reveal Section (Sliding up) */}
                        <div className="absolute inset-x-0 bottom-0 p-8 pt-12 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-surface-container-high via-surface-container-high to-transparent">
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Strategy Profile</p>
                              <p className="text-sm font-bold text-on-surface">{opponent.playstyle}</p>
                            </div>

                            <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                              {opponent.description}
                            </p>

                            {/* Win Rate Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                <span>Optimization</span>
                                <span>{opponent.winRate}%</span>
                              </div>
                              <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-1000 delay-300 w-0 group-hover:w-[var(--win-rate)]" style={{ '--win-rate': `${opponent.winRate}%` } as any} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Play Button (Sticky) */}
                      <div className="p-6 bg-surface-container-high z-10">
                        <Link
                          href={`/play/${opponent.id}`}
                          className="w-full bg-primary text-on-primary hover:brightness-110 active:scale-[0.98] transition-all duration-300 font-black text-sm py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group/btn"
                        >
                          <span className="material-symbols-outlined text-2xl transition-transform duration-500 group-hover/btn:scale-125 group-hover/btn:rotate-12">
                            play_circle
                          </span>
                          INITIATE MATCH
                        </Link>
                      </div>

                      {/* Hover Border Glow */}
                      <div className={`absolute -inset-1 bg-gradient-to-r ${opponent.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-2xl -z-10`} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
