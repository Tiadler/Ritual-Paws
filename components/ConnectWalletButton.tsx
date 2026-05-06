'use client'

import { useState } from 'react'
import { getProviderAndSigner, shortAddress } from '@/lib/ritualTom'

interface ConnectWalletButtonProps {
  connected?: boolean
  address?: string
  onConnect?: (address: string) => void
}

export function ConnectWalletButton({ connected: controlledConnected, address: controlledAddress, onConnect }: ConnectWalletButtonProps) {
  const [internalConnected, setInternalConnected] = useState(false)
  const [internalAddress, setInternalAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const isConnected = controlledConnected ?? internalConnected
  const address = controlledAddress ?? internalAddress

  const connectWallet = async () => {
    try {
      setLoading(true)
      const { address } = await getProviderAndSigner(false)
      setInternalAddress(address)
      setInternalConnected(true)
      onConnect?.(address)
    } catch (error: any) {
      alert(error?.shortMessage || error?.message || 'Không connect được ví.')
    } finally {
      setLoading(false)
    }
  }

  const switchWallet = async () => {
    try {
      setLoading(true)
      const { address } = await getProviderAndSigner(true)
      setInternalAddress(address)
      setInternalConnected(true)
      onConnect?.(address)
    } catch (error: any) {
      alert(error?.shortMessage || error?.message || 'Không đổi được ví.')
    } finally {
      setLoading(false)
    }
  }

  if (isConnected && address) {
    return (
      <button
        onClick={switchWallet}
        disabled={loading}
        title="Click to change wallet"
        className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl text-sm font-mono border border-white/10 hover:bg-white/10 transition disabled:opacity-60"
      >
        <div className="w-2 h-2 bg-[#00E5C4] rounded-full animate-pulse" />
        {loading ? 'Switching...' : shortAddress(address)}
      </button>
    )
  }

  return (
    <button
      onClick={connectWallet}
      disabled={loading}
      className="px-6 py-2.5 bg-white text-black font-semibold rounded-2xl hover:bg-white/90 active:scale-[0.985] flex items-center gap-2 transition-all text-sm disabled:opacity-60"
    >
      🔗 {loading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
