import { NextRequest, NextResponse } from 'next/server'
import { Chess } from 'chess.js'

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

// ─── Gemini ─────────────────────────────────────────────────────────────────

const GEMINI_MODEL_MAP: Record<string, string> = {
  'gemini-flash': 'gemini-1.5-flash',
  'gemini-pro': 'gemini-1.5-pro',
  'gemini-2-flash': 'gemini-2.0-flash',
}

async function callGemini(modelId: string, prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured. Add it to .env.local')

  const geminiModel = GEMINI_MODEL_MAP[modelId] || 'gemini-1.5-flash'
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 10 },
      }),
    }
  )
  if (!response.ok) throw new Error(`Gemini API error: ${response.status} — ${await response.text()}`)
  const data = await response.json()
  return (data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim()
}

// ─── Groq (free API) ─────────────────────────────────────────────────────────

const GROQ_MODEL_MAP: Record<string, string> = {
  'groq-gpt-oss-120b': 'openai/gpt-4o',
  'groq-gpt-oss-20b': 'openai/gpt-4o-mini',
  'groq-llama3-70b': 'llama-3.3-70b-versatile',
  'groq-llama4-scout': 'meta-llama/llama-4-scout-17b-16e-instruct',
  'groq-qwen3-32b': 'qwen/qwen3-32b',
  'groq-mixtral': 'mixtral-8x7b-32768',
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
    const getResponse: () => Promise<string> = modelId.startsWith('groq-')
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
        // On the last attempt, propagate the error so users see a clear message
        if (attempts === 2) throw err
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
