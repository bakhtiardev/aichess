import { NextResponse } from 'next/server'
import { Chess } from 'chess.js'

export async function GET() {
  try {
    // We use Chess.com's random puzzle API and format it to match our Lichess-style interface
    const res = await fetch('https://api.chess.com/pub/puzzle/random', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Grandmaster-AI-Chess-Arena/1.0 (contact: github.com/bakhtiar)'
      },
      cache: 'no-store' // Always get a new puzzle
    })
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Chess.com' }, { status: res.status })
    }
    
    const data = await res.json()
    
    // Parse the PGN to extract the UCI solution sequence
    const chess = new Chess()
    chess.loadPgn(data.pgn)
    const history = chess.history({ verbose: true })
    const solution = history.map(m => m.from + m.to + (m.promotion || ''))

    // The Chess.com API doesn't return an exact ELO rating for the puzzle
    // We can just put a placeholder or derive a random one. Let's say 1500 for now.
    
    const lichessStyleData = {
      puzzle: {
        id: data.title, // using title as ID
        rating: 1500, // Placeholder
        solution: solution,
        fen: data.fen
      }
    }

    return NextResponse.json(lichessStyleData)
  } catch (error) {
    console.error('Puzzle fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
