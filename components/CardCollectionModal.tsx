'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CARD_COUNT = 20
const AUTOPLAY_MS = 1000
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const
const BACKGROUND_BASE_NAME = 'bg'

function imagePath(folder: string, name: string, ext: string) {
  return `/static/${folder}/${name}.${ext}`
}

function useImageFallback(folder: string, baseName: string) {
  const [extIndex, setExtIndex] = useState(0)
  const [failed, setFailed] = useState(false)

  const src = imagePath(folder, baseName, IMAGE_EXTENSIONS[extIndex])

  const handleError = () => {
    if (extIndex < IMAGE_EXTENSIONS.length - 1) {
      setExtIndex((value) => value + 1)
      return
    }

    setFailed(true)
  }

  return {
    src,
    failed,
    handleError,
  }
}

function getCircularOffset(index: number, activeIndex: number, total: number) {
  let offset = index - activeIndex
  const half = total / 2

  if (offset > half) offset -= total
  if (offset < -half) offset += total

  return offset
}

function CollectionBackground() {
  const { src, failed, handleError } = useImageFallback('bg', BACKGROUND_BASE_NAME)

  return (
    <>
      {!failed ? (
        <img
          src={src}
          onError={handleError}
          alt="Collection background"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          draggable={false}
        />
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,20,0.62),rgba(5,8,20,0.30)_45%,rgba(5,8,20,0.78)),radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.58)_82%)]" />
    </>
  )
}

function CollectionCard({
  number,
  index,
  activeIndex,
  total,
  onSelect,
}: {
  number: number
  index: number
  activeIndex: number
  total: number
  onSelect: (index: number) => void
}) {
  const baseName = `card(${number})`
  const { src, failed, handleError } = useImageFallback('card', baseName)

  const offset = getCircularOffset(index, activeIndex, total)
  const absOffset = Math.abs(offset)
  const visible = absOffset <= 4

  const x = offset * 250
  const scale = Math.max(0.62, 1.08 - absOffset * 0.15)
  const rotateY = offset * -9
  const blur = Math.min(absOffset * 0.7, 2.4)
  const opacity = visible ? Math.max(0.22, 1 - absOffset * 0.18) : 0
  const zIndex = 100 - absOffset

  return (
    <button
      type="button"
      aria-label={`Show card ${number}`}
      onClick={() => onSelect(index)}
      className="absolute aspect-[3/4.25] w-[clamp(180px,24vw,360px)] cursor-pointer overflow-hidden rounded-[28px] border-0 bg-white/[0.045] p-0 shadow-[0_34px_100px_rgba(0,0,0,0.50),inset_0_0_0_1px_rgba(255,255,255,0.18)] transition-[transform,filter,opacity,box-shadow] duration-500 ease-out before:pointer-events-none before:absolute before:inset-0 before:z-10 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.38),transparent_28%,transparent_70%,rgba(255,255,255,0.14))] before:opacity-70"
      style={{
        transform: `translateX(${x}px) scale(${scale}) rotateY(${rotateY}deg)`,
        opacity,
        zIndex,
        filter: `blur(${blur}px)`,
        pointerEvents: visible ? 'auto' : 'none',
        boxShadow:
          offset === 0
            ? '0 42px 130px rgba(0,0,0,0.62), 0 0 0 2px rgba(255,255,255,0.72), inset 0 0 0 1px rgba(255,255,255,0.24)'
            : undefined,
      }}
    >
      {!failed ? (
        <img
          src={src}
          onError={handleError}
          alt={`Card ${number}`}
          className="block h-full w-full select-none object-contain"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04)),repeating-linear-gradient(-45deg,rgba(255,255,255,0.08)_0_12px,transparent_12px_24px)] p-6 text-center text-white">
          <div className="text-4xl">🖼️</div>
          <div className="text-xl font-black">{baseName}</div>
          <div className="text-xs leading-5 text-white/60">
            Add image to public/static/card
          </div>
        </div>
      )}
    </button>
  )
}

export function CardCollectionModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const cards = useMemo(
    () => Array.from({ length: CARD_COUNT }, (_, index) => index + 1),
    []
  )

  const [activeIndex, setActiveIndex] = useState(Math.floor(CARD_COUNT / 2))
  const next = () => setActiveIndex((value) => (value + 1) % CARD_COUNT)
  const prev = () => setActiveIndex((value) => (value - 1 + CARD_COUNT) % CARD_COUNT)

  useEffect(() => {
    if (!open || !AUTOPLAY_MS) return

    const timer = window.setInterval(next, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') prev()
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[220] bg-[#080B16] text-white"
          onClick={onClose}
        >
          <CollectionBackground />

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.22 }}
            className="relative z-10 flex min-h-screen flex-col items-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex w-full max-w-[1220px] items-start justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="text-xs font-extrabold uppercase tracking-[0.28em] text-white/70">
                  Ritual Paws
                </div>

                <h2 className="mt-2 text-4xl font-black tracking-[-0.07em] text-white drop-shadow-[0_18px_60px_rgba(0,0,0,0.46)] sm:text-6xl lg:text-7xl">
                  Card Collection
                </h2>

                <p className="mt-3 max-w-[680px] text-sm leading-6 text-white/70 sm:text-base">
                  Browse your Ritual Paws card showcase. Add images as card(1), card(2), ... inside public/static/card.
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white/75 backdrop-blur-md transition hover:bg-white/15 hover:text-white"
              >
                ✕
              </button>
            </div>

            <section
              className="relative grid min-h-[540px] w-full max-w-[1220px] flex-1 place-items-center [perspective:1400px] sm:min-h-[620px]"
            >
              <button
                className="absolute left-[max(10px,3vw)] top-1/2 z-[150] grid h-[58px] w-[58px] -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-3xl text-white shadow-[0_20px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl transition hover:scale-110 hover:bg-white/20"
                type="button"
                onClick={prev}
                aria-label="Previous card"
              >
                ‹
              </button>

              <div className="relative grid h-[500px] w-full place-items-center [transform-style:preserve-3d] sm:h-[560px]">
                {cards.map((number, index) => (
                  <CollectionCard
                    key={number}
                    number={number}
                    index={index}
                    activeIndex={activeIndex}
                    total={CARD_COUNT}
                    onSelect={setActiveIndex}
                  />
                ))}
              </div>

              <button
                className="absolute right-[max(10px,3vw)] top-1/2 z-[150] grid h-[58px] w-[58px] -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-3xl text-white shadow-[0_20px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl transition hover:scale-110 hover:bg-white/20"
                type="button"
                onClick={next}
                aria-label="Next card"
              >
                ›
              </button>
            </section>

          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
