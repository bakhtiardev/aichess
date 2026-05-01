'use client'

import Link from 'next/link'

interface ResultModalProps {
  result: 'win' | 'loss' | 'draw' | 'resigned'
  reason: string
  opponentName: string
  onPlayAgain: () => void
}

const RESULT_CONFIG = {
  win: {
    title: '🏆 Victory!',
    subtitle: "Brilliant chess. You've outplayed the AI!",
    color: 'text-primary',
    borderColor: 'border-primary/30',
    bgColor: 'bg-primary/10',
    icon: 'emoji_events',
    iconColor: 'text-primary',
  },
  loss: {
    title: '♟ Defeated',
    subtitle: 'The AI had the upper hand. Study the game and try again!',
    color: 'text-error',
    borderColor: 'border-error/30',
    bgColor: 'bg-error/10',
    icon: 'sentiment_dissatisfied',
    iconColor: 'text-error',
  },
  draw: {
    title: '🤝 Draw',
    subtitle: 'An equal contest. Well-played to both sides.',
    color: 'text-secondary',
    borderColor: 'border-secondary/30',
    bgColor: 'bg-secondary/10',
    icon: 'handshake',
    iconColor: 'text-secondary',
  },
  resigned: {
    title: '🏳 Resigned',
    subtitle: 'You resigned. Come back stronger!',
    color: 'text-on-surface-variant',
    borderColor: 'border-outline-variant',
    bgColor: 'bg-surface-container',
    icon: 'flag',
    iconColor: 'text-on-surface-variant',
  },
}

export default function ResultModal({ result, reason, opponentName, onPlayAgain }: ResultModalProps) {
  const config = RESULT_CONFIG[result]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className={`bg-surface-container-high border ${config.borderColor} rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-slide-up`}
      >
        {/* Icon */}
        <div className={`w-16 h-16 mx-auto mb-5 rounded-full ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
          <span
            className={`material-symbols-outlined text-3xl ${config.iconColor}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {config.icon}
          </span>
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
