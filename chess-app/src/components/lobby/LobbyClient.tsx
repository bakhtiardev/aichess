'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AIOpponent } from '@/lib/aiOpponents'
import { AnimatePresence, motion } from 'framer-motion'

interface LobbyClientProps {
  opponents: AIOpponent[]
  providerIcons: Record<string, string>
}

export default function LobbyClient({ opponents, providerIcons }: LobbyClientProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<AIOpponent | null>(null)
  const router = useRouter()

  const handleStartGame = (color: 'white' | 'black') => {
    if (!selectedOpponent) return
    router.push(`/play/${selectedOpponent.id}?color=${color}`)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {opponents.map((opponent) => (
          <div
            key={opponent.id}
            className={`group relative bg-surface-container-high rounded-[2.5rem] border transition-all duration-700 overflow-hidden flex flex-col h-[520px] shadow-sm hover:shadow-2xl hover:shadow-primary/10 ${opponent.id === 'groq-llama3-70b' ? 'border-primary/40 shadow-lg shadow-primary/5' : 'border-outline-variant hover:border-primary/50'
              }`}
          >
            {/* Character Image Section */}
            <div className="relative h-full w-full overflow-hidden">
              <img
                src={opponent.avatarUrl}
                alt={opponent.name}
                className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1 ${opponent.id === 'groq-llama3-70b' ? 'brightness-125 contrast-110 saturate-125 hue-rotate-[15deg]' : ''
                  }`}
              />

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-surface-container-high/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Scanning Effect */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-primary/40 blur-sm animate-scan z-30 ${opponent.id === 'groq-llama3-70b' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

              {/* Minimal Info (Always Visible) */}
              <div className="absolute bottom-0 left-0 w-full px-8 pb-2 pt-8 transition-transform duration-500 group-hover:-translate-y-32 z-20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {providerIcons[opponent.providerType] && (
                      <img
                        src={providerIcons[opponent.providerType]}
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
              <button
                onClick={() => setSelectedOpponent(opponent)}
                className="w-full bg-primary text-on-primary hover:brightness-110 active:scale-[0.98] transition-all duration-300 font-black text-sm py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group/btn"
              >
                CHALLENGE MODEL
              </button>
            </div>

            {/* Hover Border Glow */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${opponent.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-2xl -z-10`} />
          </div>
        ))}
      </div>

      {/* Color Selection Modal */}
      <AnimatePresence>
        {selectedOpponent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOpponent(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-surface-container-high rounded-[2.5rem] border border-outline-variant shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Match Setup</span>
                  </div>
                  <h3 className="text-3xl font-black text-on-surface tracking-tighter uppercase mb-2">
                    Select Your <span className="text-primary">Side</span>
                  </h3>
                  <p className="text-on-surface-variant text-sm font-medium">
                    Prepare for battle against <span className="text-on-surface">{selectedOpponent.name}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => handleStartGame('white')}
                    className="group relative aspect-square bg-white border border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-white/10 active:scale-[0.98]"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-black text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        chess_pawn
                      </span>
                    </div>
                    <span className="text-black font-black text-sm tracking-widest">WHITE</span>
                    <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity" />
                  </button>

                  <button
                    onClick={() => handleStartGame('black')}
                    className="group relative aspect-square bg-neutral-900 border border-neutral-800 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
                  >
                    <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        chess_pawn
                      </span>
                    </div>
                    <span className="text-white font-black text-sm tracking-widest">BLACK</span>
                    <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity" />
                  </button>
                </div>

                <button
                  onClick={() => setSelectedOpponent(null)}
                  className="w-full py-4 text-on-surface-variant text-xs font-black uppercase tracking-widest hover:text-on-surface transition-colors"
                >
                  Cancel Challenge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
