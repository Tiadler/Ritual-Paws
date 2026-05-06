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

type CardTheme = {
  shell: string
  glow: string
  border: string
  header: string
  stageBorder: string
  badge: string
  infoBg: string
  textAccent: string
  backBg: string
  slabBg: string
  downloadBg: string
}

const CARD_SPIN_DURATION = 6
const CARD_THICKNESS = 12

const LEVEL_THEMES: CardTheme[] = [
  {
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
    downloadBg: '#031E10',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_40%),linear-gradient(180deg,#04311F_0%,#032116_100%)]',
    glow: 'shadow-[0_0_60px_rgba(16,185,129,0.38)]',
    border: 'border-green-100',
    header: 'bg-[linear-gradient(180deg,#065F46_0%,#054737_100%)]',
    stageBorder: 'border-green-500/20',
    badge: 'bg-green-400/20 text-green-100',
    infoBg: 'bg-[#06281D]/85',
    textAccent: 'text-green-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.12),transparent_34%),linear-gradient(180deg,#043825_0%,#021A12_58%,#010D09_100%)]',
    slabBg: 'bg-[#031A12]/90',
    downloadBg: '#032116',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.18),transparent_40%),linear-gradient(180deg,#062A2A_0%,#041A1A_100%)]',
    glow: 'shadow-[0_0_60px_rgba(20,184,166,0.38)]',
    border: 'border-teal-100',
    header: 'bg-[linear-gradient(180deg,#0F766E_0%,#0B5B55_100%)]',
    stageBorder: 'border-teal-500/20',
    badge: 'bg-teal-400/20 text-teal-100',
    infoBg: 'bg-[#082725]/85',
    textAccent: 'text-teal-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(20,184,166,0.12),transparent_34%),linear-gradient(180deg,#083330_0%,#041A18_58%,#020C0B_100%)]',
    slabBg: 'bg-[#041715]/90',
    downloadBg: '#041A1A',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.18),transparent_40%),linear-gradient(180deg,#062C34_0%,#031923_100%)]',
    glow: 'shadow-[0_0_60px_rgba(6,182,212,0.38)]',
    border: 'border-cyan-100',
    header: 'bg-[linear-gradient(180deg,#0E7490_0%,#155E75_100%)]',
    stageBorder: 'border-cyan-500/20',
    badge: 'bg-cyan-400/20 text-cyan-100',
    infoBg: 'bg-[#08242C]/85',
    textAccent: 'text-cyan-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.12),transparent_34%),linear-gradient(180deg,#073241_0%,#031722_58%,#010B10_100%)]',
    slabBg: 'bg-[#031620]/90',
    downloadBg: '#031923',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),transparent_40%),linear-gradient(180deg,#06233A_0%,#031426_100%)]',
    glow: 'shadow-[0_0_60px_rgba(14,165,233,0.38)]',
    border: 'border-sky-100',
    header: 'bg-[linear-gradient(180deg,#0369A1_0%,#075985_100%)]',
    stageBorder: 'border-sky-500/20',
    badge: 'bg-sky-400/20 text-sky-100',
    infoBg: 'bg-[#071F32]/85',
    textAccent: 'text-sky-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.12),transparent_34%),linear-gradient(180deg,#062B45_0%,#031426_58%,#010916_100%)]',
    slabBg: 'bg-[#031320]/90',
    downloadBg: '#031426',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_40%),linear-gradient(180deg,#081E46_0%,#06122A_100%)]',
    glow: 'shadow-[0_0_60px_rgba(59,130,246,0.40)]',
    border: 'border-blue-100',
    header: 'bg-[linear-gradient(180deg,#1D4ED8_0%,#1E3A8A_100%)]',
    stageBorder: 'border-blue-500/20',
    badge: 'bg-blue-400/20 text-blue-100',
    infoBg: 'bg-[#071B3A]/85',
    textAccent: 'text-blue-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.12),transparent_34%),linear-gradient(180deg,#081F4A_0%,#040F25_58%,#020815_100%)]',
    slabBg: 'bg-[#050F22]/90',
    downloadBg: '#06122A',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),transparent_40%),linear-gradient(180deg,#101849_0%,#090E2C_100%)]',
    glow: 'shadow-[0_0_60px_rgba(99,102,241,0.40)]',
    border: 'border-indigo-100',
    header: 'bg-[linear-gradient(180deg,#4338CA_0%,#312E81_100%)]',
    stageBorder: 'border-indigo-500/20',
    badge: 'bg-indigo-400/20 text-indigo-100',
    infoBg: 'bg-[#11163A]/85',
    textAccent: 'text-indigo-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.12),transparent_34%),linear-gradient(180deg,#11194C_0%,#080D29_58%,#040715_100%)]',
    slabBg: 'bg-[#080D27]/90',
    downloadBg: '#090E2C',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),transparent_40%),linear-gradient(180deg,#181044_0%,#0F0929_100%)]',
    glow: 'shadow-[0_0_60px_rgba(139,92,246,0.40)]',
    border: 'border-violet-100',
    header: 'bg-[linear-gradient(180deg,#6D28D9_0%,#4C1D95_100%)]',
    stageBorder: 'border-violet-500/20',
    badge: 'bg-violet-400/20 text-violet-100',
    infoBg: 'bg-[#171034]/85',
    textAccent: 'text-violet-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.12),transparent_34%),linear-gradient(180deg,#1A1146_0%,#0D0825_58%,#050412_100%)]',
    slabBg: 'bg-[#0E0824]/90',
    downloadBg: '#0F0929',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),transparent_40%),linear-gradient(180deg,#220B43_0%,#130625_100%)]',
    glow: 'shadow-[0_0_60px_rgba(168,85,247,0.42)]',
    border: 'border-purple-100',
    header: 'bg-[linear-gradient(180deg,#7E22CE_0%,#581C87_100%)]',
    stageBorder: 'border-purple-500/20',
    badge: 'bg-purple-400/20 text-purple-100',
    infoBg: 'bg-[#1D0C33]/85',
    textAccent: 'text-purple-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.13),transparent_34%),linear-gradient(180deg,#250D45_0%,#120622_58%,#070310_100%)]',
    slabBg: 'bg-[#120622]/90',
    downloadBg: '#130625',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(217,70,239,0.18),transparent_40%),linear-gradient(180deg,#2B0A3A_0%,#18051F_100%)]',
    glow: 'shadow-[0_0_60px_rgba(217,70,239,0.42)]',
    border: 'border-fuchsia-100',
    header: 'bg-[linear-gradient(180deg,#A21CAF_0%,#701A75_100%)]',
    stageBorder: 'border-fuchsia-500/20',
    badge: 'bg-fuchsia-400/20 text-fuchsia-100',
    infoBg: 'bg-[#260A31]/85',
    textAccent: 'text-fuchsia-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(217,70,239,0.13),transparent_34%),linear-gradient(180deg,#2C0B3A_0%,#16051E_58%,#08020D_100%)]',
    slabBg: 'bg-[#16051E]/90',
    downloadBg: '#18051F',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.18),transparent_40%),linear-gradient(180deg,#360A28_0%,#1E0617_100%)]',
    glow: 'shadow-[0_0_60px_rgba(236,72,153,0.42)]',
    border: 'border-pink-100',
    header: 'bg-[linear-gradient(180deg,#BE185D_0%,#831843_100%)]',
    stageBorder: 'border-pink-500/20',
    badge: 'bg-pink-400/20 text-pink-100',
    infoBg: 'bg-[#2F0A23]/85',
    textAccent: 'text-pink-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.13),transparent_34%),linear-gradient(180deg,#350B28_0%,#1A0514_58%,#0B0208_100%)]',
    slabBg: 'bg-[#1A0514]/90',
    downloadBg: '#1E0617',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.18),transparent_40%),linear-gradient(180deg,#3C0A18_0%,#21060D_100%)]',
    glow: 'shadow-[0_0_60px_rgba(244,63,94,0.42)]',
    border: 'border-rose-100',
    header: 'bg-[linear-gradient(180deg,#BE123C_0%,#881337_100%)]',
    stageBorder: 'border-rose-500/20',
    badge: 'bg-rose-400/20 text-rose-100',
    infoBg: 'bg-[#320A17]/85',
    textAccent: 'text-rose-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.13),transparent_34%),linear-gradient(180deg,#3A0B18_0%,#1D050C_58%,#0B0205_100%)]',
    slabBg: 'bg-[#1D050C]/90',
    downloadBg: '#21060D',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),transparent_40%),linear-gradient(180deg,#3A0B0B_0%,#200505_100%)]',
    glow: 'shadow-[0_0_60px_rgba(239,68,68,0.40)]',
    border: 'border-red-100',
    header: 'bg-[linear-gradient(180deg,#B91C1C_0%,#7F1D1D_100%)]',
    stageBorder: 'border-red-500/20',
    badge: 'bg-red-400/20 text-red-100',
    infoBg: 'bg-[#310909]/85',
    textAccent: 'text-red-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.13),transparent_34%),linear-gradient(180deg,#370A0A_0%,#1C0505_58%,#0A0202_100%)]',
    slabBg: 'bg-[#1C0505]/90',
    downloadBg: '#200505',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),transparent_40%),linear-gradient(180deg,#3A1606_0%,#1E0B03_100%)]',
    glow: 'shadow-[0_0_60px_rgba(249,115,22,0.40)]',
    border: 'border-orange-100',
    header: 'bg-[linear-gradient(180deg,#C2410C_0%,#7C2D12_100%)]',
    stageBorder: 'border-orange-500/20',
    badge: 'bg-orange-400/20 text-orange-100',
    infoBg: 'bg-[#321406]/85',
    textAccent: 'text-orange-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.13),transparent_34%),linear-gradient(180deg,#3A1707_0%,#1C0A03_58%,#090301_100%)]',
    slabBg: 'bg-[#1C0A03]/90',
    downloadBg: '#1E0B03',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),transparent_40%),linear-gradient(180deg,#3A2105_0%,#201103_100%)]',
    glow: 'shadow-[0_0_60px_rgba(245,158,11,0.40)]',
    border: 'border-amber-100',
    header: 'bg-[linear-gradient(180deg,#B45309_0%,#78350F_100%)]',
    stageBorder: 'border-amber-500/20',
    badge: 'bg-amber-400/20 text-amber-100',
    infoBg: 'bg-[#301B06]/85',
    textAccent: 'text-amber-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.13),transparent_34%),linear-gradient(180deg,#382006_0%,#1B0F03_58%,#090501_100%)]',
    slabBg: 'bg-[#1B0F03]/90',
    downloadBg: '#201103',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.18),transparent_40%),linear-gradient(180deg,#352805_0%,#1B1502_100%)]',
    glow: 'shadow-[0_0_60px_rgba(234,179,8,0.40)]',
    border: 'border-yellow-100',
    header: 'bg-[linear-gradient(180deg,#A16207_0%,#713F12_100%)]',
    stageBorder: 'border-yellow-500/20',
    badge: 'bg-yellow-400/20 text-yellow-100',
    infoBg: 'bg-[#2C2205]/85',
    textAccent: 'text-yellow-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(234,179,8,0.13),transparent_34%),linear-gradient(180deg,#342705_0%,#191302_58%,#080601_100%)]',
    slabBg: 'bg-[#191302]/90',
    downloadBg: '#1B1502',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(132,204,22,0.18),transparent_40%),linear-gradient(180deg,#233506_0%,#111D02_100%)]',
    glow: 'shadow-[0_0_60px_rgba(132,204,22,0.40)]',
    border: 'border-lime-100',
    header: 'bg-[linear-gradient(180deg,#65A30D_0%,#3F6212_100%)]',
    stageBorder: 'border-lime-500/20',
    badge: 'bg-lime-400/20 text-lime-100',
    infoBg: 'bg-[#1D2E06]/85',
    textAccent: 'text-lime-200',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(132,204,22,0.13),transparent_34%),linear-gradient(180deg,#263706_0%,#101B02_58%,#050801_100%)]',
    slabBg: 'bg-[#101B02]/90',
    downloadBg: '#111D02',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),transparent_40%),linear-gradient(180deg,#073630_0%,#031D1A_100%)]',
    glow: 'shadow-[0_0_60px_rgba(45,212,191,0.42)]',
    border: 'border-teal-50',
    header: 'bg-[linear-gradient(180deg,#0F766E_0%,#115E59_100%)]',
    stageBorder: 'border-teal-300/25',
    badge: 'bg-teal-300/20 text-teal-50',
    infoBg: 'bg-[#072D29]/85',
    textAccent: 'text-teal-100',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(45,212,191,0.16),transparent_34%),linear-gradient(180deg,#073832_0%,#031B18_58%,#010B0A_100%)]',
    slabBg: 'bg-[#031B18]/90',
    downloadBg: '#031D1A',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.20),transparent_40%),linear-gradient(180deg,#063827_0%,#031B12_100%)]',
    glow: 'shadow-[0_0_66px_rgba(52,211,153,0.46)]',
    border: 'border-emerald-50',
    header: 'bg-[linear-gradient(180deg,#047857_0%,#065F46_100%)]',
    stageBorder: 'border-emerald-300/25',
    badge: 'bg-emerald-300/20 text-emerald-50',
    infoBg: 'bg-[#062D1F]/85',
    textAccent: 'text-emerald-100',
    backBg:
      'bg-[radial-gradient(circle_at_center,_rgba(52,211,153,0.16),transparent_34%),linear-gradient(180deg,#063827_0%,#031A11_58%,#010A06_100%)]',
    slabBg: 'bg-[#031A11]/90',
    downloadBg: '#031B12',
  },
  {
    shell:
      'bg-[radial-gradient(circle_at_top_left,_rgba(255,215,0,0.24),transparent_34%),radial-gradient(circle_at_top_right,_rgba(177,102,255,0.22),transparent_38%),linear-gradient(180deg,#160A25_0%,#0B0615_100%)]',
    glow: 'shadow-[0_0_76px_rgba(255,215,0,0.42)]',
    border: 'border-yellow-100',
    header:
      'bg-[linear-gradient(135deg,#3B1E68_0%,#2A174E_42%,#7A4B00_100%)]',
    stageBorder: 'border-yellow-300/30',
    badge: 'bg-yellow-300/20 text-yellow-50',
    infoBg: 'bg-[#1A1230]/85',
    textAccent: 'text-yellow-100',
    backBg:
      'bg-[radial-gradient(circle_at_top,_rgba(255,215,0,0.20),transparent_35%),radial-gradient(circle_at_center,_rgba(177,102,255,0.18),transparent_42%),linear-gradient(180deg,#1E1037_0%,#0D0718_100%)]',
    slabBg: 'bg-[#120A24]/90',
    downloadBg: '#120A24',
  },
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

