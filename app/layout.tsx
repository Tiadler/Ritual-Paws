import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ConnectWalletButton } from '@/components/ConnectWalletButton'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'] 
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
      <body className={`${inter.className} bg-[#0F0F1A] text-white`}>
        <div className="min-h-screen">
          <nav className="border-b border-white/10 bg-[#0F0F1A]/80 backdrop-blur-lg fixed w-full z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FF6B9D] rounded-full flex items-center justify-center">
                  <span className="text-xl">🐱</span>
                </div>
                <div>
                  <div className="font-bold text-xl tracking-tight">Ritual Paws</div>
                  <div className="text-[10px] text-white/50 -mt-1">on Ritual Testnet</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full text-sm">
                  <div className="w-2 h-2 bg-[#00E5C4] rounded-full animate-pulse"></div>
                  <span>Testnet</span>
                </div>
                <ConnectWalletButton />
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
