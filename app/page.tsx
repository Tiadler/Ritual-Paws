'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StatusBars } from '@/components/StatusBars'
import { QuickActions } from '@/components/QuickActions'
import { RoomCanvas, type EquippedRoomItem } from '@/components/RoomCanvas'
import { ChatModal } from '@/components/ChatModal'
import { InventoryModal } from '@/components/InventoryModal'
import { PetCardModal } from '@/components/PetCardModal'
import { ConnectWalletButton } from '@/components/ConnectWalletButton'
import {
  ACTION_PRICE,
  getRitualTomContract,
  getWalletBalance,
  readMyPet,
  RitualTomPet,
  shortAddress,
} from '@/lib/ritualTom'
import { getPetArtByColor, imageFallback } from '@/lib/staticAssets'

const DEFAULT_PET_NAME = 'Your Pet'
const DEFAULT_PET_COLOR = 'black'

const CAT_COLORS = [
  { id: 'black', label: 'Midnight Black', ring: 'from-slate-950 to-slate-700', emoji: '🐈‍⬛', petIndex: 1 },
  { id: 'white', label: 'Snow White', ring: 'from-white to-slate-200', emoji: '🐱', petIndex: 2 },
  { id: 'cream', label: 'Cream Vanilla', ring: 'from-amber-100 to-orange-200', emoji: '🐈', petIndex: 3 },
  { id: 'orange', label: 'Orange Tabby', ring: 'from-orange-300 to-orange-600', emoji: '🐱', petIndex: 4 },
  { id: 'gray', label: 'Silver Gray', ring: 'from-slate-300 to-slate-600', emoji: '😺', petIndex: 5 },
  { id: 'brown', label: 'Mocha Brown', ring: 'from-amber-700 to-yellow-900', emoji: '🐈', petIndex: 6 },
  { id: 'pink', label: 'Rose Pink', ring: 'from-pink-200 to-pink-500', emoji: '😽', petIndex: 7 },
  { id: 'blue', label: 'Sky Blue', ring: 'from-sky-200 to-blue-500', emoji: '🐱', petIndex: 8 },
  { id: 'purple', label: 'Magic Purple', ring: 'from-violet-300 to-purple-700', emoji: '🐱', petIndex: 9 },
  { id: 'green', label: 'Mint Green', ring: 'from-emerald-200 to-green-600', emoji: '🐱', petIndex: 10 },
]

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

