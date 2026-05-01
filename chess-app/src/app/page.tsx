import type { Metadata } from 'next'
import Link from 'next/link'
import TopBar from '@/components/layout/TopBar'
import { AI_OPPONENTS } from '@/lib/aiOpponents'

export const metadata: Metadata = {
  title: 'Play — Grandmaster AI Chess Arena',
  description: 'Choose your AI opponent and start a chess match.',
}

const PROVIDER_META: Record<string, { label: string; icon: string; badge: string; color: string }> = {
  gemini: { label: 'Google Gemini', icon: 'psychology', badge: 'Cloud · Free Key', color: 'text-blue-400' },
  groq:   { label: 'Groq (Free API)', icon: 'bolt', badge: 'Cloud · Free Key', color: 'text-orange-400' },
  ollama: { label: 'Ollama (Local)', icon: 'computer', badge: 'Local · No Key', color: 'text-green-400' },
}

export default function LobbyPage() {
  const groups = ['gemini', 'groq', 'ollama'] as const

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Chess AI Hub" />

      <main className="flex-1 overflow-y-auto p-6 bg-background">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="mb-10 relative">
            <div className="absolute -top-8 -left-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-high border border-primary/20 rounded-full mb-4">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-label-bold font-bold text-primary uppercase tracking-widest">AI Arena</span>
              </div>
              <h2 className="text-headline-lg font-bold text-on-surface mb-2">
                Challenge AI Opponents
              </h2>
              <p className="text-body-md text-on-surface-variant max-w-xl">
                Play against multiple free AI models. Choose a cloud opponent or run one locally — all free.
              </p>
            </div>
          </div>

          {/* Grouped Opponent Cards */}
          {groups.map((providerType) => {
            const opponents = AI_OPPONENTS.filter((o) => o.providerType === providerType)
            if (opponents.length === 0) return null
            const meta = PROVIDER_META[providerType]

            return (
              <div key={providerType} className="mb-10">
                {/* Provider header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`material-symbols-outlined ${meta.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {meta.icon}
                  </span>
                  <h3 className="text-title-md font-bold text-on-surface">{meta.label}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-surface-container-high border border-outline-variant text-on-surface-variant rounded-full">
                    {meta.badge}
                  </span>
                  {providerType === 'groq' && (
                    <a
                      href="https://console.groq.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      Get free key
                    </a>
                  )}
                  {providerType === 'ollama' && (
                    <a
                      href="https://ollama.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      Get Ollama
                    </a>
                  )}
                </div>

                {/* Setup note for providers requiring setup */}
                {providerType === 'groq' && (
                  <div className="mb-4 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg flex items-start gap-2">
                    <span className="material-symbols-outlined text-orange-400 text-[18px] mt-0.5">info</span>
                    <p className="text-xs text-on-surface-variant">
                      Add{' '}
                      <code className="px-1 py-0.5 bg-surface-container-highest rounded text-orange-400 font-mono">GROQ_API_KEY=...</code>
                      {' '}to your <code className="px-1 py-0.5 bg-surface-container-highest rounded font-mono">.env.local</code> file.
                      Get a free key at{' '}
                      <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">console.groq.com</a>.
                    </p>
                  </div>
                )}
                {providerType === 'ollama' && (
                  <div className="mb-4 p-3 bg-green-500/5 border border-green-500/20 rounded-lg flex items-start gap-2">
                    <span className="material-symbols-outlined text-green-400 text-[18px] mt-0.5">info</span>
                    <p className="text-xs text-on-surface-variant">
                      Runs 100% locally. Install{' '}
                      <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Ollama</a>,
                      then run:{' '}
                      <code className="px-1 py-0.5 bg-surface-container-highest rounded text-green-400 font-mono">ollama serve</code>
                      {' '}and{' '}
                      <code className="px-1 py-0.5 bg-surface-container-highest rounded text-green-400 font-mono">ollama pull llama3</code>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {opponents.map((opponent) => (
                    <div
                      key={opponent.id}
                      className="bg-surface-container-high rounded-lg border border-outline-variant flex flex-col hover:border-outline transition-all duration-300 relative overflow-hidden group card-glow"
                    >
                      {/* Gradient accent bar */}
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${opponent.gradient} opacity-90`} />

                      {/* Free badge */}
                      {opponent.free && (
                        <div className="absolute top-4 right-4">
                          <span className="px-2 py-0.5 bg-primary/15 border border-primary/30 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Free
                          </span>
                        </div>
                      )}

                      <div className="p-6 flex flex-col flex-1">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-6">
                          <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center border border-outline-variant flex-shrink-0 group-hover:border-outline transition-colors">
                            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {opponent.iconName}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-on-surface text-lg leading-tight">{opponent.name}</h3>
                            <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 bg-surface-container-highest rounded text-label-bold font-bold text-on-surface-variant text-[11px]">
                              <span className="material-symbols-outlined text-[12px] text-primary">monitoring</span>
                              ELO {opponent.elo.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-body-sm text-on-surface-variant mb-5 leading-relaxed flex-1">
                          {opponent.description}
                        </p>

                        {/* Stats */}
                        <div className="space-y-2.5 mb-6">
                          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                            <span className="text-body-sm text-on-surface-variant">Playstyle</span>
                            <span className="text-body-sm text-on-surface font-medium">{opponent.playstyle}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                            <span className="text-body-sm text-on-surface-variant">Runs on</span>
                            <span className="text-body-sm text-on-surface font-medium">{opponent.provider}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                            <span className="text-body-sm text-on-surface-variant">Win Rate</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${opponent.winRate}%` }}
                                />
                              </div>
                              <span className="text-body-sm text-on-surface font-medium">{opponent.winRate}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Challenge Button */}
                        <Link
                          href={`/play/${opponent.id}`}
                          className="w-full bg-primary text-on-primary hover:brightness-105 font-bold text-label-bold py-3 px-4 rounded-lg shadow-lg shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                        >
                          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>
                            sports_esports
                          </span>
                          Challenge
                        </Link>
                      </div>
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
