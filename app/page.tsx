/* eslint-disable @next/next/no-img-element */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StatusBars } from '@/components/StatusBars'
import { QuickActions } from '@/components/QuickActions'
import { RoomCanvas, type EquippedRoomItem } from '@/components/RoomCanvas'
import { ChatModal } from '@/components/ChatModal'
import { InventoryModal } from '@/components/InventoryModal'
import { PetCardModal } from '@/components/PetCardModal'
import { ConnectWalletButton } from '@/components/ConnectWalletButton'
import { AppToast, type AppToastMessage, type ToastTone } from '@/components/AppToast'
import { BackgroundMusic } from '@/components/BackgroundMusic'
import {
  getRitualTomContract,
  getWalletBalance,
  readMyPet,
  runPetActionRaw,
  RitualTomPet,
  type PetActionType,
} from '@/lib/ritualTom'
import { getPetArtByColor, imageFallback } from '@/lib/staticAssets'
import { CardMarquee } from '@/components/CardMarquee'

const DEFAULT_PET_NAME = 'Your Pet'
const DEFAULT_PET_COLOR = 'black'
const CONNECT_BACKGROUND_SRC = '/static/bg/bg.png'
const MAIN_BACKGROUND_MUSIC_SRC = '/static/music/Cupcake%20Parade.mp3'

type SavedPetAppearance = {
  equippedRoomItems: EquippedRoomItem[]
  selectedRoomBackground?: string
  displayPetColor?: string
  displayPetName?: string
}

function getMood(pet: RitualTomPet | null) {
  if (!pet) return 'Waiting'

  const avg = Math.round(
    (pet.hunger + pet.happiness + pet.energy + pet.cleanliness) / 4
  )

  if (avg >= 80) return 'Happy'
  if (avg >= 50) return 'Balanced'
  return 'Quiet'
}

function getAppearanceStorageKey(address: string) {
  return `ritualtom-appearance:${address.toLowerCase()}`
}

function loadSavedAppearance(address: string): SavedPetAppearance | null {
  if (typeof window === 'undefined' || !address) return null

  try {
    const raw = window.localStorage.getItem(getAppearanceStorageKey(address))
    if (!raw) return null

    const parsed = JSON.parse(raw) as SavedPetAppearance

    return {
      equippedRoomItems: Array.isArray(parsed.equippedRoomItems)
        ? parsed.equippedRoomItems
        : [],
      selectedRoomBackground: parsed.selectedRoomBackground,
      displayPetColor: parsed.displayPetColor,
      displayPetName: parsed.displayPetName,
    }
  } catch {
    return null
  }
}

function saveAppearance(address: string, appearance: SavedPetAppearance) {
  if (typeof window === 'undefined' || !address) return

  window.localStorage.setItem(
    getAppearanceStorageKey(address),
    JSON.stringify(appearance)
  )
}

function CreatedByTiadler() {
  return (
    <div className="fixed bottom-4 right-5 z-[999] border border-[#40FFAF]/18 bg-black/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/52 shadow-[0_18px_45px_-28px_rgba(64,255,175,0.22)] backdrop-blur-md">
      Created by{' '}
      <a
        href="https://x.com/Neitenoz26"
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto font-semibold text-white/84 underline decoration-[#40FFAF]/30 underline-offset-4 transition hover:text-[#40FFAF] hover:decoration-[#40FFAF]/70"
      >
        Tiadler
      </a>
    </div>
  )
}

function OverviewStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="brand-tag flex min-h-[6.25rem] w-full flex-col justify-between p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
        {label}
      </div>
      <div className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-white/86">
        {value}
      </div>
    </div>
  )
}

function getActionErrorMessage(error: unknown) {
  const nextError = error as {
    code?: number | string
    shortMessage?: string
    reason?: string
    message?: string
    info?: { error?: { message?: string } }
    error?: { message?: string }
    data?: { message?: string }
  }

  if (nextError?.code === 4001 || nextError?.code === 'ACTION_REJECTED') {
    return 'Transaction was rejected in the wallet.'
  }

  const rawMessage =
    nextError?.shortMessage ||
    nextError?.reason ||
    nextError?.info?.error?.message ||
    nextError?.error?.message ||
    nextError?.data?.message ||
    nextError?.message ||
    'Action failed.'

  if (rawMessage.includes('NoPetAdopted')) {
    return 'You need to adopt a pet before using actions.'
  }

  if (rawMessage.includes('InvalidPayment')) {
    return 'Invalid action payment. Reconnect the wallet and try again.'
  }

  if (rawMessage.toLowerCase().includes('insufficient funds')) {
    return 'Not enough RITUAL to pay action cost and gas.'
  }

  if (rawMessage.includes('could not coalesce error')) {
    return 'Wallet RPC could not send this transaction. Try switching wallet provider or reconnecting the wallet.'
  }

  return rawMessage
    .replace('execution reverted: ', '')
    .replace('Internal JSON-RPC error.', 'Wallet RPC error.')
}

