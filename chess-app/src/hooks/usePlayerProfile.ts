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
  chessComUsername?: string
  avatarUrl?: string
  chessComStats?: {
    rapid?: { elo: number, wins: number, losses: number, draws: number }
    blitz?: { elo: number, wins: number, losses: number, draws: number }
  }
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

  const syncWithChessCom = useCallback(async (username: string) => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        fetch(`https://api.chess.com/pub/player/${username}`, {
          headers: { 'User-Agent': 'Grandmaster-AI-Chess-Arena/1.0 (contact: github.com/bakhtiar)' }
        }),
        fetch(`https://api.chess.com/pub/player/${username}/stats`, {
          headers: { 'User-Agent': 'Grandmaster-AI-Chess-Arena/1.0 (contact: github.com/bakhtiar)' }
        })
      ])

      if (!profileRes.ok || !statsRes.ok) {
        throw new Error('User not found or API error')
      }

      const profileData = await profileRes.json()
      const statsData = await statsRes.json()

      const rapid = statsData.chess_rapid ? {
        elo: statsData.chess_rapid.last.rating,
        wins: statsData.chess_rapid.record.win,
        losses: statsData.chess_rapid.record.loss,
        draws: statsData.chess_rapid.record.draw,
      } : undefined

      const blitz = statsData.chess_blitz ? {
        elo: statsData.chess_blitz.last.rating,
        wins: statsData.chess_blitz.record.win,
        losses: statsData.chess_blitz.record.loss,
        draws: statsData.chess_blitz.record.draw,
      } : undefined

      const updated: PlayerProfile = {
        ...profile,
        username: profileData.username,
        chessComUsername: profileData.username,
        avatarUrl: profileData.avatar,
        chessComStats: { rapid, blitz }
      }
      
      // Update local elo if rapid or blitz exists (prefer rapid)
      if (rapid) updated.elo = rapid.elo
      else if (blitz) updated.elo = blitz.elo

      saveProfile(updated)
      return { success: true }
    } catch (err: any) {
      console.error('Failed to sync with Chess.com:', err)
      return { success: false, error: err.message }
    }
  }, [profile, saveProfile])

  return { profile, recordGame, winRate, totalGames, saveProfile, syncWithChessCom }
}
