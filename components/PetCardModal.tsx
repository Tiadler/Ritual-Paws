'use client'

import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toPng } from 'html-to-image'
import { mintRitualPawsCard } from '@/lib/ritualPawsCardNft'
import { CardCollectionModal } from '@/components/CardCollectionModal'
import {
  DEFAULT_ROOM_BACKGROUND,
  getPetArtByColor,
} from '@/lib/staticAssets'
import type { EquippedRoomItem, ItemPlacement } from '@/components/RoomCanvas'

interface PetCardModalProps {
  open: boolean
  onClose: () => void
  petName: string
  subtitle?: string
  mood: string
  level: number
  expPercent: number
  color: string
  equippedItems?: EquippedRoomItem[]
  roomBackgroundSrc?: string
}

type CardTheme = {
  cardStyle: CSSProperties
  headerStyle: CSSProperties
  backStyle: CSSProperties
  slabStyle: CSSProperties
  infoStyle: CSSProperties
  badgeStyle: CSSProperties
  stageBorderColor: string
  borderColor: string
  textAccentColor: string
  downloadBg: string
}

type MintResultModal = {
  open: boolean
  status: 'success' | 'error'
  title: string
  message: string
  txHash?: string
}

const CARD_SPIN_DURATION = 6
const CARD_THICKNESS = 12

const LEVEL_COLORS = [
  { main: '#22C55E', dark1: '#042A14', dark2: '#031E10', header1: '#064E2A', header2: '#053D21', accent: '#BBF7D0' },
  { main: '#10B981', dark1: '#04311F', dark2: '#032116', header1: '#065F46', header2: '#054737', accent: '#A7F3D0' },
  { main: '#14B8A6', dark1: '#062A2A', dark2: '#041A1A', header1: '#0F766E', header2: '#0B5B55', accent: '#99F6E4' },
  { main: '#06B6D4', dark1: '#062C34', dark2: '#031923', header1: '#0E7490', header2: '#155E75', accent: '#A5F3FC' },
  { main: '#0EA5E9', dark1: '#06233A', dark2: '#031426', header1: '#0369A1', header2: '#075985', accent: '#BAE6FD' },
  { main: '#3B82F6', dark1: '#081E46', dark2: '#06122A', header1: '#1D4ED8', header2: '#1E3A8A', accent: '#BFDBFE' },
  { main: '#6366F1', dark1: '#101849', dark2: '#090E2C', header1: '#4338CA', header2: '#312E81', accent: '#C7D2FE' },
  { main: '#8B5CF6', dark1: '#181044', dark2: '#0F0929', header1: '#6D28D9', header2: '#4C1D95', accent: '#DDD6FE' },
  { main: '#A855F7', dark1: '#220B43', dark2: '#130625', header1: '#7E22CE', header2: '#581C87', accent: '#E9D5FF' },
  { main: '#D946EF', dark1: '#2B0A3A', dark2: '#18051F', header1: '#A21CAF', header2: '#701A75', accent: '#F5D0FE' },
  { main: '#EC4899', dark1: '#360A28', dark2: '#1E0617', header1: '#BE185D', header2: '#831843', accent: '#FBCFE8' },
  { main: '#F43F5E', dark1: '#3C0A18', dark2: '#21060D', header1: '#BE123C', header2: '#881337', accent: '#FFE4E6' },
  { main: '#EF4444', dark1: '#3A0B0B', dark2: '#200505', header1: '#B91C1C', header2: '#7F1D1D', accent: '#FECACA' },
  { main: '#F97316', dark1: '#3A1606', dark2: '#1E0B03', header1: '#C2410C', header2: '#7C2D12', accent: '#FED7AA' },
  { main: '#F59E0B', dark1: '#3A2105', dark2: '#201103', header1: '#B45309', header2: '#78350F', accent: '#FDE68A' },
  { main: '#EAB308', dark1: '#352805', dark2: '#1B1502', header1: '#A16207', header2: '#713F12', accent: '#FEF08A' },
  { main: '#84CC16', dark1: '#233506', dark2: '#111D02', header1: '#65A30D', header2: '#3F6212', accent: '#D9F99D' },
  { main: '#2DD4BF', dark1: '#073630', dark2: '#031D1A', header1: '#0F766E', header2: '#115E59', accent: '#CCFBF1' },
  { main: '#34D399', dark1: '#063827', dark2: '#031B12', header1: '#047857', header2: '#065F46', accent: '#D1FAE5' },
  { main: '#FFD700', dark1: '#160A25', dark2: '#0B0615', header1: '#3B1E68', header2: '#7A4B00', accent: '#FEF3C7' },
]

