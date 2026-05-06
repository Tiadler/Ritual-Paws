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

// ===============================
// CHỈNH ROOM / PET Ở ĐÂY
// ===============================
const ROOM_HEIGHT = 760
const PET_SIZE = 550

const PET_POSITION = {
  left: '17%',
  top: '30%',
}

const ROOM_OVERLAY_OPACITY = 0.22

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

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-[#11111F]/80 p-4 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap gap-2">
          <div className="rounded-xl bg-white/5 px-3 py-2 text-center">
            <div className="text-xs text-white/50 uppercase">Mood</div>
            <div className="text-xs font-semibold mt-0.5">{mood}</div>
          </div>

          <div className="rounded-xl bg-white/5 px-3 py-2 text-center">
            <div className="text-xs text-white/50 uppercase">Level</div>
            <div className="text-xs font-semibold mt-0.5">{level}</div>
          </div>

          <div className="rounded-xl bg-white/5 px-3 py-2 text-center">
            <div className="text-xs text-white/50 uppercase">EXP</div>
            <div className="text-xs font-semibold mt-0.5">{expPercent}%</div>
          </div>

          <div className="rounded-xl bg-white/5 px-3 py-2 text-center">
            <div className="text-xs text-white/50 uppercase">Pet Art</div>
            <div className="text-xs font-semibold mt-0.5">{petArt.label}</div>
          </div>
        </div>
      </div>

      <div
        className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#10101c]"
        style={{ height: ROOM_HEIGHT }}
      >
        <img
          src={finalRoomBackgroundSrc}
          alt="Room background"
          className="absolute inset-0 h-full w-full select-none object-cover object-center"
          draggable={false}
        />

        <div
          className="absolute inset-0 bg-[#0F0F1A]"
          style={{ opacity: ROOM_OVERLAY_OPACITY }}
        />

        <div className="absolute left-6 top-8 z-40 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/85 shadow-lg backdrop-blur-md">
          {petName}'s Room
        </div>

        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: [0, 1, -1, 0] }}
          transition={{
            scale: { duration: 0.5 },
            opacity: { duration: 0.5 },
            rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute"
          style={{
            width: PET_SIZE,
            height: PET_SIZE,
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