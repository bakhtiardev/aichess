export interface AIOpponent {
  id: string
  name: string
  shortName: string
  elo: number
  playstyle: string
  provider: string
  description: string
  gradient: string
  iconName: string
  winRate: number
  free: boolean
  modelId: string
}

export const AI_OPPONENTS: AIOpponent[] = [
  {
    id: 'gemini-flash',
    name: 'Gemini 1.5 Flash',
    shortName: 'Gemini Flash',
    elo: 1800,
    playstyle: 'Positional / Balanced',
    provider: 'Google Cloud TPU',
    description: 'Fast and versatile. Gemini Flash balances speed with strategic depth.',
    gradient: 'from-blue-400 to-purple-500',
    iconName: 'psychology',
    winRate: 62,
    free: true,
    modelId: 'gemini-1.5-flash',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini 1.5 Pro',
    shortName: 'Gemini Pro',
    elo: 2200,
    playstyle: 'Positional / Sharp',
    provider: 'Google Cloud TPU v5e',
    description: 'Google\'s most capable model. Plays a deep positional style with sharp tactical vision.',
    gradient: 'from-violet-500 to-indigo-600',
    iconName: 'psychology',
    winRate: 68,
    free: true,
    modelId: 'gemini-1.5-pro',
  },
  {
    id: 'gemini-2-flash',
    name: 'Gemini 2.0 Flash',
    shortName: 'Gemini 2.0',
    elo: 2600,
    playstyle: 'Aggressive / Tactical',
    provider: 'Google DeepMind',
    description: 'The latest generation. Combines brutal tactical play with long-term strategic planning.',
    gradient: 'from-emerald-400 to-cyan-500',
    iconName: 'smart_toy',
    winRate: 74,
    free: true,
    modelId: 'gemini-2.0-flash',
  },
]