const FIREFLIES = [
  { left: '8%', bottom: '-8%', size: 5, duration: 7.5, delay: 0, drift: 24, blur: 0, opacity: 0.9 },
  { left: '14%', bottom: '-10%', size: 7, duration: 9.2, delay: 1.1, drift: 16, blur: 1, opacity: 0.75 },
  { left: '21%', bottom: '-7%', size: 4, duration: 6.8, delay: 0.6, drift: 22, blur: 0, opacity: 0.85 },
  { left: '29%', bottom: '-12%', size: 6, duration: 8.7, delay: 2.1, drift: 18, blur: 1, opacity: 0.65 },
  { left: '36%', bottom: '-9%', size: 3, duration: 7.1, delay: 1.7, drift: 26, blur: 0, opacity: 0.9 },
  { left: '44%', bottom: '-11%', size: 8, duration: 10.5, delay: 0.3, drift: 14, blur: 1, opacity: 0.6 },
  { left: '52%', bottom: '-8%', size: 4, duration: 7.9, delay: 1.3, drift: 20, blur: 0, opacity: 0.85 },
  { left: '60%', bottom: '-10%', size: 6, duration: 9.8, delay: 2.6, drift: 17, blur: 1, opacity: 0.7 },
  { left: '68%', bottom: '-7%', size: 5, duration: 7.4, delay: 0.9, drift: 22, blur: 0, opacity: 0.8 },
  { left: '76%', bottom: '-12%', size: 7, duration: 10.1, delay: 1.9, drift: 15, blur: 1, opacity: 0.65 },
  { left: '84%', bottom: '-9%', size: 4, duration: 8.3, delay: 0.4, drift: 28, blur: 0, opacity: 0.9 },
  { left: '91%', bottom: '-8%', size: 6, duration: 9.4, delay: 2.2, drift: 12, blur: 1, opacity: 0.75 },
]

function getAssetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src
}

function getPlacementStyle(placement: ItemPlacement): CSSProperties {
  return {
    left: `${placement.left}%`,
    top: `${placement.top}%`,
    width: `${placement.width}%`,
    transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
    zIndex: placement.zIndex,
  }
}

function getThemeByLevel(level: number): CardTheme {
  const safeLevel = Math.max(1, Math.min(20, Number(level) || 1))
  const color = LEVEL_COLORS[safeLevel - 1]
  const isLegendary = safeLevel === 20

  return {
    cardStyle: {
      background: isLegendary
        ? `radial-gradient(circle at top left, rgba(255,215,0,0.24), transparent 34%), radial-gradient(circle at top right, rgba(177,102,255,0.22), transparent 38%), linear-gradient(180deg, ${color.dark1} 0%, ${color.dark2} 100%)`
        : `radial-gradient(circle at top, ${color.main}2E, transparent 40%), linear-gradient(180deg, ${color.dark1} 0%, ${color.dark2} 100%)`,
      boxShadow: isLegendary
        ? `0 0 76px rgba(255,215,0,0.42)`
        : `0 0 60px ${color.main}66`,
      borderColor: color.accent,
    },
    headerStyle: {
      background: isLegendary
        ? `linear-gradient(135deg, #3B1E68 0%, #2A174E 42%, #7A4B00 100%)`
        : `linear-gradient(180deg, ${color.header1} 0%, ${color.header2} 100%)`,
    },
    backStyle: {
      background: isLegendary
        ? `radial-gradient(circle at top, rgba(255,215,0,0.20), transparent 35%), radial-gradient(circle at center, rgba(177,102,255,0.18), transparent 42%), linear-gradient(180deg, #1E1037 0%, #0D0718 100%)`
        : `radial-gradient(circle at center, ${color.main}26, transparent 34%), linear-gradient(180deg, ${color.dark1} 0%, ${color.dark2} 100%)`,
      boxShadow: isLegendary
        ? `0 0 76px rgba(255,215,0,0.42)`
        : `0 0 60px ${color.main}66`,
      borderColor: color.accent,
    },
    slabStyle: {
      background: `${color.dark2}E6`,
    },
    infoStyle: {
      background: `${color.dark1}D9`,
    },
    badgeStyle: {
      background: `${color.main}33`,
      color: color.accent,
    },
    stageBorderColor: `${color.main}40`,
    borderColor: color.accent,
    textAccentColor: color.accent,
    downloadBg: color.dark2,
  }
}