function getPlacementStyle(placement: ItemPlacement): React.CSSProperties {
  return {
    left: `${placement.left}%`,
    top: `${placement.top}%`,
    width: `${placement.width}%`,
    transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
    zIndex: placement.zIndex,
  }
}

function getThemeByLevel(level: number) {
  const safeLevel = Math.max(1, Math.min(20, Number(level) || 1))
  return LEVEL_THEMES[safeLevel - 1]
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

  const theme = useMemo(() => getThemeByLevel(level), [level])

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
      alert('Could not download the card. Please make sure html-to-image is installed: npm i html-to-image')
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
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
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
                        className={`absolute inset-[4px] rounded-[32px] ${theme.slabBg} shadow-[0_16px_40px_rgba(0,0,0,0.35)]`}
                        style={{
                          transform: 'translateZ(0px)',
                        }}
                      />

                      {/* FRONT CARD */}
                      <div
                        ref={cardFrontRef}
                        className={`absolute inset-0 flex flex-col overflow-hidden rounded-[34px] border-[3px] ${theme.border} ${theme.shell} ${theme.glow}`}
                        style={{
                          transform: `translateZ(${CARD_THICKNESS / 2}px)`,
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                        }}
                      >
                        <div className="absolute inset-0 rounded-[34px] ring-1 ring-white/10" />

                        {/* Header */}
                        <div className={`relative shrink-0 px-[5.8%] pb-[5%] pt-[5%] ${theme.header}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-[clamp(8px,2.5vw,11px)] font-bold uppercase tracking-[0.28em] text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.55)]">
                                Ritual Paws Card
                              </div>

                              <div className="mt-[3%] truncate text-[clamp(30px,9vw,48px)] font-bold leading-none text-white drop-shadow-[0_0_18px_rgba(0,229,196,0.75)]">
                                {petName}
                              </div>

                              <div className={`mt-[2.5%] text-[clamp(12px,3.4vw,17px)] font-medium drop-shadow-[0_0_10px_rgba(0,229,196,0.55)] ${theme.textAccent}`}>
                                {subtitle}
                              </div>
                            </div>

                            <div className={`shrink-0 rounded-full px-[3.7%] py-[1.8%] text-[clamp(10px,3vw,14px)] font-bold shadow-[0_0_14px_rgba(255,255,255,0.22)] drop-shadow-[0_0_8px_rgba(255,255,255,0.45)] ${theme.badge}`}>
                              LV. {level}
                            </div>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="relative flex flex-1 flex-col px-[5.8%] pb-[5.8%] pt-[5.2%]">
                          {/* Pet stage */}
                          <div
                            className={`relative flex-[1.45] overflow-hidden rounded-[28px] border ${theme.stageBorder}`}
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

                          {/* Info row */}
                          <div className="mt-[5%] grid shrink-0 grid-cols-[1fr_1.45fr] gap-[3.8%]">
                            <div className={`flex min-h-[122px] flex-col justify-start rounded-[22px] ${theme.infoBg} px-[12%] py-[12%]`}>
                              <div className="h-[24px] text-[clamp(11px,3.2vw,15px)] font-extrabold uppercase leading-[24px] tracking-[0.22em] text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]">
                                Mood
                              </div>

                              <div className="mt-[10%] text-[clamp(17px,4.6vw,23px)] font-bold leading-none text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]">
                                {mood}
                              </div>
                            </div>

                            <div className={`flex min-h-[122px] items-center rounded-[22px] ${theme.infoBg} px-[8%] py-[8%]`}>
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
                                    Vibes
                                  </div>

                                  <div className="mt-[10%] text-[clamp(17px,4.6vw,23px)] font-bold leading-none text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]">
                                    Ritual
                                  </div>

                                  <div className="mt-[6%] text-[clamp(10px,2.9vw,13px)] leading-tight text-white/65 drop-shadow-[0_0_7px_rgba(255,255,255,0.3)]">
                                    Bring AI on-chain
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="mt-[4%] shrink-0 text-center text-[clamp(9px,2.8vw,12px)] text-white/65 drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]">
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

                            <div className={`mt-[2%] text-[clamp(13px,3.8vw,18px)] ${theme.textAccent}`}>
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
                  <div className="text-sm font-semibold text-white">Export options</div>

                  <div className="mt-2 text-sm leading-6 text-white/55">
                    The preview card spins in 3D. Download saves the front side as a PNG.
                  </div>
                </div>

                <div className="mt-5 space-y-3">
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
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}