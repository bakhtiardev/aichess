import { NextRequest, NextResponse } from 'next/server'
import { Chess } from 'chess.js'

const MODEL_MAP: Record<string, string> = {
  'gemini-flash': 'gemini-1.5-flash',
  'gemini-pro': 'gemini-1.5-pro',
  'gemini-2-flash': 'gemini-2.0-flash',
}

async function callGemini(modelId: string, prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 10,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${response.status} — ${error}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return text.trim()
}

function extractMove(text: string): string {
  // Match UCI format: e2e4, e7e5, g1f3, etc. (4-5 chars)
  const uciMatch = text.match(/\b([a-h][1-8][a-h][1-8][qrbn]?)\b/i)
  if (uciMatch) return uciMatch[1].toLowerCase()

  // Match SAN format: e4, Nf3, O-O, etc.
  const sanMatch = text.match(/\b([KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?|O-O(?:-O)?)\b/)
  if (sanMatch) return sanMatch[1]

  return ''
}

function buildPrompt(fen: string, history: string[], playerColor: 'white' | 'black'): string {
  const historyStr = history.length > 0 ? history.join(' ') : 'No moves yet'
  return `You are a chess grandmaster playing as ${playerColor === 'white' ? 'White' : 'Black'}.

Current board position (FEN): ${fen}
Move history: ${historyStr}

Analyze the position and return the single best legal move in UCI format (example: e2e4, g1f3, e1g1 for castling).
Respond with ONLY the move in UCI format. Nothing else. No explanation.`
}

export async function POST(req: NextRequest) {
  try {
    const { fen, modelId, history } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured. Add it to .env.local' },
        { status: 500 }
      )
    }

    const geminiModel = MODEL_MAP[modelId] || 'gemini-1.5-flash'

    // Validate FEN
    const chess = new Chess(fen)
    const legalMoves = chess.moves({ verbose: true })

    if (legalMoves.length === 0) {
      return NextResponse.json({ error: 'No legal moves available' }, { status: 400 })
    }

    const playerColor = chess.turn() === 'w' ? 'white' : 'black'
    const prompt = buildPrompt(fen, history, playerColor)

    let chosenMove = ''
    let attempts = 0

    // Try up to 3 times to get a valid move from Gemini
    while (attempts < 3 && !chosenMove) {
      try {
        const rawResponse = await callGemini(geminiModel, prompt, apiKey)
        const extracted = extractMove(rawResponse)

        if (extracted) {
          // Try UCI format first
          if (extracted.length === 4 || extracted.length === 5) {
            const from = extracted.substring(0, 2)
            const to = extracted.substring(2, 4)
            const promotion = extracted.length === 5 ? extracted[4] : undefined

            const move = chess.move({ from, to, promotion: promotion as any })
            if (move) {
              chosenMove = extracted
              chess.undo()
            }
          } else {
            // Try SAN format
            const move = chess.move(extracted)
            if (move) {
              chosenMove = `${move.from}${move.to}${move.promotion || ''}`
              chess.undo()
            }
          }
        }
      } catch (err) {
        console.error(`Attempt ${attempts + 1} failed:`, err)
      }
      attempts++
    }

    // Fallback: pick a random legal move
    if (!chosenMove) {
      const random = legalMoves[Math.floor(Math.random() * legalMoves.length)]
      chosenMove = `${random.from}${random.to}${random.promotion || ''}`
    }

    return NextResponse.json({ move: chosenMove })
  } catch (error) {
    console.error('AI move error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