export function PetCardModal({
  open,
  onClose,
  petName,
  subtitle = 'Ritual Paws Companion',
  mood,
  level,
  expPercent,
  color,
  equippedItems = [],
  roomBackgroundSrc,
}: PetCardModalProps) {
  const cardFrontRef = useRef<HTMLDivElement | null>(null)

  const [downloading, setDownloading] = useState(false)
  const [mintingNft, setMintingNft] = useState(false)
  const [showCollection, setShowCollection] = useState(false)

  const [mintResultModal, setMintResultModal] = useState<MintResultModal>({
    open: false,
    status: 'success',
    title: '',
    message: '',
  })

  const petArt = getPetArtByColor(color)
  const finalRoomBackgroundSrc =
    roomBackgroundSrc || getAssetSrc(DEFAULT_ROOM_BACKGROUND)

  const theme = useMemo(() => getThemeByLevel(level), [level])

  const closeMintResultModal = () => {
    setMintResultModal((prev) => ({
      ...prev,
      open: false,
    }))
  }

  const handleDownload = async () => {
    if (!cardFrontRef.current) return

    try {
      setDownloading(true)

      const dataUrl = await toPng(cardFrontRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: theme.downloadBg,
      })

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${petName.replace(/\s+/g, '-').toLowerCase()}-ritual-paws-card.png`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error(error)
    } finally {
      setDownloading(false)
    }
  }

  const handleMintCardNft = async () => {
    if (!cardFrontRef.current) return

    try {
      setMintingNft(true)

      const imageDataUrl = await toPng(cardFrontRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: theme.downloadBg,
      })

      const uploadResponse = await fetch('/api/upload-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          petName,
          level,
          mood,
          expPercent,
        }),
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData?.error || 'Could not upload card metadata.')
      }

      if (!uploadData?.metadataURI) {
        throw new Error('Missing metadataURI from upload response.')
      }

      const result = await mintRitualPawsCard(uploadData.metadataURI)

      setMintResultModal({
        open: true,
        status: 'success',
        title: 'NFT minted successfully',
        message: 'Your Ritual Paws card has been minted on Ritual testnet.',
        txHash: result.txHash,
      })
    } catch (error: any) {
      console.error(error)

      setMintResultModal({
        open: true,
        status: 'error',
        title: 'Mint failed',
        message: error?.message || 'Could not mint NFT. Please try again.',
      })
    } finally {
      setMintingNft(false)
    }
  }

  const handleShareToX = () => {
    const text = encodeURIComponent(
      `Meet ${petName}, my Ritual Paws companion 🐾✨\nLevel ${level} • Mood: ${mood}`
    )

    const url =
      typeof window !== 'undefined'
        ? encodeURIComponent(window.location.href)
        : ''

    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-4 lg:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22 }}
          className="flex max-h-[94vh] w-full max-w-[1080px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#11111F] shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
            <div>
              <div className="text-base font-semibold text-white sm:text-lg">
                Create Ritual Paws Card
              </div>
              <div className="mt-1 text-[11px] text-white/45 sm:text-xs">
                Your card syncs with your current pet, equipped items, and room background.
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl bg-white/5 px-3 py-2 text-xl leading-none text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
              <div className="relative min-h-[560px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,#0A1017_0%,#0B131B_42%,#0A0F16_100%)] px-3 py-5 sm:min-h-[650px] sm:px-5 sm:py-7 lg:min-h-[760px] lg:px-6 lg:py-8">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute inset-x-0 bottom-0 h-44 bg-[radial-gradient(circle_at_bottom,_rgba(255,255,255,0.08),transparent_65%)]" />

                  {FIREFLIES.map((firefly, index) => (
                    <motion.span
                      key={index}
                      className="absolute rounded-full bg-white"
                      style={{
                        left: firefly.left,
                        bottom: firefly.bottom,
                        width: firefly.size,
                        height: firefly.size,
                        filter: firefly.blur ? `blur(${firefly.blur}px)` : 'none',
                        boxShadow: '0 0 12px rgba(255,255,255,0.7)',
                      }}
                      initial={{ y: 0, x: 0, opacity: 0 }}
                      animate={{
                        y: [0, -120, -260, -420, -620],
                        x: [0, firefly.drift, -firefly.drift / 2, firefly.drift / 3, 0],
                        opacity: [0, firefly.opacity, firefly.opacity * 0.85, firefly.opacity * 0.5, 0],
                      }}
                      transition={{
                        duration: firefly.duration,
                        delay: firefly.delay,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 flex h-full items-center justify-center">
                  <div
                    className="relative w-[min(430px,calc(100vw-72px))] aspect-[430/720] max-h-[68vh] sm:max-h-[72vh] lg:max-h-[720px]"
                    style={{
                      perspective: '1800px',
                    }}
                  >
                    <motion.div
                      className="relative h-full w-full"
                      animate={{ rotateY: [0, 180, 360] }}
                      transition={{
                        duration: CARD_SPIN_DURATION,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <div
                        className="absolute inset-[4px] rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
                        style={{
                          ...theme.slabStyle,
                          transform: 'translateZ(0px)',
                        }}
                      />

                      <div
                        ref={cardFrontRef}
                        className="absolute inset-0 flex flex-col overflow-hidden rounded-[34px] border-[3px]"
                        style={{
                          ...theme.cardStyle,
                          transform: `translateZ(${CARD_THICKNESS / 2}px)`,
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                        }}
                      >
                        <div className="absolute inset-0 rounded-[34px] ring-1 ring-white/10" />

                        <div
                          className="relative shrink-0 px-[5.8%] pb-[5%] pt-[5%]"
                          style={theme.headerStyle}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-[clamp(8px,2.5vw,11px)] font-bold uppercase tracking-[0.28em] text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.55)]">
                                Ritual Paws Card
                              </div>

                              <div className="mt-[3%] truncate text-[clamp(30px,9vw,48px)] font-bold leading-none text-white drop-shadow-[0_0_18px_rgba(0,229,196,0.75)]">
                                {petName}
                              </div>

                              <div
                                className="mt-[2.5%] text-[clamp(12px,3.4vw,17px)] font-medium drop-shadow-[0_0_10px_rgba(0,229,196,0.55)]"
                                style={{ color: theme.textAccentColor }}
                              >
                                {subtitle}
                              </div>
                            </div>

                            <div
                              className="shrink-0 rounded-full px-[3.7%] py-[1.8%] text-[clamp(10px,3vw,14px)] font-bold shadow-[0_0_14px_rgba(255,255,255,0.22)] drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]"
                              style={theme.badgeStyle}
                            >
                              LV. {level}
                            </div>
                          </div>
                        </div>

                        <div className="relative flex flex-1 flex-col px-[5.8%] pb-[5.8%] pt-[5.2%]">
                          <div
                            className="relative flex-[1.45] overflow-hidden rounded-[28px] border"
                            style={{ borderColor: theme.stageBorderColor }}
                          >
                            <img
                              src={finalRoomBackgroundSrc}
                              alt="Card room background"
                              className="absolute inset-0 h-full w-full object-cover"
                              draggable={false}
                            />

                            <div className="absolute inset-0 bg-black/10" />

                            <div
                              className="absolute inset-0 flex items-center justify-center"
                              style={{
                                transform: 'translate(-10px, 50px)',
                              }}
                            >
                              <div className="relative h-[82%] w-[82%] max-h-[270px] max-w-[270px]">
                                <img
                                  src={petArt.src}
                                  alt={`${petName} pet`}
                                  className="absolute inset-0 z-10 h-full w-full object-contain"
                                  draggable={false}
                                />

                                {equippedItems.map((item) => (
                                  <img
                                    key={item.id}
                                    src={item.src}
                                    alt={item.name}
                                    className="absolute select-none drop-shadow-lg"
                                    style={getPlacementStyle(item.placement)}
                                    draggable={false}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-[5%] grid shrink-0 grid-cols-[1fr_1.45fr] gap-[3.8%]">
                            <div
                              className="flex min-h-[122px] flex-col justify-start rounded-[22px] px-[12%] py-[12%]"
                              style={theme.infoStyle}
                            >
                              <div className="h-[24px] text-[clamp(11px,3.2vw,15px)] font-extrabold uppercase leading-[24px] tracking-[0.22em] text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]">
                                Mood
                              </div>

                              <div className="mt-[10%] text-[clamp(17px,4.6vw,23px)] font-bold leading-none text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]">
                                {mood}
                              </div>
                            </div>

                            <div
                              className="flex min-h-[122px] items-center rounded-[22px] px-[8%] py-[8%]"
                              style={theme.infoStyle}
                            >
                              <div className="grid w-full grid-cols-[clamp(50px,13vw,64px)_minmax(0,1fr)] items-center gap-[8%]">
                                <div className="flex h-[clamp(50px,13vw,64px)] w-[clamp(50px,13vw,64px)] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
                                  <img
                                    src="/static/ball/ball(1).png"
                                    alt="Ritual icon"
                                    className="h-[clamp(68px,17vw,84px)] w-[clamp(68px,17vw,84px)] scale-125 object-cover"
                                    draggable={false}
                                  />
                                </div>

                                <div className="flex min-w-0 flex-col justify-start">
                                  <div className="h-[24px] text-[clamp(11px,3.2vw,15px)] font-extrabold uppercase leading-[24px] tracking-[0.22em] text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]">
                                    VIBES
                                  </div>

                                  <div className="mt-[10%] text-[clamp(17px,4.6vw,23px)] font-bold leading-none text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]">
                                    Ritual
                                  </div>

                                  <div className="mt-[6%] text-[clamp(10px,2.9vw,13px)] leading-tight text-white/65 drop-shadow-[0_0_7px_rgba(255,255,255,0.3)]">
                                    Let the Ritual begin!
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-[4%] shrink-0 text-center text-[clamp(9px,2.8vw,12px)] text-white/65 drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]">
                            EXP {expPercent}% • Synced with room appearance
                          </div>
                        </div>
                      </div>

                      <div
                        className="absolute inset-0 overflow-hidden rounded-[34px] border-[3px]"
                        style={{
                          ...theme.backStyle,
                          transform: `rotateY(180deg) translateZ(${CARD_THICKNESS / 2}px)`,
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                        }}
                      >
                        <div className="absolute inset-0 rounded-[34px] ring-1 ring-white/10" />

                        <div className="absolute inset-0 opacity-35">
                          <div className="absolute left-[-20%] top-[-12%] h-[32%] w-[32%] rounded-full bg-white/10 blur-3xl" />
                          <div className="absolute bottom-[-14%] right-[-16%] h-[36%] w-[36%] rounded-full bg-white/10 blur-3xl" />
                        </div>

                        <div className="relative flex h-full flex-col justify-between px-[7.4%] py-[7.4%]">
                          <div>
                            <div className="text-[clamp(8px,2.5vw,11px)] font-bold uppercase tracking-[0.28em] text-white/80">
                              Ritual Paws
                            </div>

                            <div className="mt-[6%] text-[clamp(30px,9vw,42px)] font-bold leading-tight text-white">
                              {petName}
                            </div>

                            <div
                              className="mt-[2%] text-[clamp(13px,3.8vw,18px)]"
                              style={{ color: theme.textAccentColor }}
                            >
                              Companion Card
                            </div>
                          </div>

                          <div className="flex flex-1 items-center justify-center">
                            <div className="flex flex-col items-center">
                              <div className="flex h-[clamp(108px,32vw,144px)] w-[clamp(108px,32vw,144px)] items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
                                <img
                                  src="/static/ball/ball(1).png"
                                  alt="Ritual icon"
                                  className="h-[clamp(148px,42vw,190px)] w-[clamp(148px,42vw,190px)] scale-125 object-cover"
                                  draggable={false}
                                />
                              </div>

                              <div className="mt-[12%] text-center">
                                <div className="text-[clamp(22px,6.8vw,30px)] font-bold text-white">
                                  Ritual Paws
                                </div>

                                <div className="mt-[4%] max-w-[280px] text-[clamp(11px,3.2vw,14px)] leading-6 text-white/60">
                                  Your customizable on-chain companion identity.
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-center text-[clamp(8px,2.6vw,12px)] uppercase tracking-[0.24em] text-white/35">
                            Made By Tiadler
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Export options
                  </div>

                  <div className="mt-2 text-sm leading-6 text-white/55">
                    Download the front card as PNG or mint the front card as an NFT on Ritual testnet.
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="rounded-2xl border border-[#00E5C4]/30 bg-[#00E5C4]/10 px-5 py-3 text-sm font-semibold text-[#00E5C4] transition hover:bg-[#00E5C4]/20 disabled:opacity-60"
                    >
                      {downloading ? 'Downloading...' : 'Download PNG'}
                    </button>

                    <button
                      onClick={handleMintCardNft}
                      disabled={mintingNft}
                      className="rounded-2xl bg-gradient-to-r from-[#00E5C4] to-[#FFD700] px-5 py-3 text-sm font-bold text-[#0F172A] transition hover:brightness-110 disabled:opacity-60"
                    >
                      {mintingNft ? 'Minting NFT...' : 'Mint NFT'}
                    </button>
                  </div>

                  <button
                    onClick={handleShareToX}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Share on X
                  </button>

                  <button
                    onClick={() => setShowCollection(true)}
                    className="w-full rounded-2xl border border-[#FFD700]/30 bg-[#FFD700]/10 px-5 py-3 text-sm font-semibold text-[#FFD700] transition hover:bg-[#FFD700]/20"
                  >
                    Collection Card
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <CardCollectionModal
          open={showCollection}
          onClose={() => setShowCollection(false)}
        />

        {mintResultModal.open ? (
          <div
            className="fixed inset-0 z-[180] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-[#11111F] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      mintResultModal.status === 'success'
                        ? 'bg-[#00E5C4]/15 text-[#00E5C4]'
                        : 'bg-red-500/15 text-red-300'
                    }`}
                  >
                    {mintResultModal.status === 'success' ? '✓' : '!'}
                  </div>

                  <div>
                    <div className="text-base font-bold text-white">
                      {mintResultModal.title}
                    </div>

                    <div className="mt-0.5 text-xs text-white/45">
                      Ritual Paws Card NFT
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeMintResultModal}
                  className="rounded-xl bg-white/5 px-3 py-2 text-lg leading-none text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 px-5 py-5">
                <p className="text-sm leading-6 text-white/65">
                  {mintResultModal.message}
                </p>

                {mintResultModal.txHash ? (
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                      Transaction
                    </div>

                    <div className="mt-2 break-all font-mono text-xs leading-5 text-[#00E5C4]">
                      {mintResultModal.txHash}
                    </div>
                  </div>
                ) : null}

                <button
                  onClick={closeMintResultModal}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#00E5C4] to-[#FFD700] px-5 py-3 text-sm font-bold text-[#0F172A] transition hover:brightness-110"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </div>
    </AnimatePresence>
  )
}
