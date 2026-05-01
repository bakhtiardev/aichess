'use client'

import { usePlayerProfile } from '@/hooks/usePlayerProfile'
import TopBar from '@/components/layout/TopBar'
import Link from 'next/link'

const ACHIEVEMENTS = [
  {
    id: 'first-win',
    title: 'First Victory',
    description: 'Win your first game against an AI.',
    icon: 'emoji_events',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    condition: (wins: number) => wins >= 1,
  },
  {
    id: 'ai-slayer',
    title: 'AI Slayer',
    description: 'Win 5 games against AI opponents.',
    icon: 'military_tech',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/20',
    condition: (wins: number) => wins >= 5,
  },
  {
    id: 'ten-wins',
    title: 'Grandmaster Aspirant',
    description: 'Win 10 games total.',
    icon: 'workspace_premium',
    color: 'text-tertiary',
    bgColor: 'bg-tertiary/10',
    borderColor: 'border-tertiary/20',
    condition: (wins: number) => wins >= 10,
  },
  {
    id: 'centurion',
    title: 'AI Conqueror',
    description: 'Win 50 games against AI.',
    icon: 'verified',
    color: 'text-on-surface-variant',
    bgColor: 'bg-surface-variant',
    borderColor: 'border-outline-variant',
    condition: (wins: number) => wins >= 50,
  },
]

