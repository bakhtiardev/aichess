'use client'

import type { Move } from 'chess.js'

interface GameSidebarProps {
  moveHistory: Move[]
  aiInsight: string
  isAIThinking: boolean
  onHint: () => void
  onResign: () => void
  onNewGame: () => void
  isGameOver: boolean
  error: string | null
}

export default function GameSidebar({
  moveHistory,
  aiInsight,
  isAIThinking,
  onHint,
  onResign,
  onNewGame,
  isGameOver,
  error,
}: GameSidebarProps) {
  // Group moves into pairs (white + black)
  const movePairs: Array<{ num: number; white: string; black: string }> = []
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: moveHistory[i]?.san || '',
      black: moveHistory[i + 1]?.san || '',
    })
  }

  const lastMoveIndex = moveHistory.length - 1

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 bg-surface-container-low rounded-lg border border-outline-variant flex flex-col overflow-hidden shadow-sm h-full min-h-[220px] max-h-[36rem] lg:max-h-[calc(100dvh-6rem)] lg:sticky lg:top-4">
      {/* Move History */}
      <div className="flex flex-col flex-1 overflow-hidden border-b border-outline-variant">
        <div className="px-3 py-2 sm:px-4 sm:py-3 border-b border-outline-variant bg-surface-container-high flex justify-between items-center gap-2">
          <h3 className="text-[11px] sm:text-label-bold font-bold text-on-surface uppercase tracking-wider truncate">Move History</h3>
          <div className="flex gap-0.5 shrink-0">
            {(['first_page', 'navigate_before', 'navigate_next', 'last_page'] as const).map((icon) => (
              <button
                key={icon}
                className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded transition-colors"
              >
                <span className="material-symbols-outlined text-base">{icon}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 text-[11px] sm:text-body-sm">
          {movePairs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-on-surface-variant text-xs">Make your first move!</p>
            </div>
          ) : (
            movePairs.map((pair, idx) => (
              <div
                key={pair.num}
                className={`grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)] items-center rounded-sm gap-1 ${
                  idx % 2 === 0 ? 'bg-surface-container' : ''
                }`}
              >
                <span className="px-1.5 py-1.5 text-on-surface-variant font-mono">{pair.num}.</span>
                <span
                  className={`min-w-0 px-1 py-1 rounded cursor-pointer hover:bg-surface-variant transition-colors truncate ${
                    lastMoveIndex === idx * 2 ? 'bg-primary text-on-primary font-semibold' : 'text-on-surface'
                  }`}
                >
                  {pair.white}
                </span>
                <span
                  className={`min-w-0 px-1 py-1 rounded cursor-pointer hover:bg-surface-variant transition-colors truncate ${
                    lastMoveIndex === idx * 2 + 1 ? 'bg-primary text-on-primary font-semibold' : 'text-on-surface'
                  }`}
                >
                  {pair.black || (isAIThinking && lastMoveIndex === idx * 2 ? '...' : '')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="p-2.5 sm:p-4 flex flex-col gap-2.5">
        <h3 className="text-label-bold font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            smart_toy
          </span>
          AI Insights
        </h3>

        {/* Error display */}
        {error && (
          <div className="bg-error-container/20 border border-error/30 rounded-lg p-3">
            <p className="text-body-sm text-error text-xs">{error}</p>
          </div>
        )}

        {/* Insight bubble */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-3 relative min-h-[64px]">
          <div className="absolute -top-2 left-4 w-3 h-3 bg-surface-container border-t border-l border-outline-variant rotate-45" />
          {isAIThinking ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-xs text-on-surface-variant">Calculating best move...</span>
            </div>
          ) : (
            <p className="text-body-sm text-on-surface text-xs leading-relaxed">
              {aiInsight || 'Start the game to receive AI insights on the position.'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={onHint}
            disabled={isAIThinking || isGameOver}
            className="bg-surface-variant hover:bg-surface-bright border border-outline-variant text-on-surface py-2 rounded-lg text-label-bold font-bold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
              lightbulb
            </span>
            Hint
          </button>
          {isGameOver ? (
            <button
              onClick={onNewGame}
              className="bg-primary hover:brightness-110 text-on-primary py-2 rounded-lg text-label-bold font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              New Game
            </button>
          ) : (
            <button
              onClick={onResign}
              disabled={isAIThinking}
              className="bg-error-container/40 hover:bg-error-container text-error border border-error/20 py-2 rounded-lg text-label-bold font-bold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
                flag
              </span>
              Resign
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
