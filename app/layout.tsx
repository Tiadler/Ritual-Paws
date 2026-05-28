import type { Metadata } from 'next'
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Ritual Paws - My Talking Pet on Ritual',
  description: 'Raise a stylish cat, decorate your room, and chat with AI on Ritual Testnet.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} brand-app-shell text-white`}>
        <div className="min-h-screen">
          <nav className="brand-nav fixed z-50 w-full">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="brand-panel flex h-10 w-10 items-center justify-center rounded-none">
                  <img
                    src="/static/Pet/Pet(1).png"
                    alt="Pet 1 logo"
                    className="h-8 w-8 object-contain"
                  />
                </div>

                <div>
                  <div className="text-lg font-bold uppercase tracking-[0.16em] text-white">
                    Ritual Paws
                  </div>
                  <div className={`-mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/45 ${ibmPlexMono.className}`}>
                    on Ritual Testnet
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`brand-chip hidden items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] md:flex ${ibmPlexMono.className}`}>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[#40FFAF]"></div>
                  <span>Testnet</span>
                </div>
              </div>
            </div>
          </nav>

          <div className="pt-16">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