export default function ProfilePage() {
  const { profile, winRate, totalGames } = usePlayerProfile()
  const history = profile.ratingHistory || [1200]
  const maxElo = Math.max(...history)
  const minElo = Math.min(...history)
  const eloRange = Math.max(maxElo - minElo, 40) // Min range of 40 for better scaling
  const latestChange = history.length >= 2
    ? history[history.length - 1] - history[history.length - 2]
    : 0

  // Use Chess.com stats if available, otherwise local AI stats
  const displayTotalGames = profile.chessComStats 
    ? (profile.chessComStats.rapid?.wins || 0) + (profile.chessComStats.rapid?.losses || 0) + (profile.chessComStats.rapid?.draws || 0) +
      (profile.chessComStats.blitz?.wins || 0) + (profile.chessComStats.blitz?.losses || 0) + (profile.chessComStats.blitz?.draws || 0)
    : totalGames

  const displayWins = profile.chessComStats 
    ? (profile.chessComStats.rapid?.wins || 0) + (profile.chessComStats.blitz?.wins || 0)
    : profile.wins
    
  const displayLosses = profile.chessComStats 
    ? (profile.chessComStats.rapid?.losses || 0) + (profile.chessComStats.blitz?.losses || 0)
    : profile.losses
    
  const displayDraws = profile.chessComStats 
    ? (profile.chessComStats.rapid?.draws || 0) + (profile.chessComStats.blitz?.draws || 0)
    : profile.draws

  const displayWinRate = displayTotalGames > 0 ? Math.round((displayWins / displayTotalGames) * 100) : 0

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Chess AI Hub" subtitle="Profile" />

      <main className="flex-1 overflow-y-auto bg-surface p-6">
        <div className="max-w-5xl mx-auto space-y-4">

          {/* User Header */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-5 z-10">
              <div className="relative">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-primary shadow-lg object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center border-2 border-primary shadow-lg">
                    <span className="material-symbols-outlined text-on-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      person
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-surface-container-high text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/30">
                  {profile.elo >= 2000 ? 'GM' : profile.elo >= 1800 ? 'IM' : profile.elo >= 1600 ? 'FM' : 'Club'}
                </div>
              </div>
              <div>
                <h1 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                  {profile.username}
                  <span className="material-symbols-outlined text-primary text-xl" title="Verified">verified</span>
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  {profile.chessComStats?.rapid && (
                    <span className="flex items-center gap-1 text-body-sm text-primary font-semibold">
                      <span className="material-symbols-outlined text-base">timer</span>
                      Rapid: {profile.chessComStats.rapid.elo}
                    </span>
                  )}
                  {profile.chessComStats?.blitz && (
                    <span className="flex items-center gap-1 text-body-sm text-secondary font-semibold">
                      <span className="material-symbols-outlined text-base">bolt</span>
                      Blitz: {profile.chessComStats.blitz.elo}
                    </span>
                  )}
                  {!profile.chessComStats && (
                    <span className="flex items-center gap-1 text-body-sm text-primary font-semibold">
                      <span className="material-symbols-outlined text-base">monitoring</span>
                      ELO: {profile.elo}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    {displayTotalGames} games played
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 z-10">
              <Link
                href="/"
                className="px-5 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  swords
                </span>
                New Match
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Stats */}
            <div className="lg:col-span-8 space-y-4">

              {/* Performance */}
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
                <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                  Performance
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-8 justify-around">
                  {/* Win rate gauge */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#33362d" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="#9fd668"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - winRate / 100)}
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-on-surface">{displayWinRate}%</span>
                      <span className="text-[10px] text-on-surface-variant">Win Rate</span>
                    </div>
                  </div>

                  {/* W/D/L breakdown */}
                  <div className="flex-1 max-w-xs w-full space-y-3">
                    <div className="flex justify-between text-label-bold font-bold text-on-surface">
                      <span>Record {profile.chessComStats && '(Chess.com)'}</span>
                      <span>{displayTotalGames} Games</span>
                    </div>
                    <div className="h-3 w-full flex rounded-full overflow-hidden border border-outline-variant bg-surface">
                      {displayTotalGames > 0 && (
                        <>
                          <div className="h-full bg-primary" style={{ width: `${(displayWins / displayTotalGames) * 100}%` }} title={`Wins: ${displayWins}`} />
                          <div className="h-full bg-surface-variant border-x border-background" style={{ width: `${(displayDraws / displayTotalGames) * 100}%` }} title={`Draws: ${displayDraws}`} />
                          <div className="h-full bg-error" style={{ width: `${(displayLosses / displayTotalGames) * 100}%` }} title={`Losses: ${displayLosses}`} />
                        </>
                      )}
                      {displayTotalGames === 0 && (
                        <div className="h-full w-full bg-surface-variant" />
                      )}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> {displayWins}W</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-surface-variant inline-block" /> {displayDraws}D</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error inline-block" /> {displayLosses}L</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-label-bold font-bold text-on-surface-variant uppercase tracking-wider">Local AI Rating History</h3>
                  <span className={`text-headline-md font-bold ${latestChange >= 0 ? 'text-primary' : 'text-error'}`}>
                    {latestChange >= 0 ? '+' : ''}{latestChange}
                  </span>
                </div>
                <div className="h-36 bg-surface-variant/5 rounded-lg border border-outline-variant/30 relative px-4">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9fd668" />
                        <stop offset="100%" stopColor="#9fd668" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Area under the line */}
                    <path
                      d={`M 5 100 ${history.map((rating, i) => {
                        const x = (i / (Math.max(1, history.length - 1))) * 90 + 5
                        const y = 100 - (maxElo === minElo ? 50 : ((rating - minElo) / eloRange) * 70 + 15)
                        return `L ${x} ${y}`
                      }).join(' ')} L 95 100 Z`}
                      fill="url(#ratingGradient)"
                      className="opacity-20"
                    />
                    {/* The Line */}
                    <path
                      d={history.map((rating, i) => {
                        const x = (i / (Math.max(1, history.length - 1))) * 90 + 5
                        const y = 100 - (maxElo === minElo ? 50 : ((rating - minElo) / eloRange) * 70 + 15)
                        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
                      }).join(' ')}
                      fill="none"
                      stroke="#9fd668"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Points & Interactive Tooltips */}
                  <div className="absolute inset-0 px-4 pointer-events-none">
                    {history.map((rating, i) => {
                      const x = (i / (Math.max(1, history.length - 1))) * 90 + 5
                      const y = 100 - (maxElo === minElo ? 50 : ((rating - minElo) / eloRange) * 70 + 15)
                      return (
                        <div
                          key={i}
                          className="absolute h-full group pointer-events-auto"
                          style={{ left: `${x}%`, width: '30px', marginLeft: '-15px' }}
                        >
                          <div
                            className="absolute w-2.5 h-2.5 bg-primary border-2 border-surface-container rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 transition-transform group-hover:scale-150 z-20"
                            style={{ top: `${y}%` }}
                          />
                          <div className="absolute left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 shadow-md border border-outline-variant pointer-events-none"
                            style={{ top: `calc(${y}% - 30px)` }}>
                            {rating} ELO
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Matches */}
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
                <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>memory</span>
                  Recent AI Matches
                </h2>
                {profile.recentMatches.length === 0 ? (
                  <div className="py-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2 block">sports_esports</span>
                    <p className="text-on-surface-variant text-sm">No matches yet.</p>
                    <Link href="/" className="text-primary text-sm hover:underline mt-1 inline-block">Start playing →</Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/50">
                          {['Opponent', 'Result', 'Accuracy', 'Opening', 'Date'].map((col) => (
                            <th key={col} className="py-3 px-3 text-label-bold font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-body-sm divide-y divide-outline-variant/30">
                        {profile.recentMatches.map((match) => (
                          <tr key={match.id} className="hover:bg-surface-variant/20 transition-colors group">
                            <td className="py-2.5 px-3 text-on-surface font-medium flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                              {match.opponent}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] ${match.result === 'win' ? 'bg-primary/15 text-primary border border-primary/30' :
                                match.result === 'loss' ? 'bg-error/15 text-error border border-error/30' :
                                  'bg-surface-variant text-on-surface-variant border border-outline-variant'
                                }`}>
                                {match.result.charAt(0).toUpperCase() + match.result.slice(1)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-on-surface">{match.accuracy}%</td>
                            <td className="py-2.5 px-3 text-on-surface-variant">{match.opening}</td>
                            <td className="py-2.5 px-3 text-on-surface-variant group-hover:text-primary transition-colors">{match.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="lg:col-span-4 bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col">
              <h2 className="text-headline-md font-bold text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                Achievements
              </h2>
              <div className="flex flex-col gap-3 overflow-y-auto">
                {ACHIEVEMENTS.map((ach) => {
                  const unlocked = ach.condition(displayWins)
                  return (
                    <div
                      key={ach.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${unlocked
                        ? `${ach.bgColor} ${ach.borderColor} hover:brightness-105`
                        : 'bg-surface border-outline-variant opacity-50 grayscale'
                        }`}
                    >
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center border flex-shrink-0 ${unlocked ? `${ach.bgColor} ${ach.borderColor}` : 'bg-surface-variant border-outline-variant'}`}>
                        <span className={`material-symbols-outlined text-xl ${unlocked ? ach.color : 'text-outline'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                          {unlocked ? ach.icon : 'lock'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-label-bold font-bold text-on-surface text-xs">{ach.title}</h4>
                        <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{ach.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
