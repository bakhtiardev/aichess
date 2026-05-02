import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AI_OPPONENTS } from '@/lib/aiOpponents'
import GameClient from '@/components/game/GameClient'

interface PageProps {
  params: { model: string }
  searchParams: { color?: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const opponent = AI_OPPONENTS.find((o) => o.id === params.model)
  return {
    title: opponent
      ? `vs ${opponent.name} — Grandmaster AI Chess Arena`
      : 'Game — Grandmaster AI Chess Arena',
    description: opponent
      ? `Play chess against ${opponent.name} (ELO ${opponent.elo}). ${opponent.playstyle} playstyle.`
      : 'Play chess against an AI opponent.',
  }
}

export function generateStaticParams() {
  return AI_OPPONENTS.map((o) => ({ model: o.id }))
}

export default function PlayPage({ params, searchParams }: PageProps) {
  const opponent = AI_OPPONENTS.find((o) => o.id === params.model)
  if (!opponent) notFound()

  const playerColor = searchParams.color === 'black' ? 'black' : 'white'

  return <GameClient modelId={params.model} playerColor={playerColor} />
}
