'use client'

import { motion } from 'framer-motion'
import {
  DEFAULT_ROOM_BACKGROUND,
  getPetArtByColor,
  type WearableSlot,
} from '@/lib/staticAssets'

export type ItemPlacement = {
  left: number
  top: number
  width: number
  rotation: number
  zIndex: number
}

export type EquippedRoomItem = {
  id: string
  name: string
  slot: WearableSlot
  src: string
  placement: ItemPlacement
}

interface RoomCanvasProps {
  petName: string
  color: string
  level: number
  expPercent: number
  mood: string
  equippedItems?: EquippedRoomItem[]
  roomBackgroundSrc?: string
}

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

const PET_POSITION = {
  left: '20%',
  top: '40%',
}

const PET_SIZE = 'min(46vw, 29rem)'

const ROOM_OVERLAY_OPACITY = 0.08

export function RoomCanvas({
  petName,
  color,
  level,
  expPercent,
  mood,
  equippedItems = [],
  roomBackgroundSrc,
}: RoomCanvasProps) {
  const petArt = getPetArtByColor(color)
  const defaultRoomBackgroundSrc = getAssetSrc(DEFAULT_ROOM_BACKGROUND)
  const finalRoomBackgroundSrc = roomBackgroundSrc || defaultRoomBackgroundSrc
  const stats = [
    { label: 'Mood', value: mood },
    { label: 'Level', value: level },
    { label: 'Exp', value: `${expPercent}%` },
    { label: 'Art', value: petArt.label },
  ]

  return (
    <div className="space-y-3 bg-black/20 p-3">
      <div className="grid grid-cols-2 gap-2 rounded-[12px] bg-black/36 p-2 backdrop-blur-md md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[8px] border border-white/8 bg-white/[0.035] px-4 py-3 text-center"
          >
            <div className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/35">
              {stat.label}
            </div>
            <div className="mt-1 truncate text-xs font-bold uppercase tracking-[0.08em] text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="relative aspect-square w-full overflow-hidden rounded-[1.1rem] border border-[#40FFAF]/18 bg-black shadow-[0_24px_80px_-48px_rgba(64,255,175,0.38)]">
        <img
          src={finalRoomBackgroundSrc}
          alt="Room background"
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={{ objectPosition: '50% 50%' }}
          draggable={false}
        />

        <div
          className="absolute inset-0 bg-[#050505]"
          style={{ opacity: ROOM_OVERLAY_OPACITY }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(64,255,175,0.16),transparent_24%),radial-gradient(circle_at_86%_12%,rgba(136,64,255,0.14),transparent_18%)]" />

        <div className="absolute left-6 top-6 z-40 border border-[#40FFAF]/22 bg-black/35 px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/88 shadow-[0_18px_45px_-30px_rgba(64,255,175,0.35)] backdrop-blur-md">
          {petName}&apos;s Room
        </div>

        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: [0, 0.6, -0.6, 0] }}
          transition={{
            scale: { duration: 0.5 },
            opacity: { duration: 0.5 },
            rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute"
          style={{
            width: PET_SIZE,
            aspectRatio: '1 / 1',
            left: PET_POSITION.left,
            top: PET_POSITION.top,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img
            src={petArt.src}
            alt={`${petName} pet`}
            className="absolute inset-0 z-10 h-full w-full select-none object-contain pointer-events-none"
            draggable={false}
          />

          {equippedItems.map((item) => (
            <img
              key={item.id}
              src={item.src}
              alt={item.name}
              className="absolute select-none pointer-events-none drop-shadow-xl"
              style={getPlacementStyle(item.placement)}
              draggable={false}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
