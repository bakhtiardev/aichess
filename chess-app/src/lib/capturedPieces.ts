import { type Move } from 'chess.js'

export interface CapturedPieces {
  w: string[] // Pieces white has captured (black pieces)
  b: string[] // Pieces black has captured (white pieces)
  score: number // White's material advantage (positive for white, negative for black)
}

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
}

export function getCapturedPieces(history: Move[]): CapturedPieces {
  const whiteCaptured: string[] = []
  const blackCaptured: string[] = []
  let score = 0

  history.forEach((move) => {
    if (move.captured) {
      const piece = move.captured
      const value = PIECE_VALUES[piece] || 0

      if (move.color === 'w') {
        // White captured a black piece
        whiteCaptured.push(piece)
        score += value
      } else {
        // Black captured a white piece
        blackCaptured.push(piece)
        score -= value
      }
    }
  })

  // Sort pieces by value to display them nicely
  const sortOrder = ['q', 'r', 'b', 'n', 'p']
  whiteCaptured.sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b))
  blackCaptured.sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b))

  return {
    w: whiteCaptured,
    b: blackCaptured,
    score,
  }
}
