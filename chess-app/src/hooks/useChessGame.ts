'use client'

import { useState, useCallback, useEffect } from 'react'
import { Chess, type Move } from 'chess.js'

export interface ChessGameState {
  fen: string
  history: Move[]
  pgn: string
  turn: 'w' | 'b'
  isCheck: boolean
  isCheckmate: boolean
  isDraw: boolean
  isGameOver: boolean
  lastMove: Move | null
}

export interface UseChessGameReturn {
  game: Chess
  state: ChessGameState
  makeMove: (from: string, to: string, promotion?: string) => boolean
  resetGame: () => void
  getLegalMoves: (square: string) => string[]
  loadFen: (fen: string) => boolean
}

function getGameState(chess: Chess, lastMove: Move | null): ChessGameState {
  return {
    fen: chess.fen(),
    history: chess.history({ verbose: true }),
    pgn: chess.pgn(),
    turn: chess.turn(),
    isCheck: chess.inCheck(),
    isCheckmate: chess.isCheckmate(),
    isDraw: chess.isDraw(),
    isGameOver: chess.isGameOver(),
    lastMove,
  }
}

export function useChessGame(): UseChessGameReturn {
  const [game] = useState(() => new Chess())
  const [state, setState] = useState<ChessGameState>(() => getGameState(game, null))

  const loadFen = useCallback(
    (fen: string): boolean => {
      try {
        game.load(fen)
        setState(getGameState(game, null))
        return true
      } catch {
        return false
      }
    },
    [game]
  )

  const makeMove = useCallback(
    (from: string, to: string, promotion = 'q'): boolean => {
      try {
        const move = game.move({ from, to, promotion })
        if (move) {
          setState(getGameState(game, move))

          // Play sounds
          if (typeof window !== 'undefined') {
            let soundType = 'move'
            if (move.captured) soundType = 'capture'
            if (game.inCheck()) soundType = 'check'
            
            const audio = new Audio(`/sounds/${soundType}.mp3`)
            audio.play().catch(() => {})
          }

          return true
        }
        return false
      } catch {
        return false
      }
    },
    [game]
  )

  const resetGame = useCallback(() => {
    game.reset()
    setState(getGameState(game, null))
  }, [game])

  const getLegalMoves = useCallback(
    (square: string): string[] => {
      const moves = game.moves({ square: square as any, verbose: true })
      return moves.map((m) => (m as Move).to)
    },
    [game]
  )

  return { game, state, makeMove, resetGame, getLegalMoves, loadFen }
}
