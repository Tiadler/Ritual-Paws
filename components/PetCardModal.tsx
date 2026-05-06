'use client'

import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toPng } from 'html-to-image'
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

// ===============================
// CHỈNH NHANH Ở ĐÂY
// ===============================
const CARD_SPIN_DURATION = 6
const CARD_WIDTH = 430
const CARD_HEIGHT = 720
const CARD_THICKNESS = 12 // tăng "độ dày" visual của card

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

function getPlacementStyle(placement: ItemPlacement): React.CSSProperties {
  return {
    left: `${placement.left}%`,
    top: `${placement.top}%`,
    width: `${placement.width}%`,
    transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
    zIndex: placement.zIndex,
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

  const petArt = getPetArtByColor(color)
  const finalRoomBackgroundSrc =
    roomBackgroundSrc || getAssetSrc(DEFAULT_ROOM_BACKGROUND)

  const theme = useMemo(() => {
    if (level >= 20) {
      return {
        shell:
          'bg-[radial-gradient(circle_at_top,_rgba(180,120,255,0.18),transparent_40%),linear-gradient(180deg,#120A24_0%,#180F2D_100%)]',
        glow: 'shadow-[0_0_55px_rgba(177,102,255,0.42)]',
        border: 'border-violet-200',
        header: 'bg-[linear-gradient(180deg,#2A174E_0%,#1C1137_100%)]',
        stageBorder: 'border-violet-500/20',
        badge: 'bg-violet-400/20 text-violet-100',
        infoBg: 'bg-[#1A1230]/80',
        textAccent: 'text-violet-200',
        backBg:
          'bg-[radial-gradient(circle_at_center,_rgba(177,102,255,0.16),transparent_38%),linear-gradient(180deg,#1E1037_0%,#0D0718_100%)]',
        slabBg: 'bg-[#120A24]/85',
      }
    }

    return {
      shell:
        'bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.16),transparent_40%),linear-gradient(180deg,#042A14_0%,#031E10_100%)]',
      glow: 'shadow-[0_0_60px_rgba(34,197,94,0.35)]',
      border: 'border-emerald-100',
      header: 'bg-[linear-gradient(180deg,#064E2A_0%,#053D21_100%)]',
      stageBorder: 'border-emerald-500/20',
      badge: 'bg-emerald-400/20 text-emerald-100',
      infoBg: 'bg-[#062B17]/85',
      textAccent: 'text-emerald-200',
      backBg:
        'bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,#04311A_0%,#02140C_58%,#010A06_100%)]',
      slabBg: 'bg-[#03150D]/90',
    }
  }, [level])

  const handleDownload = async () => {
    if (!cardFrontRef.current) return

    try {
      setDownloading(true)

      const dataUrl = await toPng(cardFrontRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: level >= 20 ? '#120A24' : '#031E10',
      })

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${petName.replace(/\s+/g, '-').toLowerCase()}-ritual-paws-card.png`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error(error)
      alert('Không tải card được. Kiểm tra đã cài html-to-image chưa: npm i html-to-image')
    } finally {
      setDownloading(false)
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
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22 }}
          className="w-full max-w-[1080px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#11111F] shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <div className="text-lg font-semibold text-white">
                Create Ritual Paws Card
              </div>
              <div className="mt-1 text-xs text-white/45">
                The card synchronizes with the current pet, item, and room background. The preview is currently being spun in 3D.
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl bg-white/5 px-3 py-2 text-xl leading-none text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_300px]">
            {/* LEFT: preview area */}
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,#0A1017_0%,#0B131B_42%,#0A0F16_100%)] px-6 py-8">
              {/* fireflies background */}
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

              <div className="relative z-10 flex justify-center">
                <div
                  className="relative"
                  style={{
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
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
                    {/* MIDDLE SLAB - tạo cảm giác card dày hơn */}
                    <div
                      className={`absolute inset-[4px] rounded-[32px] ${theme.slabBg} shadow-[0_16px_40px_rgba(0,0,0,0.35)]`}
                      style={{
                        transform: `translateZ(0px)`,
                      }}
                    />

                    {/* FRONT CARD */}
                    <div
                      ref={cardFrontRef}
                      className={`absolute inset-0 overflow-hidden rounded-[34px] border-[3px] ${theme.border} ${theme.shell} ${theme.glow}`}
                      style={{
                        transform: `translateZ(${CARD_THICKNESS / 2}px)`,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                    >
                      <div className="absolute inset-0 rounded-[34px] ring-1 ring-white/10" />

                      <div className={`relative px-6 pb-6 pt-5 ${theme.header}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/80">
                              Ritual Paws Card
                            </div>

                            <div className="mt-3 text-[48px] font-bold leading-none text-white">
                              {petName}
                            </div>

                            <div className={`mt-2 text-[17px] font-medium ${theme.textAccent}`}>
                              {subtitle}
                            </div>
                          </div>

                          <div className={`rounded-full px-4 py-2 text-[14px] font-bold ${theme.badge}`}>
                            LV. {level}
                          </div>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-5">
                        <div
                          className={`relative h-[300px] overflow-hidden rounded-[28px] border ${theme.stageBorder}`}
                        >
                          <img
                            src={finalRoomBackgroundSrc}
                            alt="Card room background"
                            className="absolute inset-0 h-full w-full object-cover"
                            draggable={false}
                          />

                          <div className="absolute inset-0 bg-black/10" />

                          <div className="absolute inset-0">
                            <div
                              className="absolute h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2"
                              style={{
                                left: '50%',
                                top: '50%',
                              }}
                            >
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

                        <div className="mt-5 grid grid-cols-[1fr_1.45fr] gap-4">
                          <div className={`rounded-[22px] ${theme.infoBg} px-5 py-4`}>
                            <div className="text-[12px] font-bold uppercase tracking-[0.22em] text-white/70">
                              Mood
                            </div>

                            <div className="mt-3 text-[18px] font-semibold text-white">
                              {mood}
                            </div>
                          </div>

                          <div className={`rounded-[22px] ${theme.infoBg} px-5 py-4`}>
                            <div className="flex h-full items-center gap-4">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
                                <img
                                  src="/static/ball/ball(1).png"
                                  alt="Ritual icon"
                                  className="h-[72px] w-[72px] scale-125 object-cover"
                                  draggable={false}
                                />
                              </div>

                              <div>
                                <div className="text-[12px] font-bold uppercase tracking-[0.22em] text-white/70">
                                  Ritual
                                </div>

                                <div className="mt-2 text-[18px] font-semibold text-white">
                                  Ritual
                                </div>

                                <div className="mt-1 text-[13px] text-white/55">
                                  On-chain pet identity
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 text-center text-[12px] text-white/45">
                          EXP {expPercent}% • Synced with room appearance
                        </div>
                      </div>
                    </div>

                    {/* BACK CARD */}
                    <div
                      className={`absolute inset-0 overflow-hidden rounded-[34px] border-[3px] ${theme.border} ${theme.backBg} ${theme.glow}`}
                      style={{
                        transform: `rotateY(180deg) translateZ(${CARD_THICKNESS / 2}px)`,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                    >
                      <div className="absolute inset-0 rounded-[34px] ring-1 ring-white/10" />

                      <div className="absolute inset-0 opacity-35">
                        <div className="absolute left-[-90px] top-[-80px] h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute bottom-[-90px] right-[-70px] h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                      </div>

                      <div className="relative flex h-full flex-col justify-between px-8 py-8">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/80">
                            Ritual Paws
                          </div>

                          <div className="mt-6 text-[42px] font-bold leading-tight text-white">
                            {petName}
                          </div>

                          <div className={`mt-2 text-[18px] ${theme.textAccent}`}>
                            Companion Card
                          </div>
                        </div>

                        <div className="flex flex-1 items-center justify-center">
                          <div className="flex flex-col items-center">
                            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
                              <img
                                src="/static/ball/ball(1).png"
                                alt="Ritual icon"
                                className="h-[190px] w-[190px] scale-125 object-cover"
                                draggable={false}
                              />
                            </div>

                            <div className="mt-8 text-center">
                              <div className="text-3xl font-bold text-white">
                                Ritual Paws
                              </div>

                              <div className="mt-3 max-w-[280px] text-sm leading-6 text-white/60">
                                Your customizable on-chain companion identity.
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-center text-[12px] uppercase tracking-[0.24em] text-white/35">
                          Spin • Collect • Share
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* RIGHT: actions */}
            <div className="flex flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <div>
                <div className="text-sm font-semibold text-white">Export options</div>

                <div className="mt-2 text-sm leading-6 text-white/55">
                  Preview card is spinning in 3D. Downloading will save the front of the card as a PNG.
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#00E5C4] to-[#FFD700] px-5 py-3 text-sm font-bold text-[#0F172A] transition hover:brightness-110 disabled:opacity-60"
                >
                  {downloading ? 'Downloading...' : 'Download PNG'}
                </button>

                <button
                  onClick={handleShareToX}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Share on X
                </button>

                <button
                  onClick={onClose}
                  className="w-full rounded-2xl border border-white/10 bg-transparent px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}