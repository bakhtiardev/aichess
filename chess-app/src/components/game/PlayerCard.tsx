'use client'

interface PlayerCardProps {
  name: string
  isAI: boolean
  isThinking: boolean
  timeLeft: number
  isActive: boolean
  iconName?: string
  elo?: number
  avatarUrl?: string
}

interface PlayerCardProps {
  name: string
  isAI: boolean
  isThinking: boolean
  timeLeft: number
  isActive: boolean
  elo?: number
  avatarUrl?: string
  capturedPieces?: string[]
  materialAdvantage?: number
  side: 'top' | 'bottom'
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
  elo,
  avatarUrl,
  capturedPieces = [],
  materialAdvantage = 0,
  side,
}: PlayerCardProps) {
  const isLowTime = timeLeft < 30 && timeLeft > 0

  return (
    <div className={`w-full max-w-[560px] md:max-w-[640px] xl:max-w-[720px] mx-auto flex items-center justify-between px-1 py-1 transition-all duration-200`}>
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Avatar & Thinking Indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded overflow-hidden border border-outline-variant bg-surface-container-high">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <span className="material-symbols-outlined text-primary text-xl">
                  {isAI ? 'smart_toy' : 'person'}
                </span>
              </div>
            )}
          </div>
          {isThinking && (
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center border-2 border-background">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          )}
          {isActive && !isThinking && (
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center border-2 border-background">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          )}
        </div>

        {/* Info & Captured Pieces */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-sm font-bold text-on-surface truncate">
              {name}
            </span>
            {elo && (
              <span className="text-on-surface-variant/70 text-[11px] font-medium">
                ({elo})
              </span>
            )}
            {/* Connection dot (mock) */}
            <div className="w-2 h-2 rounded-full bg-green-500 opacity-80" />
          </div>

          {/* Captured Pieces Row */}
          <div className="flex items-center gap-1 h-5 mt-0.5">
            <div className="flex -space-x-1 items-center overflow-hidden">
              {capturedPieces.map((p, i) => (
                <img
                  key={i}
                  src={`https://lichess1.org/assets/piece/cburnett/${side === 'top' ? 'w' : 'b'}${p.toUpperCase()}.svg`}
                  alt={p}
                  className="w-4 h-4 opacity-80 grayscale-[0.2] drop-shadow-[0_0_0.5px_#fff] drop-shadow-[0_0_0.5px_#fff]"
                />
              ))}
            </div>
            {materialAdvantage > 0 && (
              <span className="text-[10px] font-bold text-on-surface-variant ml-1">
                +{materialAdvantage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timer */}
      <div
        className={`min-w-[70px] flex items-center justify-center px-2.5 py-1.5 rounded font-mono text-lg font-bold transition-all duration-300 ${isActive
          ? isLowTime
            ? 'bg-error text-white shadow-[0_0_15px_rgba(186,26,26,0.3)]'
            : 'bg-white text-black shadow-md scale-105'
          : 'bg-[#312e2b] text-[#989795]'
          }`}
      >
        {formatTime(timeLeft)}
      </div>
    </div>
  )
}
