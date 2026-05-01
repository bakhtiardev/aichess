'use client'

import { useState, useEffect, useCallback } from 'react'
import { Chess } from 'chess.js'
import ChessBoardComponent from '@/components/game/ChessBoard'
import { useChessGame } from '@/hooks/useChessGame'
import Link from 'next/link'

interface LichessPuzzle {
  puzzle: {
    id: string
    rating: number
    solution: string[]
    fen: string
  }
}

export default function PuzzleClient() {
  const [puzzle, setPuzzle] = useState<LichessPuzzle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [moveIndex, setMoveIndex] = useState(0)
  const [status, setStatus] = useState<'playing' | 'solved' | 'failed'>('playing')
  const [hintMove, setHintMove] = useState<{ from: string; to: string } | null>(null)
  
  const gameHook = useChessGame()
  const { game, state, loadFen, makeMove } = gameHook

  const fetchPuzzle = useCallback(async () => {
    setLoading(true)
    setError(null)
    setStatus('playing')
    setMoveIndex(0)
    setHintMove(null)
    
    try {
      const res = await fetch('/api/daily-puzzle')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Server responded with ${res.status}`)
      }
      
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (!data.puzzle || !data.puzzle.fen) throw new Error('Invalid puzzle data received')
      
      setPuzzle(data)
      loadFen(data.puzzle.fen)
    } catch (err: any) {
      setError(err.message || 'Could not load daily puzzle. Please try again later.')
      console.error('Puzzle loading failed:', err)
    } finally {
      setLoading(false)
    }
  }, [loadFen])

  useEffect(() => {
    fetchPuzzle()
  }, [fetchPuzzle])

  const handlePlayerMove = (from: string, to: string, promotion?: string): boolean => {
    if (!puzzle || status !== 'playing') return false

    // Just check if the move is legal first. If not legal, early return false
    const moves = game.moves({ verbose: true })
    const isLegal = moves.some(m => m.from === from && m.to === to)
    
    if (!isLegal) {
      return false 
    }

    setHintMove(null)

    const expectedMove = puzzle.puzzle.solution[moveIndex]
    // UCI format: e2e4 or e7e8q
    const moveNotation = `${from}${to}${promotion ? promotion : ''}`

    if (moveNotation === expectedMove) {
      const success = makeMove(from, to, promotion)
      if (success) {
        const nextIndex = moveIndex + 1
        if (nextIndex >= puzzle.puzzle.solution.length) {
          setStatus('solved')
        } else {
          setMoveIndex(nextIndex)
        }
        return true
      }
    } else {
      setStatus('failed')
    }
    return false
  }

  // Effect to handle AI response in the puzzle solution
  useEffect(() => {
    if (puzzle && status === 'playing' && moveIndex < puzzle.puzzle.solution.length) {
      // AI moves are at odd indices (1, 3, 5...) in Lichess solution array
      if (moveIndex % 2 === 1) {
        const nextMove = puzzle.puzzle.solution[moveIndex]
        const from = nextMove.substring(0, 2)
        const to = nextMove.substring(2, 4)
        const promotion = nextMove.length === 5 ? nextMove[4] : undefined
        
        const timer = setTimeout(() => {
          makeMove(from, to, promotion)
          setMoveIndex(moveIndex + 1)
        }, 600)
        return () => clearTimeout(timer)
      }
    }
  }, [moveIndex, puzzle, status, makeMove])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-medium">Loading daily puzzle...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-background p-6 text-center">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-2 border border-error/20">
          <span className="material-symbols-outlined text-error text-4xl">error</span>
        </div>
        <div>
          <h2 className="text-headline-sm text-on-surface font-bold mb-2">Could not load puzzle</h2>
          <p className="text-on-surface-variant max-w-md text-sm leading-relaxed mb-6">{error}</p>
          <button 
            onClick={fetchPuzzle}
            className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const playerColor = state.turn === 'w' ? 'white' : 'black'

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <header className="flex justify-between items-center h-14 px-6 w-full bg-surface-container border-b border-outline-variant flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
          <h1 className="text-sm font-bold text-primary">Daily Puzzle</h1>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface-variant text-sm">Rating: {puzzle?.puzzle.rating}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 bg-background overflow-y-auto lg:overflow-hidden min-h-0">
        {/* Left: Board */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0 min-h-0">
          <div className="w-full max-w-[560px] md:max-w-[640px] xl:max-w-[720px] aspect-square flex-shrink-0 shadow-2xl relative">
            <ChessBoardComponent
              gameHook={gameHook}
              playerColor={playerColor}
              onPlayerMove={handlePlayerMove}
              isAIThinking={status === 'playing' && moveIndex % 2 === 1}
              thinkingText="Opponent move..."
              customArrows={hintMove ? [{ from: hintMove.from, to: hintMove.to, color: 'rgba(255, 170, 0, 0.8)' }] : undefined}
            />
            
            {status === 'solved' && (
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center z-30 animate-in fade-in zoom-in duration-300">
                <div className="bg-surface-container-high border-2 border-primary p-8 rounded-2xl shadow-2xl text-center max-w-xs mx-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
                  </div>
                  <h2 className="text-headline-sm font-black text-on-surface mb-2">Solved!</h2>
                  <p className="text-on-surface-variant text-sm mb-6">Excellent move. You've successfully completed the daily puzzle.</p>
                  <button 
                    onClick={fetchPuzzle}
                    className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                  >
                    Next Puzzle
                  </button>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="absolute inset-0 bg-error/10 backdrop-blur-[2px] flex items-center justify-center z-30 animate-in fade-in zoom-in duration-300">
                <div className="bg-surface-container-high border-2 border-error/30 p-8 rounded-2xl shadow-2xl text-center max-w-xs mx-4">
                  <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-error/20">
                    <span className="material-symbols-outlined text-error text-4xl">close</span>
                  </div>
                  <h2 className="text-headline-sm font-black text-on-surface mb-2">Wrong Move</h2>
                  <p className="text-on-surface-variant text-sm mb-6">That wasn't the best move. Don't worry, try again!</p>
                  <button 
                    onClick={() => {
                      loadFen(puzzle!.puzzle.fen)
                      setMoveIndex(0)
                      setStatus('playing')
                      setHintMove(null)
                    }}
                    className="w-full bg-surface-variant text-on-surface py-3 rounded-lg font-bold hover:bg-surface-bright transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-surface-container-low rounded-xl border border-outline-variant p-6 shadow-sm">
            <h2 className="text-label-bold font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">extension</span>
              Puzzle Info
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                <span className="text-on-surface-variant text-sm">Difficulty</span>
                <span className="text-on-surface font-bold text-sm bg-surface-variant px-2 py-0.5 rounded">
                  {puzzle?.puzzle.rating} ELO
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                <span className="text-on-surface-variant text-sm">Theme</span>
                <span className="text-on-surface font-medium text-sm">Daily Challenge</span>
              </div>
              <div className="pt-2">
                <p className="text-xs text-on-surface-variant italic leading-relaxed">
                  Puzzles are sourced directly from Lichess. Solve them to improve your tactical awareness.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 flex-1">
            <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">lightbulb</span>
              Goal
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Find the best sequence of moves for {game.turn() === 'w' ? 'White' : 'Black'}. 
              Be careful, only the most precise moves will solve the puzzle!
            </p>
            
            <div className="mt-8">
               <button 
                onClick={() => {
                   if (puzzle && status === 'playing') {
                     const nextMove = puzzle.puzzle.solution[moveIndex]
                     setHintMove({
                       from: nextMove.substring(0, 2),
                       to: nextMove.substring(2, 4)
                     })
                   }
                }}
                className="w-full py-3 px-4 border border-primary/30 text-primary rounded-lg text-sm font-bold hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
               >
                 <span className="material-symbols-outlined text-sm">help_outline</span>
                 Show Hint
               </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
