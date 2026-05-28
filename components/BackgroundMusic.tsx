'use client'

import { useEffect, useRef } from 'react'

interface BackgroundMusicProps {
  src: string
  volume?: number
}

export function BackgroundMusic({ src, volume = 0.1 }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume

    const playAudio = () => {
      audio.play().catch(() => {
        // Browsers can block autoplay until the first user interaction.
      })
    }

    playAudio()

    const handleFirstInteraction = () => {
      playAudio()
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }

    window.addEventListener('pointerdown', handleFirstInteraction)
    window.addEventListener('keydown', handleFirstInteraction)

    return () => {
      audio.pause()
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [volume])

  return <audio ref={audioRef} src={src} loop preload="auto" />
}
