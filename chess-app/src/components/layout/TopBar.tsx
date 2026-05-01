'use client'

import Image from 'next/image'
import { useState } from 'react'
import { usePlayerProfile } from '@/hooks/usePlayerProfile'

interface TopBarProps {
  title?: string
  subtitle?: string
}

export default function TopBar({ title = 'Chess AI Hub', subtitle }: TopBarProps) {
  const { profile, syncWithChessCom } = usePlayerProfile()
  const [showSyncModal, setShowSyncModal] = useState(false)
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
          {profile.chessComUsername ? (
            <div className="flex items-center gap-2 px-2 py-1 bg-surface-container-high rounded-full border border-outline-variant" title={`Linked as ${profile.chessComUsername}`}>
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-primary/30" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-on-primary">person</span>
                </div>
              )}
              <span className="text-xs font-bold text-on-surface hidden sm:inline-block pr-2">{profile.chessComUsername}</span>
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

          <div className="h-4 w-px bg-outline-variant mx-1"></div>

          <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded-lg hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded-lg hover:bg-surface-container-high relative">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-error rounded-full border border-surface-container"></span>
          </button>
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
    </>
  )
}