export default function Page() {
  const [showChat, setShowChat] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)

  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [ritualBalance, setRitualBalance] = useState('0.0000')

  const [pet, setPet] = useState<RitualTomPet | null>(null)
  const [loadingPet, setLoadingPet] = useState(false)
  const [busyAction, setBusyAction] = useState('')

  // Inventory / appearance local state
  const [equippedRoomItems, setEquippedRoomItems] = useState<EquippedRoomItem[]>([])
  const [selectedRoomBackground, setSelectedRoomBackground] = useState<string | undefined>()
  const [displayPetColor, setDisplayPetColor] = useState<string | undefined>()
  const [displayPetName, setDisplayPetName] = useState<string | undefined>()

  // Edit display pet name
  const [draftPetName, setDraftPetName] = useState('')
  const [isEditingPetName, setIsEditingPetName] = useState(false)

  const mood = useMemo(() => getMood(pet), [pet])
  const expPercent = pet ? Math.round((pet.expInLevel / pet.expToNextLevel) * 100) : 0

  const previewPetArt = getPetArtByColor(DEFAULT_PET_COLOR)
  const activePetColor = displayPetColor || pet?.color || DEFAULT_PET_COLOR
  const activePetName = displayPetName || pet?.name || DEFAULT_PET_NAME

  const applySavedAppearance = (address: string) => {
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
  }

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
  }, [])

  const refreshPet = async (address?: string) => {
    try {
      setLoadingPet(true)

      const nextPet = await readMyPet()
      setPet(nextPet)

      const balance = await getWalletBalance(address || walletAddress)
      setRitualBalance(balance)
    } catch (error: any) {
      alert(error?.shortMessage || error?.message || 'Không đọc được pet on-chain.')
    } finally {
      setLoadingPet(false)
    }
  }

  const handleConnect = async (address: string) => {
    setWalletAddress(address)
    setIsConnected(true)

    await refreshPet(address)
    applySavedAppearance(address)
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
    } catch (error: any) {
      alert(error?.shortMessage || error?.reason || error?.message || 'Create pet thất bại.')
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
      alert('Please enter a pet name.')
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

  const runAction = async (action: 'feed' | 'play' | 'sleep' | 'clean') => {
    try {
      setBusyAction(action)

      const { contract, address } = await getRitualTomContract()
      let tx: any

      if (action === 'feed') tx = await contract.feed({ value: ACTION_PRICE })
      if (action === 'play') tx = await contract.play({ value: ACTION_PRICE })
      if (action === 'sleep') tx = await contract.sleepPet({ value: ACTION_PRICE })
      if (action === 'clean') tx = await contract.clean({ value: ACTION_PRICE })

      await tx.wait()
      await refreshPet(address)
    } catch (error: any) {
      alert(error?.shortMessage || error?.reason || error?.message || 'Action thất bại.')
    } finally {
      setBusyAction('')
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] text-white">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,107,157,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(0,229,196,0.14),transparent_30%)]" />

          <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
                  <span className="text-[#00E5C4]">MVP On-chain</span>
                  <span>1 wallet = 1 pet</span>
                </div>

                <div>
                  <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                    Ritual Paws
                  </h1>

                  <p className="mt-4 max-w-xl text-lg text-white/70">
                    Customize, raise, and share your on-chain companion.
                  </p>
                </div>

                <ConnectWalletButton onConnect={handleConnect} />

                <p className="text-sm text-white/60">
                  Connect MetaMask on Ritual Chain. Your wallet address is your user account.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[2rem] border border-white/10 bg-[#11111F]/80 p-10 shadow-[0_40px_120px_-40px_rgba(255,107,157,0.7)]"
              >
                <div className="text-6xl">🐾✨</div>

                <div className="mt-6 text-xl font-semibold">
                  Your first Ritual Paw is waiting.
                </div>

                <div className="mt-3 text-sm text-white/60">
                  Create one default pet first. You can rename, recolor, and style it after entering the room.
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] text-white">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Start your Ritual Paws</h1>
              <p className="mt-2 text-sm text-white/60">
                Ví này chưa có pet. App sẽ tạo mặc định Pet(1) màu đen, sau đó bạn có thể đổi tên, đổi pet, đổi item trong Inventory.
              </p>
            </div>

            <ConnectWalletButton connected address={walletAddress} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-white/10 bg-[#1A1A2E] p-6">
              <div className="text-sm uppercase tracking-[0.25em] text-white/50">
                Default setup
              </div>

              <div className="mt-5 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
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
                  Không cần chọn tên/màu ở bước đầu. Sau khi tạo pet, bạn vào Inventory để đổi màu Pet, chỉnh item, background và đổi tên hiển thị trong room.
                </p>
              </div>

              <button
                onClick={handleAdopt}
                disabled={busyAction === 'adopt'}
                className="mt-7 w-full rounded-2xl bg-gradient-to-r from-[#00E5C4] to-[#FFD700] px-6 py-4 font-bold text-[#0F172A] transition hover:brightness-110 disabled:opacity-60"
              >
                {busyAction === 'adopt' ? 'Confirming in MetaMask...' : 'Create Default Pet'}
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#11111F] p-6">
              <div className="text-sm uppercase tracking-[0.25em] text-white/50">
                Preview
              </div>

              <div className="mt-6 flex min-h-[430px] items-center justify-center rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_center,_rgba(0,229,196,0.13),transparent_45%)]">
                <div className="text-center">
                  <div className="mx-auto h-64 w-64 overflow-hidden rounded-[2rem] p-3">
                    <img
                      src={previewPetArt.src}
                      alt="Default pet preview"
                      onError={(event) => imageFallback(event, previewPetArt.fallbackSrc)}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="mt-5 text-3xl font-bold">{DEFAULT_PET_NAME}</div>
                  <div className="mt-2 text-white/60">
                    Level 1 • 0 EXP • Black • Pet 1
                  </div>
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
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-4xl">🐾</div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  {isEditingPetName ? (
                    <>
                      <input
                        value={draftPetName}
                        onChange={(event) => setDraftPetName(event.target.value)}
                        maxLength={24}
                        className="w-[260px] rounded-2xl border border-white/10 bg-[#11111F] px-4 py-2 text-2xl font-bold text-white outline-none transition focus:border-[#00E5C4]"
                        placeholder="Pet name..."
                        autoFocus
                      />

                      <button
                        onClick={handleSavePetName}
                        className="rounded-xl bg-[#00E5C4] px-3 py-2 text-sm font-bold text-black transition hover:bg-[#00E5C4]/90"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => setIsEditingPetName(false)}
                        className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold tracking-tight">
                        Ritual Paws - {activePetName}
                      </h1>

                      <button
                        onClick={handleStartEditPetName}
                        className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10"
                      >
                        ✏️ Edit name
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-2 text-sm text-white/60">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00E5C4]/20 text-[#00E5C4] text-xs font-medium capitalize">
                    {activePetColor}
                  </span>

                  <span>Level {pet.level}</span>
                  <span>•</span>
                  <span>{Number(pet.totalExp)} total EXP</span>

                  {displayPetColor && displayPetColor !== pet.color ? (
                    <>
                      <span>•</span>
                      <span className="text-[#FFD700]">display changed</span>
                    </>
                  ) : null}

                  {displayPetName && displayPetName !== pet.name ? (
                    <>
                      <span>•</span>
                      <span className="text-[#FFD700]">name changed</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={() => refreshPet(walletAddress)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              {loadingPet ? 'Syncing...' : 'Sync On-chain'}
            </button>

            <div className="bg-white/5 px-4 py-2 rounded-2xl flex items-center gap-2 text-sm">
              <span className="text-[#FFD700]">✨</span>
              <span className="font-mono font-medium">{ritualBalance} RITUAL</span>
            </div>

            <ConnectWalletButton connected address={walletAddress} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-6">
          <div className="space-y-6">
            <div className="bg-[#1A1A2E] rounded-3xl p-6 border border-white/10">
              <div className="text-sm font-medium text-white/60 mb-4">
                STATUS
              </div>

              <StatusBars
                hunger={pet.hunger}
                happiness={pet.happiness}
                energy={pet.energy}
                cleanliness={pet.cleanliness}
              />
            </div>

            <div className="bg-[#1A1A2E] rounded-3xl p-6 border border-white/10">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-white/60">
                  QUICK ACTIONS
                </div>

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
                Each turn costs 0.0015 RITUAL. EXP is added based on the percentage of actual recovery:
                20% recovery = +20 EXP.
              </p>
            </div>

            <div className="bg-[#1A1A2E] rounded-3xl p-6 border border-white/10">
              <button
                onClick={() => setShowChat(true)}
                className="w-full py-4 bg-gradient-to-r from-[#FF6B9D] to-[#FF8FB3] rounded-2xl font-semibold flex items-center justify-center gap-3 hover:brightness-110 transition-all active:scale-[0.985]"
              >
                <span className="text-xl">💬</span>
                <span>Chat with Pet</span>
              </button>

              <p className="text-center text-xs text-white/50 mt-3">
                Current chat is simulated. Ritual AI integration can be v2.
              </p>
            </div>
          </div>

          <div className="bg-[#1A1A2E] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="font-semibold">{activePetName}'s Room</div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowInventory(true)}
                  className="text-sm px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-2 transition-all"
                >
                  🎒 Inventory
                </button>

                <button
                  onClick={() => setShowCardModal(true)}
                  className="text-sm px-4 py-1.5 bg-gradient-to-r from-[#00E5C4] to-[#FFD700] text-[#0F172A] rounded-xl font-semibold transition hover:brightness-110"
                >
                  🖼️ Create Card
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