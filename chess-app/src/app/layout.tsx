import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SideNav from '@/components/layout/SideNav'
import MobileNav from '@/components/layout/MobileNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Grandmaster AI Chess Arena',
  description: 'Challenge state-of-the-art AI models including Gemini in the ultimate chess arena.',
  keywords: ['chess', 'AI', 'Gemini', 'chess AI', 'online chess'],
  openGraph: {
    title: 'Grandmaster AI Chess Arena',
    description: 'Play chess against cutting-edge AI models',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={`${inter.className} bg-background text-on-background antialiased flex h-screen overflow-hidden`}>
        <SideNav />
        <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 pb-16 md:pb-0">
          {children}
        </div>
        <MobileNav />
      </body>
    </html>
  )
}
