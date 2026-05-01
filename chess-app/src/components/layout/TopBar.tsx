'use client'

import Image from 'next/image'

interface TopBarProps {
  title?: string
  subtitle?: string
}

export default function TopBar({ title = 'Chess AI Hub', subtitle }: TopBarProps) {
  return (
    <header className="flex justify-between items-center h-14 px-4 md:px-6 w-full bg-surface-container border-b border-outline-variant flex-shrink-0 z-10">
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
        <button className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-lg hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>
        <button className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-lg hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-xl">help_outline</span>
        </button>
        <button className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-lg hover:bg-surface-container-high relative">
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-error rounded-full border border-surface-container"></span>
        </button>
      </div>
    </header>
  )
}
