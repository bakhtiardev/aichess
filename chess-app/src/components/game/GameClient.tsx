'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useChessGame } from '@/hooks/useChessGame'
import { usePlayerProfile } from '@/hooks/usePlayerProfile'
import { AI_OPPONENTS } from '@/lib/aiOpponents'
import ChessBoardComponent from '@/components/game/ChessBoard'
import PlayerCard from '@/components/game/PlayerCard'
import GameSidebar from '@/components/game/GameSidebar'
import ResultModal from '@/components/game/ResultModal'
import Link from 'next/link'

const INITIAL_TIME = 10 * 60 // 10 minutes in seconds

interface GameClientProps {
  modelId: string
}

export default function GameClient({ modelId }: GameClientProps) {
  const router = useRouter()
  const opponent = AI_OPPONENTS.find((o) => o.id === modelId)
  const gameHook = useChessGame()
  const { state, makeMove, resetGame } = gameHook
  const { recordGame, profile } = usePlayerProfile()

  const [isAIThinking, setIsAIThinking] = useState(false)
  const [aiInsight, setAiInsight] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [gameResult, setGameResult] = useState<'win' | 'loss' | 'draw' | 'resigned'>('draw')
  const [gameResultReason, setGameResultReason] = useState('')
  const [resigned, setResigned] = useState(false)

  // Timers
  const [playerTime, setPlayerTime] = useState(INITIAL_TIME)
  const [aiTime, setAiTime] = useState(INITIAL_TIME)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const playerColor: 'white' | 'black' = 'white'
  const isPlayerTurn = state.turn === 'w' && playerColor === 'white'

  // Timer logic
  useEffect(() => {
    if (state.isGameOver || resigned || showResult) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      if (isPlayerTurn && !isAIThinking) {
        setPlayerTime((t) => {
          if (t <= 1) {
            handleGameEnd('loss', 'Time out')
            return 0
          }
          return t - 1
        })
      } else if (!isPlayerTurn) {
        setAiTime((t) => Math.max(0, t - 1))
      }
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlayerTurn, isAIThinking, state.isGameOver, resigned, showResult])

  const handleGameEnd = useCallback(
    (result: 'win' | 'loss' | 'draw' | 'resigned', reason: string) => {
      if (timerRef.current) clearInterval(timerRef.current)
      setGameResult(result)
      setGameResultReason(reason)
      setShowResult(true)
      recordGame({
        opponent: opponent?.name || 'AI',
        result: result === 'resigned' ? 'loss' : result,
        accuracy: Math.floor(Math.random() * 15) + 82, // placeholder
        opening: state.history.length > 0 ? 'Various Opening' : 'Starting Position',
      })
    },
    [opponent, state.history.length, recordGame]
  )

  // Check game over
  useEffect(() => {
    if (state.isGameOver && !showResult && !resigned) {
      if (state.isCheckmate) {
        const winner = state.turn === 'w' ? 'black' : 'white'
        handleGameEnd(winner === playerColor ? 'win' : 'loss', 'Checkmate!')
      } else if (state.isDraw) {
        handleGameEnd('draw', 'Draw by repetition / stalemate')
      }
    }
  }, [state.isGameOver, state.isCheckmate, state.isDraw, state.turn, showResult, resigned, playerColor, handleGameEnd])

  // AI turn trigger
  useEffect(() => {
    if (state.turn === 'b' && !state.isGameOver && !resigned && !isAIThinking) {
      triggerAIMove()
    }
  }, [state.turn, state.isGameOver, resigned])

  const triggerAIMove = async () => {
    if (!opponent) return
    setIsAIThinking(true)
    setError(null)

    try {
      const history = state.history.map((m) => `${m.from}${m.to}`)
      const res = await fetch('/api/ai-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fen: state.fen,
          modelId: opponent.id,
          history,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'AI failed to respond')
        // Make a random move as fallback
        const legalMoves = gameHook.game.moves({ verbose: true })
        if (legalMoves.length > 0) {
          const random = legalMoves[Math.floor(Math.random() * legalMoves.length)]
          makeMove(random.from, random.to, random.promotion)
        }
        return
      }

      const move = data.move as string
      if (move && move.length >= 4) {
        const from = move.substring(0, 2)
        const to = move.substring(2, 4)
        const promotion = move.length === 5 ? move[4] : undefined
        const success = makeMove(from, to, promotion)
        if (!success) {
          // fallback
          const legalMoves = gameHook.game.moves({ verbose: true })
          if (legalMoves.length > 0) {
            const random = legalMoves[Math.floor(Math.random() * legalMoves.length)]
            makeMove(random.from, random.to, random.promotion)
          }
        } else {
          // Generate insight
          const insights = [
            `I played ${move} to strengthen my position.`,
            `${move} develops my piece and controls the center.`,
            `I chose ${move} to create threats on your position.`,
            `${move} keeps the tension in the position.`,
            `After ${move}, my pieces are well-coordinated.`,
          ]
          setAiInsight(insights[Math.floor(Math.random() * insights.length)])
        }
      }
    } catch (err) {
      setError('Network error — check your connection')
      console.error(err)
    } finally {
      setIsAIThinking(false)
    }
  }

  const handlePlayerMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (isAIThinking || state.turn !== 'w') return false
      return makeMove(from, to, promotion)
    },
    [isAIThinking, state.turn, makeMove]
  )

  const handleHint = async () => {
    if (!opponent) return
    setAiInsight('💡 Hint: Try to control the center and develop your pieces...')
  }

  const handleResign = () => {
    setResigned(true)
    handleGameEnd('resigned', 'You resigned')
  }

  const handlePlayAgain = () => {
    setShowResult(false)
    setResigned(false)
    setIsAIThinking(false)
    setAiInsight('')
    setError(null)
    setPlayerTime(INITIAL_TIME)
    setAiTime(INITIAL_TIME)
    resetGame()
  }

  if (!opponent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-headline-md text-on-surface mb-2">Opponent not found</h2>
          <Link href="/" className="text-primary hover:underline">Back to Lobby</Link>
        </div>
      </div>
    )
  }

  const aiIsActive = state.turn === 'b' && !state.isGameOver
  const playerIsActive = state.turn === 'w' && !state.isGameOver

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <header className="flex justify-between items-center h-14 px-6 w-full bg-surface-container border-b border-outline-variant flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
          <h1 className="text-sm font-bold text-primary">Chess AI Hub</h1>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface-variant text-sm">vs {opponent.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            state.turn === 'w' ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'
          }`}>
            <div className={`w-2 h-2 rounded-full ${state.turn === 'w' ? 'bg-primary' : 'bg-on-surface-variant'}`} />
            {state.turn === 'w' ? 'Your Turn' : 'AI Turn'}
          </div>
        </div>
      </header>

      {/* Main Game Canvas */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 bg-background overflow-y-auto lg:overflow-hidden min-h-0">
        {/* Left: Board + Player Cards */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 min-w-0 min-h-0">
          {/* AI Player (top) */}
          <PlayerCard
            name={opponent.name}
            isAI={true}
            isThinking={isAIThinking}
            timeLeft={aiTime}
            isActive={aiIsActive}
            elo={opponent.elo}
          />

          {/* Chess Board */}
          <ChessBoardComponent
            gameHook={gameHook}
            playerColor={playerColor}
            isAIThinking={isAIThinking}
            onPlayerMove={handlePlayerMove}
            disabled={showResult}
          />

          {/* Human Player (bottom) */}
          <PlayerCard
            name={profile.username}
            isAI={false}
            isThinking={false}
            timeLeft={playerTime}
            isActive={playerIsActive && !isAIThinking}
            elo={profile.elo}
            avatarUrl={profile.avatarUrl}
          />
        </div>

        {/* Right: Sidebar */}
        <GameSidebar
          moveHistory={state.history}
          aiInsight={aiInsight}
          isAIThinking={isAIThinking}
          onHint={handleHint}
          onResign={handleResign}
          onNewGame={handlePlayAgain}
          isGameOver={state.isGameOver || resigned}
          error={error}
        />
      </main>

      {/* Result Modal */}
      {showResult && (
        <ResultModal
          result={gameResult}
          reason={gameResultReason}
          opponentName={opponent.name}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  )
}
