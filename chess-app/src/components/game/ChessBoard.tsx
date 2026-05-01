'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Square } from 'chess.js'
import type { UseChessGameReturn } from '@/hooks/useChessGame'

interface ChessBoardProps {
  gameHook: UseChessGameReturn
  playerColor: 'white' | 'black'
  isAIThinking: boolean
  onPlayerMove: (from: string, to: string, promotion?: string) => boolean
  disabled?: boolean
  thinkingText?: string
  customArrows?: { from: string, to: string, color?: string }[]
  failedSquare?: string | null
  boardTheme?: string
  pieceSet?: string
}

export default function ChessBoardComponent({
  gameHook,
  playerColor,
  isAIThinking,
  onPlayerMove,
  disabled = false,
  thinkingText = 'AI is thinking...',
  customArrows = [],
  failedSquare = null,
  boardTheme = 'green',
  pieceSet = 'cburnett',
}: ChessBoardProps) {
  const { state, getLegalMoves } = gameHook
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [legalSquares, setLegalSquares] = useState<Record<string, { background: string; borderRadius?: string }>>({})
  
  const THEMES: Record<string, { dark: string; light: string }> = {
    green: { dark: '#779556', light: '#ebecd0' },
    blue: { dark: '#4b7399', light: '#eae9d2' },
    wood: { dark: '#b58863', light: '#f0d9b5' },
    dark: { dark: '#4a4a4a', light: '#707070' },
    purple: { dark: '#8877b7', light: '#efefef' },
  }

  const theme = THEMES[boardTheme] || THEMES.green

  const customPieces = useMemo(() => {
    if (pieceSet === 'standard') return undefined

    const pieceTypes = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK']
    const result: Record<string, (props?: { fill?: string; square?: string; svgStyle?: React.CSSProperties }) => React.JSX.Element> = {}

    pieceTypes.forEach(p => {
      result[p] = ({ svgStyle } = {}) => (
        <img
          src={`https://lichess1.org/assets/piece/${pieceSet}/${p}.svg`}
          alt={p}
          style={{
            ...svgStyle,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      )
    })
    return result
  }, [pieceSet])

  const isPlayerTurn =
    (playerColor === 'white' && state.turn === 'w') ||
    (playerColor === 'black' && state.turn === 'b')

  const canInteract = isPlayerTurn && !isAIThinking && !disabled && !state.isGameOver

  // Highlight squares
  const customSquareStyles: Record<string, React.CSSProperties> = {}

  // Last move highlight
  if (state.lastMove) {
    customSquareStyles[state.lastMove.from] = {
      backgroundColor: 'rgba(159, 214, 104, 0.25)',
    }
    customSquareStyles[state.lastMove.to] = {
      backgroundColor: 'rgba(159, 214, 104, 0.35)',
    }
  }

  // Selected square
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: 'rgba(159, 214, 104, 0.5)',
    }
  }

  // Failed square highlight
  if (failedSquare) {
    customSquareStyles[failedSquare] = {
      backgroundColor: 'rgba(239, 68, 68, 0.4)',
    }
  }

  // Legal move dots
  Object.entries(legalSquares).forEach(([sq, style]) => {
    customSquareStyles[sq] = {
      ...customSquareStyles[sq],
      background: style.background,
      borderRadius: style.borderRadius,
    }
  })

  const onSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (!canInteract) return

      if (selectedSquare) {
        // Try to make a move
        const success = onPlayerMove(selectedSquare, square)
        if (success) {
          setSelectedSquare(null)
          setLegalSquares({})
          return
        }
      }

      // Select the square if it has a piece of the player's color
      const moves = getLegalMoves(square)
      if (moves.length > 0) {
        setSelectedSquare(square)
        const highlights: Record<string, { background: string; borderRadius?: string }> = {}
        moves.forEach((sq) => {
          // Check if target square has a piece (capture)
          const piece = gameHook.game.get(sq as Square)
          if (piece) {
            highlights[sq] = {
              background: 'radial-gradient(circle, transparent 0%, transparent 68%, rgba(0, 0, 0, 0.18) 69%, rgba(0, 0, 0, 0.18) 100%)',
              borderRadius: '0',
            }
          } else {
            highlights[sq] = {
              background: 'radial-gradient(circle, rgba(0, 0, 0, 0.18) 22%, transparent 23%)',
              borderRadius: '0',
            }
          }
        })
        setLegalSquares(highlights)
      } else {
        setSelectedSquare(null)
        setLegalSquares({})
      }
    },
    [canInteract, selectedSquare, onPlayerMove, getLegalMoves, gameHook.game]
  )

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: { sourceSquare: string, targetSquare: string | null }): boolean => {
      if (!canInteract || !targetSquare) return false
      setSelectedSquare(null)
      setLegalSquares({})
      return onPlayerMove(sourceSquare, targetSquare)
    },
    [canInteract, onPlayerMove]
  )

  return (
    <div className="w-full flex-1 min-h-0 flex items-center justify-center">
      <div
        style={{ maxHeight: '720px', maxWidth: '720px' }}
        className={`aspect-square h-full max-h-full max-w-full relative rounded-lg overflow-hidden border-4 ${state.isCheck && !state.isGameOver
          ? 'border-error shadow-[0_0_30px_rgba(255,180,171,0.3)]'
          : 'border-surface-container-highest'
          } shadow-2xl transition-all duration-300`}
      >
        <Chessboard
          key={pieceSet}
          options={{
            position: state.fen,
            onPieceDrop,
            onSquareClick,
            boardOrientation: playerColor,
            darkSquareStyle: { backgroundColor: theme.dark },
            lightSquareStyle: { backgroundColor: theme.light },
            pieces: customPieces,
            squareStyles: customSquareStyles,
            arrows: customArrows.map(a => ({ startSquare: a.from, endSquare: a.to, color: a.color || 'rgb(255, 170, 0)' })),
            allowDrawingArrows: true,
            animationDurationInMs: 150,
            squareRenderer: ({ children, square, style }) => (
              <div
                style={{ ...style, position: 'relative' }}
                className={failedSquare === square ? 'border-2 border-error z-10' : ''}
              >
                {children}
                {failedSquare === square && (
                  <div className="absolute top-0 right-0 z-[100] translate-x-1/4 -translate-y-1/4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span
                        className="material-symbols-outlined text-[#f25e5e] text-[22px] md:text-[28px] lg:text-[32px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        cancel
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ),
          }}
        />
        {isAIThinking && (
          <div className="absolute inset-0 bg-black/10 flex items-end justify-center pb-8 pointer-events-none">
            <div className="bg-surface-container-high/90 backdrop-blur-sm border border-outline-variant rounded-full px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-body-sm text-on-surface-variant font-medium">{thinkingText}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
