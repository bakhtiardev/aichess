import { NextRequest, NextResponse } from 'next/server'
import { Chess } from 'chess.js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { AI_OPPONENTS } from '@/lib/aiOpponents'

// ─── Chess prompt builder ──────────────────────────────────────────────────

function buildPrompt(fen: string, history: string[], playerColor: 'white' | 'black'): string {
  const historyStr = history.length > 0 ? history.join(' ') : 'No moves yet'
  return `You are a chess grandmaster playing as ${playerColor === 'white' ? 'White' : 'Black'}.

Current board position (FEN): ${fen}
Move history: ${historyStr}

Analyze the position and return the single best legal move in UCI format (example: e2e4, g1f3, e1g1 for castling).
Respond with ONLY the move in UCI format. Nothing else. No explanation.`
}

// ─── Move extractor ─────────────────────────────────────────────────────────

function extractMove(text: string): string {
  const uciMatch = text.match(/\b([a-h][1-8][a-h][1-8][qrbn]?)\b/i)
  if (uciMatch) return uciMatch[1].toLowerCase()

  const sanMatch = text.match(/\b([KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?|O-O(?:-O)?)\b/)
  if (sanMatch) return sanMatch[1]

  return ''
}

// ─── Gemini (SDK) ───────────────────────────────────────────────────────────

const GEMINI_MODEL_MAP: Record<string, string> = {
  'gemini-flash': 'gemini-2.0-flash',
  'gemini-1.5-flash': 'gemini-2.0-flash',
  'gemini-pro': 'gemini-2.5-pro',
  'gemini-1.5-pro': 'gemini-2.5-pro',
  'gemini-2-flash': 'gemini-2.0-flash',
  'gemini-2.0-flash': 'gemini-2.0-flash',
}

async function callGemini(modelId: string, prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured. Add it to .env.local')

  const genAI = new GoogleGenerativeAI(apiKey)
  const modelName = GEMINI_MODEL_MAP[modelId] || 'gemini-1.5-flash'
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: { temperature: 0.3, maxOutputTokens: 10 }
  })

  try {
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error: any) {
    if (error.message?.includes('404')) {
      // Fallback to -latest if the base model name fails
      const fallbackModel = genAI.getGenerativeModel({ 
        model: `${modelName}-latest`,
        generationConfig: { temperature: 0.3, maxOutputTokens: 10 }
      })
      const result = await fallbackModel.generateContent(prompt)
      return result.response.text()
    }
    throw error
  }
}

// ─── Groq (free API) ─────────────────────────────────────────────────────────

const GROQ_MODEL_MAP: Record<string, string> = {
  'groq-gpt-oss-120b': 'openai/gpt-oss-120b',
  'groq-gpt-oss-20b': 'openai/gpt-oss-20b',
  'groq-llama3-70b': 'llama-3.3-70b-versatile',
  'groq-llama4-scout': 'meta-llama/llama-4-scout-17b-16e-instruct',
  'groq-qwen3-32b': 'qwen/qwen3-32b',
  'groq-mixtral': 'llama-3.1-8b-instant',
}

async function callGroq(modelId: string, prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY not configured. Get a free key at console.groq.com and add GROQ_API_KEY=... to .env.local'
    )
  }

  const model = GROQ_MODEL_MAP[modelId] || 'llama-3.3-70b-versatile'
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 10,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq API error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  return (data?.choices?.[0]?.message?.content ?? '').trim()
}

// ─── Ollama (local) ───────────────────────────────────────────────────────────

const OLLAMA_MODEL_MAP: Record<string, string> = {
  'ollama-llama3': 'llama3',
  'ollama-mistral': 'mistral',
}

