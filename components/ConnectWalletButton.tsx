'use client'

import { useEffect, useState } from 'react'
import {
  getProviderAndSigner,
  getWalletProviderAvailability,
  setSelectedWalletProvider,
  shortAddress,
  type WalletProviderId,
} from '@/lib/ritualTom'

interface ConnectWalletButtonProps {
  connected?: boolean
  address?: string
  onConnect?: (address: string) => void
  onError?: (message: string) => void
}

export function ConnectWalletButton({
  connected: controlledConnected,
  address: controlledAddress,
  onConnect,
  onError,
}: ConnectWalletButtonProps) {
  const [internalConnected, setInternalConnected] = useState(false)
  const [internalAddress, setInternalAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [wallets, setWallets] = useState(getWalletProviderAvailability)

  const isConnected = controlledConnected ?? internalConnected
  const address = controlledAddress ?? internalAddress

  useEffect(() => {
    setWallets(getWalletProviderAvailability())
  }, [open])

  const connectWallet = async (
    walletId: WalletProviderId,
    forceWalletSelection = false
  ) => {
    try {
      setLoading(true)
      setSelectedWalletProvider(walletId)

      const { address } = await getProviderAndSigner(forceWalletSelection)
      setInternalAddress(address)
      setInternalConnected(true)
      setOpen(false)
      onConnect?.(address)
    } catch (error: any) {
      onError?.(error?.shortMessage || error?.message || 'Could not connect wallet.')
    } finally {
      setLoading(false)
    }
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((value) => !value)}
          disabled={loading}
          title="Click to change wallet"
          className="brand-button-secondary flex items-center gap-2 px-4 py-2 text-sm font-mono transition disabled:opacity-60"
        >
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#40FFAF]" />
          {loading ? 'Switching...' : shortAddress(address)}
        </button>

        {open ? (
          <WalletPicker
            wallets={wallets}
            loading={loading}
            onSelect={(walletId) => connectWallet(walletId, true)}
          />
        ) : null}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        disabled={loading}
        className="brand-button-primary flex min-h-[3.5rem] items-center gap-2 px-8 py-3 text-base font-semibold transition-all active:scale-[0.985] disabled:opacity-60"
      >
        <span className="text-lg">{loading ? '...' : ''}</span>
        {loading ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {open ? (
        <WalletPicker
          wallets={wallets}
          loading={loading}
          onSelect={(walletId) => connectWallet(walletId)}
        />
      ) : null}
    </div>
  )
}

function WalletPicker({
  wallets,
  loading,
  onSelect,
}: {
  wallets: ReturnType<typeof getWalletProviderAvailability>
  loading: boolean
  onSelect: (walletId: WalletProviderId) => void
}) {
  return (
    <div className="absolute right-0 top-[calc(100%+0.65rem)] z-[260] w-64 overflow-hidden rounded-[16px] border border-[#40FFAF]/18 bg-black/90 p-2 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.8)] backdrop-blur-md">
      {wallets.map((wallet) => (
        <button
          key={wallet.id}
          type="button"
          disabled={loading || !wallet.installed}
          onClick={() => onSelect(wallet.id)}
          className="flex w-full items-center justify-between gap-3 rounded-[12px] px-3 py-3 text-left text-sm text-white/84 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="font-semibold">{wallet.label}</span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-white/42">
            {wallet.installed ? 'Ready' : 'Missing'}
          </span>
        </button>
      ))}
    </div>
  )
}
