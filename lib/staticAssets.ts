import type { CSSProperties, SyntheticEvent } from 'react'

export type WearableSlot = 'hat' | 'glass' | 'necklace' | 'shirt' | 'handheld'
export type RoomSlot = 'background'

export type PetArt = {
  id: string
  label: string
  src: string
  fallbackSrc: string
  png: string
  webp: string
  svg: string
}

export type WearableArt = {
  id: string
  name: string
  slot: WearableSlot
  src: string
  fallbackSrc: string
}

export type RoomBackgroundArt = {
  id: string
  name: string
  slot: RoomSlot
  src: string
  fallbackSrc: string
}

export const STATIC_ROOT = '/static'

/**
 * MAIN RULE FOR YOUR ART FILES
 *
 * Put your final PNG art here:
 * - public/static/Pet/Pet(1).png ... public/static/Pet/Pet(10).png
 * - public/static/Hat/Hat(1).png ...
 * - public/static/Glass/Glass(1).png ...
 * - public/static/Necklace/Necklace(1).png ...
 * - public/static/Shirt/Shirt(1).png ...
 * - public/static/Handheld/Handheld(1).png ...
 * - public/static/ThemeBackgroundRoom/ThemeBackgroundRoom(1).png ...
 *
 * The app uses PNG first. If a PNG is missing, it falls back to the SVG placeholder.
 */
export const ASSET_COUNTS = {
  pet: 10,
  themeBackgroundRoom: 9,
  hat: 4,
  glass: 6,
  necklace: 4,
  shirt: 0,
  handheld: 3,
}

function staticPath(folder: string, fileBase: string, index: number, ext: 'png' | 'svg' | 'webp' = 'png') {
  return `${STATIC_ROOT}/${folder}/${fileBase}(${index}).${ext}`
}

export const PET_ART: PetArt[] = Array.from({ length: ASSET_COUNTS.pet }, (_, index) => {
  const itemNo = index + 1
  return {
    id: `pet-${itemNo}`,
    label: `Pet ${itemNo}`,
    src: staticPath('Pet', 'Pet', itemNo, 'png'),
    fallbackSrc: staticPath('Pet', 'Pet', itemNo, 'svg'),
    png: staticPath('Pet', 'Pet', itemNo, 'png'),
    webp: staticPath('Pet', 'Pet', itemNo, 'webp'),
    svg: staticPath('Pet', 'Pet', itemNo, 'svg'),
  }
})

export const CAT_COLOR_TO_PET_INDEX: Record<string, number> = {
  black: 1,
  white: 2,
  cream: 3,
  orange: 4,
  gray: 5,
  brown: 6,
  pink: 7,
  blue: 8,
  purple: 9,
  green: 10,
}

export function getPetArtByColor(color: string) {
  const index = CAT_COLOR_TO_PET_INDEX[color] || 1
  return PET_ART[index - 1] ?? PET_ART[0]
}

function buildWearableAssets(folder: string, fileBase: string, slot: WearableSlot, count: number): WearableArt[] {
  return Array.from({ length: count }, (_, index) => {
    const itemNo = index + 1
    return {
      id: `${slot}-${itemNo}`,
      name: `${fileBase} ${itemNo}`,
      slot,
      src: staticPath(folder, fileBase, itemNo, 'png'),
      fallbackSrc: staticPath(folder, fileBase, itemNo, 'svg'),
    }
  })
}

function buildRoomBackgroundAssets(count: number): RoomBackgroundArt[] {
  return Array.from({ length: count }, (_, index) => {
    const itemNo = index + 1
    return {
      id: `theme-background-room-${itemNo}`,
      name: `ThemeBackgroundRoom ${itemNo}`,
      slot: 'background',
      src: staticPath('ThemeBackgroundRoom', 'ThemeBackgroundRoom', itemNo, 'png'),
      fallbackSrc: staticPath('ThemeBackgroundRoom', 'ThemeBackgroundRoom', itemNo, 'svg'),
    }
  })
}

export const ITEM_ART = {
  ThemeBackgroundRoom: buildRoomBackgroundAssets(ASSET_COUNTS.themeBackgroundRoom),
  Hat: buildWearableAssets('Hat', 'Hat', 'hat', ASSET_COUNTS.hat),
  Glass: buildWearableAssets('Glass', 'Glass', 'glass', ASSET_COUNTS.glass),
  Necklace: buildWearableAssets('Necklace', 'Necklace', 'necklace', ASSET_COUNTS.necklace),
  Shirt: buildWearableAssets('Shirt', 'Shirt', 'shirt', ASSET_COUNTS.shirt),
  Handheld: buildWearableAssets('Handheld', 'Handheld', 'handheld', ASSET_COUNTS.handheld),
}

// Fixed overlay slots. Adjust these once per pet art style if needed.
// The UI uses percentages so items stay anchored when the pet/card scales.
export const PET_ITEM_SLOTS: Record<WearableSlot, CSSProperties> = {
  hat: {
    top: '-25%',
    left: '50%',
    width: '60%',
    transform: 'translate(-55%, 0)',
    zIndex: 30,
  },
  glass: {
    top: '15%',
    left: '58%',
    width: '32%',
    transform: 'translate(-50%, 0)',
    zIndex: 31,
  },
  necklace: {
    top: '33%',
    left: '55%',
    width: '20%',
    transform: 'translate(-50%, 0)',
    zIndex: 32,
  },
  shirt: {
    top: '61%',
    left: '50%',
    width: '46%',
    transform: 'translate(-50%, 0)',
    zIndex: 20,
  },
  handheld: {
    top: '50%',
    left: '72%',
    width: '28%',
    transform: 'translate(-50%, 0) rotate(-8deg)',
    zIndex: 33,
  },
}

// Demo equipped items. Later, replace this with inventory/equipped data from state or contract.
export const DEFAULT_EQUIPPED_ITEMS: WearableArt[] = [
  ITEM_ART.Hat[0],
  ITEM_ART.Glass[0],
  ITEM_ART.Necklace[0],
  ITEM_ART.Shirt[0],
  ITEM_ART.Handheld[0],
].filter((item): item is WearableArt => Boolean(item))

export const DEFAULT_ROOM_BACKGROUND = ITEM_ART.ThemeBackgroundRoom[0]

export function imageFallback(event: SyntheticEvent<HTMLImageElement>, fallbackSrc?: string) {
  const image = event.currentTarget
  if (!fallbackSrc || image.dataset.fallbackApplied === 'true') return
  image.dataset.fallbackApplied = 'true'
  image.src = fallbackSrc
}
