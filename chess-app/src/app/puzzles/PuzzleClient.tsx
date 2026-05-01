'use client'

import { useState, useEffect, useCallback } from 'react'
import { Chess } from 'chess.js'
import ChessBoardComponent from '@/components/game/ChessBoard'
import { useChessGame } from '@/hooks/useChessGame'
import Link from 'next/link'
import TopBar from '@/components/layout/TopBar'

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
  const [failedSquare, setFailedSquare] = useState<string | null>(null)
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [pendingPromotion, setPendingPromotion] = useState<{from: string, to: string} | null>(null)
  
  const gameHook = useChessGame()
  const { game, state, loadFen, makeMove } = gameHook

  const fetchPuzzle = useCallback(async () => {
    setLoading(true)
    setError(null)
    setStatus('playing')
    setMoveIndex(0)
    setHintMove(null)
    setFailedSquare(null)
    setPendingPromotion(null)
    
    try {
      const res = await fetch('/api/random-puzzle')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Server responded with ${res.status}`)
      }
      
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (!data.puzzle || !data.puzzle.fen) throw new Error('Invalid puzzle data received')
      
      setPuzzle(data)
      loadFen(data.puzzle.fen)
      
      // Fix orientation to the starting side to move
      const chess = new Chess(data.puzzle.fen)
      setOrientation(chess.turn() === 'w' ? 'white' : 'black')
    } catch (err: any) {
      setError(err.message || 'Could not load puzzle. Please try again later.')
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

    // Check if it's a promotion move
    const moves = game.moves({ verbose: true })
    const isPromotion = moves.some(m => m.from === from && m.to === to && m.promotion)
    
    // If it's a promotion and no piece was chosen yet, show the dialog
    if (isPromotion && !promotion) {
      setPendingPromotion({ from, to })
      return true // Return true to temporarily accept the drop, though it might snap back depending on react-chessboard version
    }

    // Just check if the move is legal first. If not legal, early return false
    const isLegal = moves.some(m => m.from === from && m.to === to && (!promotion || m.promotion === promotion))
    
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
      // Wrong move but legal chess move
      const success = makeMove(from, to, promotion)
      if (success) {
        setFailedSquare(to)
        
        setTimeout(() => {
          game.undo()
          loadFen(game.fen())
          setFailedSquare(null)
        }, 1000)
        
        return true
      }
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
        <p className="text-on-surface-variant font-medium">Loading puzzle...</p>
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

  const handlePromotionSelect = (piece: string) => {
    if (pendingPromotion) {
      const { from, to } = pendingPromotion
      setPendingPromotion(null)
      // Call handlePlayerMove again but this time with the promotion piece
      handlePlayerMove(from, to, piece)
    }
  }



  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <TopBar 
        title="Random Puzzle" 
        subtitle={puzzle ? `Rating: ${puzzle.puzzle.rating}` : 'Loading...'} 
      />

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 bg-background overflow-y-auto lg:overflow-hidden min-h-0">
        {/* Left: Board */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0 min-h-0">
          <div className="w-full max-w-[560px] md:max-w-[640px] xl:max-w-[720px] aspect-square flex-shrink-0 shadow-2xl relative">
            <ChessBoardComponent
              gameHook={gameHook}
              playerColor={orientation}
              onPlayerMove={handlePlayerMove}
               isAIThinking={status === 'playing' && moveIndex % 2 === 1}
              thinkingText="Opponent move..."
              customArrows={hintMove ? [{ from: hintMove.from, to: hintMove.to, color: 'rgba(255, 170, 0, 0.8)' }] : undefined}
              failedSquare={failedSquare}
            />
            
            {status === 'solved' && (
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center z-30 animate-in fade-in zoom-in duration-300">
                <div className="bg-surface-container-high border-2 border-primary p-8 rounded-2xl shadow-2xl text-center max-w-xs mx-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
                  </div>
                  <h2 className="text-headline-sm font-black text-on-surface mb-2">Solved!</h2>
                  <p className="text-on-surface-variant text-sm mb-6">Excellent move. You've successfully completed the puzzle.</p>
                  <button 
                    onClick={fetchPuzzle}
                    className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                  >
                    Next Puzzle
                  </button>
                </div>
              </div>
            )}

            {pendingPromotion && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 animate-in fade-in zoom-in duration-200">
                <div className="bg-surface-container-high border border-outline-variant p-6 rounded-2xl shadow-2xl text-center max-w-[280px] w-full">
                  <h3 className="text-title-md font-bold text-on-surface mb-4">Promote to</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'q', name: 'Queen', icon: orientation === 'white' ? '♕' : '♛' },
                      { id: 'r', name: 'Rook', icon: orientation === 'white' ? '♖' : '♜' },
                      { id: 'b', name: 'Bishop', icon: orientation === 'white' ? '♗' : '♝' },
                      { id: 'n', name: 'Knight', icon: orientation === 'white' ? '♘' : '♞' }
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => handlePromotionSelect(p.id)}
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-container hover:bg-primary/10 hover:border-primary/50 border border-transparent rounded-xl transition-all group"
                      >
                        <span className="text-4xl text-on-surface group-hover:text-primary transition-colors">{p.icon}</span>
                        <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors">{p.name}</span>
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setPendingPromotion(null)}
                    className="mt-4 text-sm text-on-surface-variant hover:text-on-surface transition-colors w-full py-2"
                  >
                    Cancel
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
                <span className="text-on-surface font-medium text-sm">Random Tactics</span>
              </div>
              <div className="pt-2">
                <p className="text-xs text-on-surface-variant italic leading-relaxed">
                  Puzzles are sourced from Chess.com. Solve them to improve your tactical awareness.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 flex-1">
            <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">lightbulb</span>
              Goal
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
              Find the best sequence of moves to solve the puzzle. Be careful, only the most precise moves will work!
            </p>
            
            <div className={`py-3 px-4 rounded-lg flex items-center justify-center gap-3 font-bold shadow-sm border ${
              orientation === 'white' 
                ? 'bg-surface-container-low border-outline-variant text-on-surface' 
                : 'bg-[#2b2b2b] border-[#404040] text-white'
            }`}>
              <div className={`w-5 h-5 rounded-full border border-outline ${orientation === 'white' ? 'bg-white' : 'bg-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]'}`} />
              Find best move for {orientation === 'white' ? 'White' : 'Black'}
            </div>
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
