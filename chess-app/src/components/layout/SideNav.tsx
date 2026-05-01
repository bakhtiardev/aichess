'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Play', icon: 'play_circle' },
  { href: '/puzzles', label: 'Puzzles', icon: 'extension' },
  { href: '/arena', label: 'AI Arena', icon: 'smart_toy' },
  { href: '/profile', label: 'Profile', icon: 'person' },
]

export default function SideNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="hidden md:flex flex-col h-screen py-6 px-4 bg-surface-container-low border-r border-outline-variant w-64 flex-shrink-0">
      {/* Logo */}
      <div className="mb-10 flex justify-center px-1">
        <div className="w-[200px] h-[150px] relative drop-shadow-md flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Grandmaster AI Logo"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 200px"
            priority
          />
        </div>
      </div>

      {/* Nav Items */}
      <ul className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg font-semibold tracking-tight transition-all duration-200 ${active
                    ? 'bg-surface-container-high text-primary border-l-4 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border-l-4 border-transparent'
                  }`}
              >
                <span
                  className="material-symbols-outlined mr-4 text-xl"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* CTA Button */}
      <div className="mt-auto pt-4 border-t border-outline-variant">
        <Link
          href="/"
          className="w-full bg-primary text-on-primary hover:brightness-110 active:brightness-90 transition-all duration-200 py-3 rounded-lg text-label-bold font-bold flex items-center justify-center gap-2 shadow-lg"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Game
        </Link>
      </div>
    </nav>
  )
}
