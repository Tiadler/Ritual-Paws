'use client'

import { useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { motion } from 'framer-motion'
import {
  ITEM_ART,
  PET_ART,
  CAT_COLOR_TO_PET_INDEX,
  getPetArtByColor,
  type WearableSlot,
} from '@/lib/staticAssets'
import type { EquippedRoomItem, ItemPlacement } from '@/components/RoomCanvas'

interface InventoryModalProps {
  onClose: () => void
  petColor?: string
  currentEquippedItems?: EquippedRoomItem[]
  currentRoomBackgroundSrc?: string
  currentDisplayPetColor?: string
  onApply: (items: EquippedRoomItem[], backgroundSrc?: string, petColor?: string) => void
}

type TabType = 'pet' | 'hat' | 'glass' | 'necklace' | 'shirt' | 'handheld' | 'background'

type StaticArt =
  | string
  | {
      id?: string
      name?: string
      label?: string
      src: string
    }

type InventoryItem = {
  id: number
  itemKey: string
  name: string
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic'
  slot: WearableSlot | 'background'
  art: string
}

type PetOption = {
  id: string
  label: string
  color: string
  art: string
}

type InteractionMode = 'move' | 'resize' | 'rotate'

type DragState = {
  mode: InteractionMode
  itemKey: string
  startClientX: number
  startClientY: number
  startLeft: number
  startTop: number
  startWidth: number
  startRotation: number
  startAngle: number
  centerX: number
  centerY: number
  boxWidth: number
  boxHeight: number
}

const tabs: { id: TabType; label: string }[] = [
  { id: 'pet', label: 'Pet' },
  { id: 'hat', label: 'Hat' },
  { id: 'glass', label: 'Glass' },
  { id: 'necklace', label: 'Necklace' },
  { id: 'shirt', label: 'Shirt' },
  { id: 'handheld', label: 'Handheld' },
  { id: 'background', label: 'Room' },
]

const DEFAULT_PLACEMENTS: Record<WearableSlot, ItemPlacement> = {
  hat: {
    left: 50,
    top: 18,
    width: 38,
    rotation: 0,
    zIndex: 30,
  },
  glass: {
    left: 50,
    top: 42,
    width: 34,
    rotation: 0,
    zIndex: 40,
  },
  necklace: {
    left: 50,
    top: 60,
    width: 30,
    rotation: 0,
    zIndex: 35,
  },
  shirt: {
    left: 50,
    top: 70,
    width: 48,
    rotation: 0,
    zIndex: 20,
  },
  handheld: {
    left: 72,
    top: 58,
    width: 30,
    rotation: -8,
    zIndex: 45,
  },
}

const PET_COLOR_BY_INDEX: Record<number, string> = Object.entries(CAT_COLOR_TO_PET_INDEX).reduce(
  (acc, [color, index]) => {
    acc[index] = color
    return acc
  },
  {} as Record<number, string>
)

const petOptions: PetOption[] = PET_ART.map((pet, index) => {
  const petIndex = index + 1
  const color = PET_COLOR_BY_INDEX[petIndex] || `pet-${petIndex}`

  return {
    id: `pet-${petIndex}`,
    label: pet.label || `Pet ${petIndex}`,
    color,
    art: pet.src,
  }
})

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getArtSrc(art: StaticArt) {
  return typeof art === 'string' ? art : art.src
}

function getArtName(art: StaticArt, fallback: string) {
  if (typeof art === 'string') return fallback
  return art.name || art.label || fallback
}

function rarityByIndex(index: number): InventoryItem['rarity'] {
  if (index % 7 === 0) return 'Epic'
  if (index % 5 === 0) return 'Rare'
  if (index % 3 === 0) return 'Uncommon'
  return 'Common'
}

function buildWearableItems(
  slot: WearableSlot,
  label: string,
  arts: StaticArt[],
  startId: number
): InventoryItem[] {
  return arts
    .filter(Boolean)
    .map((art, index) => ({
      id: startId + index,
      itemKey: `${slot}-${index + 1}`,
      name: getArtName(art, `${label} ${index + 1}`),
      rarity: rarityByIndex(index + 1),
      slot,
      art: getArtSrc(art),
    }))
}

function buildBackgroundItems(arts: StaticArt[], startId: number): InventoryItem[] {
  return arts
    .filter(Boolean)
    .map((art, index) => ({
      id: startId + index,
      itemKey: `background-${index + 1}`,
      name: getArtName(art, `Room Background ${index + 1}`),
      rarity: rarityByIndex(index + 1),
      slot: 'background',
      art: getArtSrc(art),
    }))
}

const shopItems: Record<Exclude<TabType, 'pet'>, InventoryItem[]> = {
  hat: buildWearableItems('hat', 'Hat', ITEM_ART.Hat, 1000),
  glass: buildWearableItems('glass', 'Glass', ITEM_ART.Glass, 2000),
  necklace: buildWearableItems('necklace', 'Necklace', ITEM_ART.Necklace, 3000),
  shirt: buildWearableItems('shirt', 'Shirt', ITEM_ART.Shirt, 4000),
  handheld: buildWearableItems('handheld', 'Handheld', ITEM_ART.Handheld, 5000),
  background: buildBackgroundItems(ITEM_ART.ThemeBackgroundRoom, 6000),
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

function getInitialSelectedItems(items: EquippedRoomItem[]) {
  const initial: Record<string, EquippedRoomItem> = {}

  items.forEach((item) => {
    initial[item.id] = item
  })

  return initial
}

function getPointerAngle(clientX: number, clientY: number, centerX: number, centerY: number) {
  return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)
}

export function InventoryModal({
  onClose,
  petColor = 'black',
  currentEquippedItems = [],
  currentRoomBackgroundSrc,
  currentDisplayPetColor,
  onApply,
}: InventoryModalProps) {
  const previewRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<DragState | null>(null)

  const [activeTab, setActiveTab] = useState<TabType>('pet')
  const [selectedItems, setSelectedItems] = useState<Record<string, EquippedRoomItem>>(() =>
    getInitialSelectedItems(currentEquippedItems)
  )
  const [activeItemKey, setActiveItemKey] = useState<string>(
    currentEquippedItems[0]?.id || ''
  )
  const [selectedBackgroundSrc, setSelectedBackgroundSrc] = useState<string | undefined>(
    currentRoomBackgroundSrc
  )
  const [selectedPetColor, setSelectedPetColor] = useState(
    currentDisplayPetColor || petColor
  )

  const petArt = getPetArtByColor(selectedPetColor)
  const currentItems = activeTab === 'pet' ? [] : shopItems[activeTab]
  const equippedItems = useMemo(() => Object.values(selectedItems), [selectedItems])
  const activeItem = activeItemKey ? selectedItems[activeItemKey] : undefined

  const handleToggleItem = (item: InventoryItem) => {
    if (item.slot === 'background') {
      setSelectedBackgroundSrc((current) => (current === item.art ? undefined : item.art))
      return
    }

    const slot = item.slot as WearableSlot

    setSelectedItems((prev) => {
      const next = { ...prev }

      Object.values(next).forEach((equippedItem) => {
        if (equippedItem.slot === slot && equippedItem.id !== item.itemKey) {
          delete next[equippedItem.id]
        }
      })

      if (next[item.itemKey]) {
        delete next[item.itemKey]

        if (activeItemKey === item.itemKey) {
          setActiveItemKey('')
        }
      } else {
        next[item.itemKey] = {
          id: item.itemKey,
          name: item.name,
          slot,
          src: item.art,
          placement: DEFAULT_PLACEMENTS[slot],
        }

        setActiveItemKey(item.itemKey)
      }

      return next
    })
  }

  const startInteraction = (
    event: PointerEvent<HTMLElement>,
    item: EquippedRoomItem,
    mode: InteractionMode
  ) => {
    event.preventDefault()
    event.stopPropagation()

    const box = previewRef.current?.getBoundingClientRect()
    if (!box) return

    const centerX = box.left + (item.placement.left / 100) * box.width
    const centerY = box.top + (item.placement.top / 100) * box.height
    const startAngle = getPointerAngle(event.clientX, event.clientY, centerX, centerY)

    setActiveItemKey(item.id)

    dragRef.current = {
      mode,
      itemKey: item.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startLeft: item.placement.left,
      startTop: item.placement.top,
      startWidth: item.placement.width,
      startRotation: item.placement.rotation,
      startAngle,
      centerX,
      centerY,
      boxWidth: box.width,
      boxHeight: box.height,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag) return

    const deltaXPercent = ((event.clientX - drag.startClientX) / drag.boxWidth) * 100
    const deltaYPercent = ((event.clientY - drag.startClientY) / drag.boxHeight) * 100

    setSelectedItems((prev) => {
      const item = prev[drag.itemKey]
      if (!item) return prev

      let nextPlacement = item.placement

      if (drag.mode === 'move') {
        nextPlacement = {
          ...item.placement,
          left: Number(clamp(drag.startLeft + deltaXPercent, -30, 130).toFixed(1)),
          top: Number(clamp(drag.startTop + deltaYPercent, -30, 130).toFixed(1)),
        }
      }

      if (drag.mode === 'resize') {
        const resizeDelta = Math.max(deltaXPercent, deltaYPercent)

        nextPlacement = {
          ...item.placement,
          width: Number(clamp(drag.startWidth + resizeDelta, 5, 180).toFixed(1)),
        }
      }

      if (drag.mode === 'rotate') {
        const currentAngle = getPointerAngle(
          event.clientX,
          event.clientY,
          drag.centerX,
          drag.centerY
        )

        nextPlacement = {
          ...item.placement,
          rotation: Number(
            (drag.startRotation + currentAngle - drag.startAngle).toFixed(1)
          ),
        }
      }

      return {
        ...prev,
        [drag.itemKey]: {
          ...item,
          placement: nextPlacement,
        },
      }
    })
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  const bringForward = () => {
    if (!activeItemKey) return

    setSelectedItems((prev) => {
      const item = prev[activeItemKey]
      if (!item) return prev

      return {
        ...prev,
        [activeItemKey]: {
          ...item,
          placement: {
            ...item.placement,
            zIndex: clamp(item.placement.zIndex + 1, 1, 99),
          },
        },
      }
    })
  }

  const sendBackward = () => {
    if (!activeItemKey) return

    setSelectedItems((prev) => {
      const item = prev[activeItemKey]
      if (!item) return prev

      return {
        ...prev,
        [activeItemKey]: {
          ...item,
          placement: {
            ...item.placement,
            zIndex: clamp(item.placement.zIndex - 1, 1, 99),
          },
        },
      }
    })
  }

  const resetActiveItem = () => {
    if (!activeItem) return

    setSelectedItems((prev) => ({
      ...prev,
      [activeItem.id]: {
        ...activeItem,
        placement: DEFAULT_PLACEMENTS[activeItem.slot],
      },
    }))
  }

  const removeActiveItem = () => {
    if (!activeItemKey) return

    setSelectedItems((prev) => {
      const next = { ...prev }
      delete next[activeItemKey]
      return next
    })

    setActiveItemKey('')
  }

  const handleClearAll = () => {
    setSelectedItems({})
    setSelectedBackgroundSrc(undefined)
    setActiveItemKey('')
  }

  const handleApply = () => {
    onApply(equippedItems, selectedBackgroundSrc, selectedPetColor)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#1A1A2E]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-7 py-5">
          <div>
            <div className="text-xl font-semibold">🎒 Inventory Editor</div>
            <div className="mt-1 text-xs text-white/45">
              Select "Pet" to change the display color. Drag the item to move it, drag the corner to resize it, and drag the circular button to rotate it.
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-white/50 transition hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="grid flex-1 overflow-hidden lg:grid-cols-[1fr_560px]">
          <div className="flex min-w-0 flex-col border-r border-white/10">
            <div className="flex gap-2 overflow-x-auto border-b border-white/10 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#00E5C4] text-black'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'pet' ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {petOptions.map((petOption) => {
                    const isSelected = selectedPetColor === petOption.color

                    return (
                      <motion.button
                        key={petOption.id}
                        onClick={() => setSelectedPetColor(petOption.color)}
                        whileHover={{ scale: 1.04 }}
                        className={`rounded-xl border-2 p-3 transition-all ${
                          isSelected
                            ? 'border-[#00E5C4] bg-[#00E5C4]/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-[92px] w-full items-center justify-center rounded-xl bg-[#0F0F1A] p-2">
                            <img
                              src={petOption.art}
                              alt={petOption.label}
                              className="h-full w-full object-contain"
                            />
                          </div>

                          <div className="text-center text-xs font-medium">
                            {petOption.label}
                          </div>

                          <div className="rounded bg-white/10 px-2 py-0.5 text-xs capitalize text-white/60">
                            {petOption.color}
                          </div>

                          {isSelected && (
                            <div className="text-xs font-bold text-[#00E5C4]">✓ ON</div>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              ) : currentItems.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-sm text-white/50">
                  No items in this category.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {currentItems.map((item) => {
                    const isSelected =
                      item.slot === 'background'
                        ? selectedBackgroundSrc === item.art
                        : Boolean(selectedItems[item.itemKey])

                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleToggleItem(item)}
                        whileHover={{ scale: 1.04 }}
                        className={`rounded-xl border-2 p-3 transition-all ${
                          isSelected
                            ? 'border-[#00E5C4] bg-[#00E5C4]/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-[82px] w-full items-center justify-center rounded-xl bg-[#0F0F1A] p-2">
                            <img
                              src={item.art}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          </div>

                          <div className="text-center text-xs font-medium">
                            {item.name}
                          </div>

                          <div
                            className={`rounded px-2 py-0.5 text-xs ${
                              item.rarity === 'Epic'
                                ? 'bg-purple-500/30 text-purple-300'
                                : item.rarity === 'Rare'
                                  ? 'bg-yellow-500/30 text-yellow-300'
                                  : item.rarity === 'Uncommon'
                                    ? 'bg-blue-500/30 text-blue-300'
                                    : 'bg-white/10 text-white/60'
                            }`}
                          >
                            {item.rarity}
                          </div>

                          {isSelected && (
                            <div className="text-xs font-bold text-[#00E5C4]">✓ ON</div>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col overflow-y-auto p-5">
            <div
              ref={previewRef}
              className="relative mx-auto mt-8 h-[460px] w-[460px] overflow-hidden rounded-3xl border border-white/10 bg-[#11111F] bg-cover bg-center"
              style={
                selectedBackgroundSrc
                  ? { backgroundImage: `url(${selectedBackgroundSrc})` }
                  : undefined
              }
            >
              <img
                src={petArt.src}
                alt="Pet preview"
                className="absolute inset-0 z-10 h-full w-full object-contain select-none pointer-events-none"
                draggable={false}
              />

              {equippedItems.map((item) => {
                const isActive = activeItemKey === item.id

                return (
                  <div
                    key={item.id}
                    className={`absolute select-none ${
                      isActive ? 'outline outline-2 outline-[#00E5C4]' : ''
                    }`}
                    style={getPlacementStyle(item.placement)}
                    onPointerDown={(event) => startInteraction(event, item, 'move')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  >
                    <img
                      src={item.src}
                      alt={item.name}
                      className="block w-full select-none drop-shadow-lg"
                      draggable={false}
                    />

                    {isActive && (
                      <>
                        <button
                          type="button"
                          aria-label="Rotate item"
                          className="absolute left-1/2 top-[-38px] h-7 w-7 -translate-x-1/2 cursor-grab rounded-full border border-white/60 bg-[#00E5C4] text-[11px] text-black shadow-lg active:cursor-grabbing"
                          onPointerDown={(event) => startInteraction(event, item, 'rotate')}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerCancel={handlePointerUp}
                        >
                          ↻
                        </button>

                        <div className="absolute left-1/2 top-[-13px] h-[20px] w-px -translate-x-1/2 bg-[#00E5C4]" />

                        <button
                          type="button"
                          aria-label="Resize item"
                          className="absolute bottom-[-10px] right-[-10px] h-6 w-6 cursor-nwse-resize rounded-full border border-white/70 bg-[#00E5C4] text-[10px] text-black shadow-lg"
                          onPointerDown={(event) => startInteraction(event, item, 'resize')}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerCancel={handlePointerUp}
                        >
                          ↔
                        </button>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                onClick={bringForward}
                disabled={!activeItem}
                className="rounded-xl bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-35"
              >
                Bring front
              </button>

              <button
                onClick={sendBackward}
                disabled={!activeItem}
                className="rounded-xl bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-35"
              >
                Send back
              </button>

              <button
                onClick={resetActiveItem}
                disabled={!activeItem}
                className="rounded-xl bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-35"
              >
                Reset item
              </button>

              <button
                onClick={removeActiveItem}
                disabled={!activeItem}
                className="rounded-xl bg-red-500/15 px-4 py-2 text-xs text-red-200 transition hover:bg-red-500/25 disabled:opacity-35"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-3 border-t border-white/10 px-7 py-4">
          <button
            onClick={handleClearAll}
            className="rounded-xl bg-white/5 px-6 py-2.5 font-medium text-white/70 transition-all hover:bg-white/10"
          >
            Clear all
          </button>

          <button
            onClick={handleApply}
            className="rounded-xl bg-[#00E5C4] px-8 py-2.5 font-semibold text-black transition-all hover:bg-[#00E5C4]/90"
          >
            Apply to Room
          </button>
        </div>
      </motion.div>
    </div>
  )
}