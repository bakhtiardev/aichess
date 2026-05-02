'use client'

import Link from 'next/link'

interface ResultModalProps {
  result: 'win' | 'loss' | 'draw' | 'resigned'
  reason: string
  opponentName: string
  opponentAvatarUrl?: string
  onPlayAgain: () => void
}

const RESULT_CONFIG = {
  win: {
    title: '🏆 Victory!',
    subtitle: "Brilliant chess. You've outplayed the AI!",
    color: 'text-primary',
    borderColor: 'border-primary/30',
    bgColor: 'bg-primary/20',
    icon: 'emoji_events',
    iconColor: 'text-primary',
    ringColor: 'ring-primary/40',
  },
  loss: {
    title: '♟ Defeated',
    subtitle: 'The AI had the upper hand. Study the game and try again!',
    color: 'text-error',
    borderColor: 'border-error/30',
    bgColor: 'bg-error/20',
    icon: 'sentiment_dissatisfied',
    iconColor: 'text-error',
    ringColor: 'ring-error/40',
  },
  draw: {
    title: '🤝 Draw',
    subtitle: 'An equal contest. Well-played to both sides.',
    color: 'text-secondary',
    borderColor: 'border-secondary/30',
    bgColor: 'bg-secondary/20',
    icon: 'handshake',
    iconColor: 'text-secondary',
    ringColor: 'ring-secondary/40',
  },
  resigned: {
    title: '🏳 Resigned',
    subtitle: 'You resigned. Come back stronger!',
    color: 'text-on-surface-variant',
    borderColor: 'border-outline-variant',
    bgColor: 'bg-surface-container-highest',
    icon: 'flag',
    iconColor: 'text-on-surface-variant',
    ringColor: 'ring-outline-variant/40',
  },
}

export default function ResultModal({ result, reason, opponentName, opponentAvatarUrl, onPlayAgain }: ResultModalProps) {
  const config = RESULT_CONFIG[result]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className={`bg-surface-container-high border ${config.borderColor} rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slide-up relative overflow-hidden`}
      >
        {/* Background Accent */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full ${config.bgColor} blur-3xl opacity-50`} />

        {/* Avatar/Icon */}
        <div className="relative mx-auto mb-6 w-24 h-24">
          <div className={`w-full h-full rounded-2xl overflow-hidden ring-4 ${config.ringColor} shadow-xl transform rotate-3`}>
            {opponentAvatarUrl ? (
              <img src={opponentAvatarUrl} alt={opponentName} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${config.bgColor}`}>
                 <span className={`material-symbols-outlined text-4xl ${config.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {config.icon}
                </span>
              </div>
            )}
          </div>
          <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full ${config.bgColor} border-4 border-surface-container-high flex items-center justify-center shadow-lg`}>
             <span className={`material-symbols-outlined text-xl ${config.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {config.icon}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className={`text-headline-md font-bold text-center mb-2 ${config.color}`}>
          {config.title}
        </h2>
        <p className="text-body-sm text-on-surface-variant text-center mb-1">{config.subtitle}</p>
        <p className="text-xs text-outline text-center mb-6">
          vs {opponentName} — {reason}
        </p>

        {/* Divider */}
        <div className="border-t border-outline-variant mb-6" />

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full bg-primary text-on-primary hover:brightness-110 active:brightness-90 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Play Again
          </button>
          <Link
            href="/"
            className="w-full bg-surface-variant text-on-surface hover:bg-surface-bright border border-outline-variant py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 text-center"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Lobby
          </Link>
        </div>
      </div>
    </div>
  )
}
