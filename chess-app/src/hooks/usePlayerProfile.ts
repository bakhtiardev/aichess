'use client'

import { useState, useEffect, useCallback } from 'react'

export interface GameRecord {
  id: string
  opponent: string
  result: 'win' | 'loss' | 'draw'
  accuracy: number
  opening: string
  date: string
}

export interface PlayerProfile {
  username: string
  elo: number
  wins: number
  losses: number
  draws: number
  recentMatches: GameRecord[]
  ratingHistory: number[]
}

const DEFAULT_PROFILE: PlayerProfile = {
  username: 'You',
  elo: 1200,
  wins: 0,
  losses: 0,
  draws: 0,
  recentMatches: [],
  ratingHistory: [1200, 1200, 1200, 1200, 1200, 1200, 1200],
}

export function usePlayerProfile() {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('chess-profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        setProfile({
          ...DEFAULT_PROFILE,
          ...parsed,
          // Ensure ratingHistory exists and is an array
          ratingHistory: Array.isArray(parsed.ratingHistory) 
            ? parsed.ratingHistory 
            : DEFAULT_PROFILE.ratingHistory
        })
      }
    } catch {
      // ignore
    }
  }, [])

  const saveProfile = useCallback((updated: PlayerProfile) => {
    setProfile(updated)
    try {
      localStorage.setItem('chess-profile', JSON.stringify(updated))
    } catch {
      // ignore
    }
  }, [])

  const recordGame = useCallback(
    (record: Omit<GameRecord, 'id' | 'date'>) => {
      const eloDelta = record.result === 'win' ? 15 : record.result === 'loss' ? -12 : 2
      const newElo = Math.max(100, profile.elo + eloDelta)

      const newRecord: GameRecord = {
        ...record,
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }

      const updated: PlayerProfile = {
        ...profile,
        elo: newElo,
        wins: profile.wins + (record.result === 'win' ? 1 : 0),
        losses: profile.losses + (record.result === 'loss' ? 1 : 0),
        draws: profile.draws + (record.result === 'draw' ? 1 : 0),
        recentMatches: [newRecord, ...profile.recentMatches].slice(0, 20),
        ratingHistory: [...profile.ratingHistory.slice(-6), newElo],
      }

      saveProfile(updated)
    },
    [profile, saveProfile]
  )

  const totalGames = profile.wins + profile.losses + profile.draws
  const winRate = totalGames > 0 ? Math.round((profile.wins / totalGames) * 100) : 0

  return { profile, recordGame, winRate, totalGames, saveProfile }
}
