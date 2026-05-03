import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Create a singleton Prisma client instance
const prisma = new (PrismaClient as any)()

export async function GET() {
  try {
    // Get total puzzle count for randomization
    const puzzleCount = await prisma.puzzle.count()
    
    if (puzzleCount === 0) {
      return NextResponse.json(
        { error: 'No puzzles available. Please run the import script first.' },
        { status: 503 }
      )
    }

    // Generate a random offset and fetch a puzzle
    const randomOffset = Math.floor(Math.random() * puzzleCount)
    const puzzle = await prisma.puzzle.findFirst({
      skip: randomOffset,
    })

    if (!puzzle) {
      return NextResponse.json({ error: 'Failed to fetch puzzle' }, { status: 500 })
    }

    // Parse the solution string back to array
    let solution: string[] = []
    try {
      const parsed = JSON.parse(puzzle.solution)
      solution = Array.isArray(parsed) ? parsed.filter(m => typeof m === 'string') : []
    } catch (e) {
      console.warn(`Failed to parse solution for puzzle ${puzzle.id}:`, e)
      solution = []
    }
    
    if (solution.length === 0) {
      return NextResponse.json({ error: 'Puzzle has no valid solution' }, { status: 500 })
    }

    // Return in Lichess-style format for backward compatibility
    const lichessStyleData = {
      puzzle: {
        id: puzzle.id,
        rating: puzzle.rating,
        themes: puzzle.themes ?? '',
        solution: solution,
        fen: puzzle.fen,
      },
    }

    return NextResponse.json(lichessStyleData)
  } catch (error) {
    console.error('Puzzle fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
