'use client'

import Image from 'next/image'
import { useState } from 'react'
import { usePlayerProfile } from '@/hooks/usePlayerProfile'

interface TopBarProps {
  title?: string
  subtitle?: string
}

export default function TopBar({ title = 'Chess AI Hub', subtitle }: TopBarProps) {
  const { profile, syncWithChessCom, updateSettings } = usePlayerProfile()
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [chessComInput, setChessComInput] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  const handleSync = async () => {
    if (!chessComInput.trim()) return
    setIsSyncing(true)
    setSyncError(null)
    const result = await syncWithChessCom(chessComInput.trim())
    if (!result.success) {
      setSyncError(result.error || 'Failed to sync')
    } else {
      setShowSyncModal(false)
      setChessComInput('')
    }
    setIsSyncing(false)
  }

  return (
    <>
      <header className="flex justify-between items-center h-14 px-4 md:px-6 w-full bg-surface-container border-b border-outline-variant flex-shrink-0 z-10 relative">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="md:hidden w-8 h-8 relative flex-shrink-0 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
          <h1 className="text-lg font-bold text-primary truncate">{title}</h1>
          {subtitle && (
            <>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface-variant text-sm">{subtitle}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded-lg hover:bg-surface-container-high relative">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-error rounded-full border border-surface-container"></span>
          </button>

          <div className="h-4 w-px bg-outline-variant mx-1"></div>

          {profile.chessComUsername ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-2 py-1 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-full border border-outline-variant"
                title={`Linked as ${profile.chessComUsername}`}
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-primary/30" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-on-primary">person</span>
                  </div>
                )}
                <span className="text-xs font-bold text-on-surface hidden sm:inline-block pr-1">{profile.chessComUsername}</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-60 bg-surface-container-low border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden flex flex-col">
                    {/* Header: User Details */}
                    <div className="p-4 border-b border-outline-variant bg-surface-container-high/50 flex items-center gap-3">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-primary/50" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px] text-on-primary">person</span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface text-sm leading-tight">{profile.chessComUsername}</span>
                        <span className="text-xs text-primary font-bold flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[12px]">monitoring</span>
                          ELO {profile.elo}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setShowDropdown(false)
                          setShowSettingsModal(true)
                        }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 rounded-lg transition-colors text-left w-full"
                      >
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false)
                          setShowSyncModal(true)
                        }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 rounded-lg transition-colors text-left w-full"
                      >
                        <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                        Sync another account
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowSyncModal(true)}
              className="text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-primary/20"
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              <span className="hidden sm:inline">Connect Chess.com</span>
            </button>
          )}
        </div>
      </header>

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setShowSyncModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-headline-sm font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
              Link Account
            </h2>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Enter your Chess.com username to sync your Rapid and Blitz ratings, and import your lifetime win/loss record.
            </p>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Chess.com username"
                value={chessComInput}
                onChange={(e) => setChessComInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSync()}
                autoFocus
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              {syncError && (
                <p className="text-error text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {syncError}
                </p>
              )}
              <button
                onClick={handleSync}
                disabled={isSyncing || !chessComInput.trim()}
                className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isSyncing ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  'Sync Profile'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings</span>
              Board Settings
            </h2>

            <div className="space-y-8">
              {/* Board Themes */}
              <div>
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4 block">Board Theme</label>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { id: 'green', name: 'Green', dark: '#779556', light: '#ebecd0' },
                    { id: 'blue', name: 'Blue', dark: '#4b7399', light: '#eae9d2' },
                    { id: 'wood', name: 'Wood', dark: '#b58863', light: '#f0d9b5' },
                    { id: 'dark', name: 'Dark', dark: '#4a4a4a', light: '#707070' },
                    { id: 'purple', name: 'Purple', dark: '#8877b7', light: '#efefef' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => updateSettings({ boardTheme: t.id })}
                      className={`group relative flex flex-col items-center gap-2 p-1 rounded-lg border-2 transition-all ${
                        profile.settings.boardTheme === t.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-outline'
                      }`}
                    >
                      <div className="w-full aspect-square rounded-md overflow-hidden grid grid-cols-2 grid-rows-2">
                        <div style={{ backgroundColor: t.light }} />
                        <div style={{ backgroundColor: t.dark }} />
                        <div style={{ backgroundColor: t.dark }} />
                        <div style={{ backgroundColor: t.light }} />
                      </div>
                      <span className="text-[10px] font-bold text-on-surface-variant group-hover:text-on-surface">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Piece Sets */}
              <div>
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4 block">Piece Set</label>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { id: 'standard', name: 'Standard' },
                    { id: 'cburnett', name: 'Neo' },
                    { id: 'merida', name: 'Classic' },
                    { id: 'alpha', name: 'Modern' },
                    { id: 'pirouetti', name: 'Fancy' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => updateSettings({ pieceSet: p.id })}
                      className={`group flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                        profile.settings.pieceSet === p.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-outline'
                      }`}
                    >
                      <div className="w-10 h-10 flex items-center justify-center">
                        <img
                          src={p.id === 'standard'
                            ? 'https://lichess1.org/assets/piece/cburnett/wK.svg' // Placeholder for standard
                            : `https://lichess1.org/assets/piece/${p.id}/wK.svg`}
                          alt={p.name}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-on-surface-variant group-hover:text-on-surface">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full bg-primary/10 text-primary py-3 rounded-lg font-bold hover:bg-primary/20 transition-all mt-8"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  )
}