export default function Page() {
  const [showChat, setShowChat] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)
  const [toast, setToast] = useState<AppToastMessage | null>(null)

  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [ritualBalance, setRitualBalance] = useState('0.0000')

  const [pet, setPet] = useState<RitualTomPet | null>(null)
  const [loadingPet, setLoadingPet] = useState(false)
  const [busyAction, setBusyAction] = useState('')

  const [equippedRoomItems, setEquippedRoomItems] = useState<EquippedRoomItem[]>([])
  const [selectedRoomBackground, setSelectedRoomBackground] = useState<string | undefined>()
  const [displayPetColor, setDisplayPetColor] = useState<string | undefined>()
  const [displayPetName, setDisplayPetName] = useState<string | undefined>()

  const [draftPetName, setDraftPetName] = useState('')
  const [isEditingPetName, setIsEditingPetName] = useState(false)

  const mood = useMemo(() => getMood(pet), [pet])
  const expPercent = pet
    ? Math.round((pet.expInLevel / pet.expToNextLevel) * 100)
    : 0

  const previewPetArt = getPetArtByColor(DEFAULT_PET_COLOR)
  const activePetColor = displayPetColor || pet?.color || DEFAULT_PET_COLOR
  const activePetName = displayPetName || pet?.name || DEFAULT_PET_NAME

  const showToast = useCallback(
    (title: string, message?: string, tone: ToastTone = 'info') => {
      const nextToast = {
        id: Date.now(),
        title,
        message,
        tone,
      }

      setToast(nextToast)
      window.setTimeout(() => {
        setToast((currentToast) =>
          currentToast?.id === nextToast.id ? null : currentToast
        )
      }, 5200)
    },
    []
  )

  const applySavedAppearance = useCallback((address: string) => {
    const savedAppearance = loadSavedAppearance(address)

    if (!savedAppearance) {
      setEquippedRoomItems([])
      setSelectedRoomBackground(undefined)
      setDisplayPetColor(undefined)
      setDisplayPetName(undefined)
      return
    }

    setEquippedRoomItems(savedAppearance.equippedRoomItems || [])
    setSelectedRoomBackground(savedAppearance.selectedRoomBackground)
    setDisplayPetColor(savedAppearance.displayPetColor)
    setDisplayPetName(savedAppearance.displayPetName)
  }, [])

  const refreshPet = useCallback(
    async (address?: string) => {
      try {
        setLoadingPet(true)

        const nextPet = await readMyPet()
        setPet(nextPet)

        const balance = await getWalletBalance(address || walletAddress)
        setRitualBalance(balance)
      } catch {
      } finally {
        setLoadingPet(false)
      }
    },
    [walletAddress]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ethereum = window.ethereum
    if (!ethereum) return

    const handleAccountsChanged = async (accounts: string[]) => {
      const nextAddress = accounts?.[0] || ''

      if (!nextAddress) {
        setIsConnected(false)
        setWalletAddress('')
        setPet(null)
        setRitualBalance('0.0000')
        setEquippedRoomItems([])
        setSelectedRoomBackground(undefined)
        setDisplayPetColor(undefined)
        setDisplayPetName(undefined)
        setIsEditingPetName(false)
        setDraftPetName('')
        return
      }

      setWalletAddress(nextAddress)
      setIsConnected(true)
      await refreshPet(nextAddress)
      applySavedAppearance(nextAddress)
    }

    const handleChainChanged = () => {
      window.location.reload()
    }

    ethereum.on?.('accountsChanged', handleAccountsChanged)
    ethereum.on?.('chainChanged', handleChainChanged)

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged)
      ethereum.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [applySavedAppearance, refreshPet])

  const handleConnect = async (address: string) => {
    setWalletAddress(address)
    setIsConnected(true)

    await refreshPet(address)
    applySavedAppearance(address)
    showToast('Wallet connected', 'Your pet workspace is ready.', 'success')
  }

  const handleAdopt = async () => {
    try {
      setBusyAction('adopt')

      const { contract, address } = await getRitualTomContract()
      const tx = await contract.adoptPet(DEFAULT_PET_NAME, DEFAULT_PET_COLOR)

      await tx.wait()

      setWalletAddress(address)
      setDisplayPetColor(DEFAULT_PET_COLOR)
      setDisplayPetName(DEFAULT_PET_NAME)

      saveAppearance(address, {
        equippedRoomItems: [],
        selectedRoomBackground: undefined,
        displayPetColor: DEFAULT_PET_COLOR,
        displayPetName: DEFAULT_PET_NAME,
      })

      await refreshPet(address)
      applySavedAppearance(address)
    } catch {
    } finally {
      setBusyAction('')
    }
  }

  const handleStartEditPetName = () => {
    setDraftPetName(activePetName)
    setIsEditingPetName(true)
  }

  const handleSavePetName = () => {
    const nextName = draftPetName.trim()

    if (!nextName) {
      showToast('Name required', 'Please enter a pet name before saving.', 'error')
      return
    }

    setDisplayPetName(nextName)
    setIsEditingPetName(false)

    if (walletAddress) {
      saveAppearance(walletAddress, {
        equippedRoomItems,
        selectedRoomBackground,
        displayPetColor: activePetColor,
        displayPetName: nextName,
      })
    }
  }

  const runAction = async (action: PetActionType) => {
    if (!pet?.adopted) {
      showToast('No pet found', 'You need to adopt a pet before using actions.', 'error')
      return
    }

    if (Number.parseFloat(ritualBalance) < 0.0015) {
      showToast('Not enough RITUAL', 'You need RITUAL for the action cost and gas.', 'error')
      return
    }

    try {
      setBusyAction(action)

      const { address } = await runPetActionRaw(action)
      await refreshPet(address)
    } catch (error) {
      console.error(`Failed to run ${action} action`, error)
      showToast('Action failed', getActionErrorMessage(error), 'error')
    } finally {
      setBusyAction('')
    }
  }

  if (!isConnected) {
    return (
      <div className="relative min-h-screen overflow-hidden text-white">
        <CreatedByTiadler />
        <AppToast toast={toast} onClose={() => setToast(null)} />

        <img
          src={CONNECT_BACKGROUND_SRC}
          alt="Ritual Paws background"
          className="absolute inset-0 h-full w-full object-cover opacity-22 mix-blend-screen"
          draggable={false}
        />

        <div className="absolute inset-0 bg-[#050505]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(64,255,175,0.12),transparent_22%),radial-gradient(circle_at_top_right,_rgba(136,64,255,0.12),transparent_18%),linear-gradient(rgba(64,255,175,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(64,255,175,0.035)_1px,transparent_1px)] bg-[length:auto,auto,38px_38px,38px_38px]" />

        <div className="relative z-10">
          <div className="mx-auto max-w-[92rem] px-6 py-12 lg:px-8 lg:py-14">
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(24rem,34rem)_minmax(28rem,34rem)] lg:justify-between lg:gap-10">
              <div className="w-full max-w-[34rem] space-y-7 lg:space-y-8">
                <div className="brand-chip inline-flex items-center gap-3 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/85 shadow-lg backdrop-blur-md">
                  <span className="text-[#40FFAF]">MVP On-chain</span>
                  <span className="h-1 w-1 rounded-full bg-white/35" />
                  <span>1 wallet = 1 pet</span>
                </div>

                <div>
                  <h1 className="max-w-[10ch] text-5xl font-bold uppercase tracking-[-0.02em] text-white sm:text-6xl lg:text-[4.75rem]">
                    Ritual Paws
                  </h1>

                  <p className="mt-4 max-w-[31rem] text-xl leading-9 text-white/70">
                    A sharper on-chain pet desk for raising, customizing, and showing off your Ritual companion.
                  </p>
                </div>

                <div className="flex flex-col items-start gap-4">
                  <ConnectWalletButton
                    onConnect={handleConnect}
                    onError={(message) =>
                      showToast('Wallet error', message, 'error')
                    }
                  />

                  <p className="max-w-[31rem] text-[15px] leading-7 text-white/58">
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <OverviewStat label="Chain" value="Ritual Testnet" />
                  <OverviewStat label="Mode" value="One wallet / one pet" />
                  <OverviewStat label="Output" value="Room + Card + Chat" />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="brand-panel brand-grid-surface relative w-full justify-self-end overflow-hidden rounded-[1.5rem] p-8 shadow-[0_48px_120px_-48px_rgba(64,255,175,0.24)] backdrop-blur-md sm:p-10 lg:p-12"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(64,255,175,0.12),transparent_26%),radial-gradient(circle_at_84%_82%,rgba(136,64,255,0.12),transparent_22%)]" />

                <div className="relative z-10 flex min-h-[20rem] flex-col justify-center">
                  <div className="max-w-[29rem]">
                    <div className="brand-kicker">Ritual Interface</div>

                    <div className="mt-5 text-4xl font-bold uppercase leading-[0.98] text-white sm:text-[3rem]">
                      Enter the pet workstation
                    </div>

                    <div className="mt-5 max-w-[28rem] text-lg leading-9 text-white/62 sm:text-[1.15rem]">
                      Start from a default companion, reshape its room and look, then export a card from a branded control surface instead of a generic game panel.
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-1 max-w-[92rem] px-6 pb-10 lg:pb-12">
            <CardMarquee />
          </div>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen text-white">
        <CreatedByTiadler />
        <AppToast toast={toast} onClose={() => setToast(null)} />

        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-[-0.02em]">
                Start your Ritual Paws
              </h1>
              <p className="mt-2 text-sm text-white/60">
                This wallet does not have a pet yet. The app will create a default pet and then let you customize its room and identity.
              </p>
            </div>

            <ConnectWalletButton
              connected
              address={walletAddress}
              onError={(message) =>
                showToast('Wallet error', message, 'error')
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="brand-panel rounded-[1.25rem] p-6">
              <div className="brand-kicker">Default setup</div>

              <div className="brand-tag mt-5 space-y-4 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-white/45">Default name</div>
                    <div className="mt-1 text-xl font-semibold">{DEFAULT_PET_NAME}</div>
                  </div>

                  <div>
                    <div className="text-sm text-white/45">Default pet</div>
                    <div className="mt-1 text-xl font-semibold">Pet(1) • Black</div>
                  </div>
                </div>

                <p className="text-sm leading-6 text-white/55">
                  After creation, you can adjust the room background, pet look, attached items, and display name from the workstation.
                </p>
              </div>

              <button
                onClick={handleAdopt}
                disabled={busyAction === 'adopt'}
                className="brand-button-primary mt-7 w-full px-6 py-4 font-bold transition disabled:opacity-60"
              >
                {busyAction === 'adopt' ? 'Confirming in wallet...' : 'Create Default Pet'}
              </button>
            </div>

            <div className="brand-panel brand-grid-surface rounded-[1.25rem] p-6">
              <div className="brand-kicker">Preview</div>

              <div className="mt-6 flex min-h-[430px] items-center justify-center rounded-[1.4rem] border border-[#40FFAF]/14 bg-[radial-gradient(circle_at_center,_rgba(64,255,175,0.10),transparent_42%)]">
                <div className="text-center">
                  <div className="mx-auto h-64 w-64 overflow-hidden rounded-[1rem] border border-[#40FFAF]/16 p-3">
                    <img
                      src={previewPetArt.src}
                      alt="Default pet preview"
                      onError={(event) =>
                        imageFallback(event, previewPetArt.fallbackSrc)
                      }
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="mt-5 text-3xl font-bold uppercase">
                    {DEFAULT_PET_NAME}
                  </div>
                  <div className="mt-2 text-white/60">Level 1 • 0 EXP • Black • Pet 1</div>
                </div>
              </div>
            </div>
          </div>

          {loadingPet ? (
            <div className="mt-6 text-center text-sm text-white/50">
              Loading on-chain data...
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <CreatedByTiadler />
      <AppToast toast={toast} onClose={() => setToast(null)} />
      <BackgroundMusic src={MAIN_BACKGROUND_MUSIC_SRC} />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  {isEditingPetName ? (
                    <>
                      <input
                        value={draftPetName}
                        onChange={(event) => setDraftPetName(event.target.value)}
                        maxLength={24}
                        className="w-[260px] border border-[#40FFAF]/22 bg-[#0C0C0C] px-4 py-2 text-2xl font-bold text-white outline-none transition focus:border-[#40FFAF]"
                        placeholder="Pet name..."
                        autoFocus
                      />

                      <button
                        onClick={handleSavePetName}
                        className="brand-button-primary px-3 py-2 text-sm font-bold transition"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => setIsEditingPetName(false)}
                        className="brand-button-secondary px-3 py-2 text-sm transition"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold uppercase tracking-[-0.02em]">
                        Ritual Paws / {activePetName}
                      </h1>

                      <button
                        onClick={handleStartEditPetName}
                        className="brand-button-secondary px-3 py-2 text-sm transition"
                      >
                        Edit name
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/56">
                  <span className="brand-chip px-3 py-1 text-[11px] uppercase tracking-[0.14em]">
                    Level {pet.level}
                  </span>
                  <span className="brand-chip px-3 py-1 text-[11px] uppercase tracking-[0.14em]">
                    {Number(pet.totalExp)} total EXP
                  </span>
                  {displayPetName && displayPetName !== pet.name ? (
                    <span className="brand-chip px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[#F6BE4F]">
                      name changed
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:-mt-2 lg:self-start">
            <div className="brand-tag flex items-center gap-2 px-4 py-2 text-sm">
              <span className="text-[#F6BE4F]">+</span>
              <span className="font-mono font-medium">{ritualBalance} RITUAL</span>
            </div>

            <ConnectWalletButton
              connected
              address={walletAddress}
              onError={(message) =>
                showToast('Wallet error', message, 'error')
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="brand-panel rounded-[1.25rem] p-6">
              <button
                onClick={() => setShowChat(true)}
                className="brand-button-danger flex w-full items-center justify-center gap-3 py-4 font-semibold transition-all active:scale-[0.985]"
              >
                <span className="text-xl">..</span>
                <span>Chat with Pet</span>
              </button>

              <p className="mt-3 text-center text-xs text-white/50">
                Current chat is simulated. Ritual AI integration can be v2.
              </p>
            </div>

            <div className="brand-panel rounded-[1.25rem] p-6">
              <div className="brand-kicker mb-4">Status</div>

              <StatusBars
                hunger={pet.hunger}
                happiness={pet.happiness}
                energy={pet.energy}
                cleanliness={pet.cleanliness}
              />
            </div>

            <div className="brand-panel rounded-[1.25rem] p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="brand-kicker">Quick actions</div>
                <div className="text-xs text-white/45">+20% / action</div>
              </div>

              <QuickActions
                onFeed={() => runAction('feed')}
                onPlay={() => runAction('play')}
                onSleep={() => runAction('sleep')}
                onClean={() => runAction('clean')}
                busyAction={busyAction}
              />

              <p className="mt-3 text-xs text-white/45">
                Each action costs 0.0015 RITUAL. Linear decay is previewed live in the workspace.
              </p>
            </div>
          </div>

          <div className="brand-panel overflow-hidden rounded-[1.25rem] shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#40FFAF]/14 px-6 py-4">
              <div className="font-semibold uppercase tracking-[0.08em]">
                {activePetName}&apos;s Room
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowInventory(true)}
                  className="brand-button-secondary flex items-center gap-2 px-4 py-1.5 text-sm transition-all"
                >
                  Inventory
                </button>

                <button
                  onClick={() => setShowCardModal(true)}
                  className="brand-button-primary px-4 py-1.5 text-sm font-semibold transition"
                >
                  Create Card
                </button>
              </div>
            </div>

            <RoomCanvas
              petName={activePetName}
              color={activePetColor}
              level={pet.level}
              expPercent={expPercent}
              mood={mood}
              equippedItems={equippedRoomItems}
              roomBackgroundSrc={selectedRoomBackground}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showChat && (
          <ChatModal
            onClose={() => setShowChat(false)}
            petLevel={`Lv. ${pet.level}`}
            mood={mood === 'Happy' ? 'happy' : mood === 'Balanced' ? 'normal' : 'sad'}
          />
        )}

        {showInventory && (
          <InventoryModal
            onClose={() => setShowInventory(false)}
            petColor={activePetColor}
            currentDisplayPetColor={activePetColor}
            currentEquippedItems={equippedRoomItems}
            currentRoomBackgroundSrc={selectedRoomBackground}
            onApply={(items, backgroundSrc, petColor) => {
              const nextDisplayPetColor = petColor || activePetColor

              setEquippedRoomItems(items)
              setSelectedRoomBackground(backgroundSrc)
              setDisplayPetColor(nextDisplayPetColor)

              saveAppearance(walletAddress, {
                equippedRoomItems: items,
                selectedRoomBackground: backgroundSrc,
                displayPetColor: nextDisplayPetColor,
                displayPetName: activePetName,
              })
            }}
          />
        )}

        <PetCardModal
          open={showCardModal}
          onClose={() => setShowCardModal(false)}
          petName={activePetName}
          subtitle="Ritual Paws Companion"
          mood={mood}
          level={pet.level}
          expPercent={expPercent}
          color={activePetColor}
          equippedItems={equippedRoomItems}
          roomBackgroundSrc={selectedRoomBackground}
        />
      </AnimatePresence>
    </div>
  )
}