async function callOllama(modelId: string, prompt: string): Promise<string> {
  const model = OLLAMA_MODEL_MAP[modelId] || 'llama3'
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'

  let response: Response
  try {
    response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
    })
  } catch {
    throw new Error(
      `Cannot connect to Ollama at ${ollamaUrl}. Make sure Ollama is running (ollama serve) and the model is pulled (ollama pull ${model}).`
    )
  }

  if (!response.ok) {
    const err = await response.text()
    if (response.status === 404) {
      throw new Error(`Ollama model '${model}' not found. Run: ollama pull ${model}`)
    }
    throw new Error(`Ollama error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  return (data?.response ?? '').trim()
}

// ─── Stockfish Fallback ──────────────────────────────────────────────────────

async function callStockfishFallback(fen: string, modelId: string): Promise<string> {
  const opponent = AI_OPPONENTS.find(a => a.id === modelId)
  const elo = opponent?.elo || 1500
  
  // Map ELO to Stockfish depth
  let depth = 5
  if (elo < 1000) depth = 1
  else if (elo < 1400) depth = 3
  else if (elo < 1800) depth = 8
  else if (elo < 2200) depth = 12
  else if (elo < 2600) depth = 15
  else depth = 18

  try {
    const url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Stockfish API failed')
    
    const data = await response.json()
    if (!data.success) throw new Error('Stockfish API unsuccessful')
    
    // bestmove e2e4 ...
    const bestMove = data.bestmove || ''
    const match = bestMove.match(/bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/)
    return match ? match[1] : ''
  } catch (error) {
    console.error('Stockfish fallback failed:', error)
    return ''
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { fen, modelId, history } = await req.json()

    const chess = new Chess(fen)
    const legalMoves = chess.moves({ verbose: true })

    if (legalMoves.length === 0) {
      return NextResponse.json({ error: 'No legal moves available' }, { status: 400 })
    }

    const playerColor = chess.turn() === 'w' ? 'white' : 'black'
    const prompt = buildPrompt(fen, history, playerColor)

    // Route to the correct provider based on modelId prefix
    const getResponse: () => Promise<string> = modelId.startsWith('stockfish')
      ? () => callStockfishFallback(fen, modelId)
      : modelId.startsWith('groq-')
        ? () => callGroq(modelId, prompt)
        : modelId.startsWith('ollama-')
          ? () => callOllama(modelId, prompt)
          : () => callGemini(modelId, prompt)

    let chosenMove = ''
    let attempts = 0

    while (attempts < 3 && !chosenMove) {
      try {
        const rawResponse = await getResponse()
        const extracted = extractMove(rawResponse)

        if (extracted) {
          if (extracted.length === 4 || extracted.length === 5) {
            const from = extracted.substring(0, 2)
            const to = extracted.substring(2, 4)
            const promotion = extracted.length === 5 ? extracted[4] : undefined
            const move = chess.move({ from, to, promotion: promotion as any })
            if (move) { chosenMove = extracted; chess.undo() }
          } else {
            const move = chess.move(extracted)
            if (move) { chosenMove = `${move.from}${move.to}${move.promotion || ''}`; chess.undo() }
          }
        }
      } catch (err) {
        console.error(`Attempt ${attempts + 1} failed:`, err)
        // If it's the last attempt or a fatal error, we'll try Stockfish next
      }
      attempts++
    }

    // Fallback: Stockfish
    if (!chosenMove) {
      console.log('Using Stockfish fallback...')
      chosenMove = await callStockfishFallback(fen, modelId)
    }

    // Ultimate Fallback: pick a random legal move
    if (!chosenMove) {
      const random = legalMoves[Math.floor(Math.random() * legalMoves.length)]
      chosenMove = `${random.from}${random.to}${random.promotion || ''}`
    }

    return NextResponse.json({ move: chosenMove })
  } catch (error) {
    console.error('AI move error:', error)
    // Even on global error, try to return a random move instead of 500
    try {
      const { fen } = await req.json()
      const chess = new Chess(fen)
      const moves = chess.moves({ verbose: true })
      const random = moves[Math.floor(Math.random() * moves.length)]
      return NextResponse.json({ move: `${random.from}${random.to}${random.promotion || ''}`, error: 'Falling back to random' })
    } catch {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
