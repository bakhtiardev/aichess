import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://lichess.org/api/puzzle/daily', {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Lichess' }, { status: res.status })
    }
    
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Puzzle fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
