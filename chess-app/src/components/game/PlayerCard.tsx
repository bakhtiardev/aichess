'use client'

interface PlayerCardProps {
  name: string
  isAI: boolean
  isThinking: boolean
  timeLeft: number
  isActive: boolean
  iconName?: string
  elo?: number
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function PlayerCard({
  name,
  isAI,
  isThinking,
  timeLeft,
  isActive,
  iconName = 'person',
  elo,
}: PlayerCardProps) {
  return (
    <div
      className={`w-full flex-shrink-0 max-w-[560px] md:max-w-[640px] xl:max-w-[720px] mx-auto flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-200 ${isActive
        ? 'bg-surface-container border-primary/30 shadow-sm'
        : 'bg-surface-container-low border-outline-variant'
        }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${isActive ? 'border-primary/40 bg-primary/10' : 'border-outline-variant bg-surface-bright'
            }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isAI ? 'smart_toy' : iconName}
          </span>
        </div>

        {/* Name & Status */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-label-bold font-bold text-on-surface uppercase tracking-wide text-xs">
              {name}
            </span>
            {elo && (
              <span className="bg-surface-variant text-on-surface-variant px-1.5 py-0.5 rounded text-[10px] font-bold">
                {elo}
              </span>
            )}
          </div>
          <div className="h-4 mt-0.5">
            {isThinking ? (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[11px] text-on-surface-variant">Thinking...</p>
              </div>
            ) : isActive ? (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <p className="text-[11px] text-primary font-medium">Your turn</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Timer */}
      <div
        className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold transition-colors ${timeLeft < 30
          ? 'bg-error/20 text-error border border-error/30'
          : isActive
            ? 'bg-surface-variant text-on-surface'
            : 'bg-surface-container-highest text-on-surface-variant'
          }`}
      >
        {formatTime(timeLeft)}
      </div>
    </div>
  )
}
