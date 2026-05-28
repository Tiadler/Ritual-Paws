'use client'

import { motion } from 'framer-motion'

interface QuickActionsProps {
  onFeed: () => void
  onPlay: () => void
  onSleep: () => void
  onClean: () => void
  busyAction?: string
}

export function QuickActions({
  onFeed,
  onPlay,
  onSleep,
  onClean,
  busyAction,
}: QuickActionsProps) {
  const actions = [
    { key: 'feed', label: 'Feed', onClick: onFeed, color: '#FF5757' },
    { key: 'play', label: 'Play', onClick: onPlay, color: '#40FFAF' },
    { key: 'sleep', label: 'Sleep', onClick: onSleep, color: '#8840FF' },
    { key: 'clean', label: 'Clean', onClick: onClean, color: '#00C2FF' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const isBusy = busyAction === action.key

        return (
          <motion.button
            key={action.key}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={action.onClick}
            disabled={Boolean(busyAction)}
            className="group relative flex min-h-[7.15rem] flex-col items-start justify-end overflow-hidden rounded-[14px] border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              borderColor: `${action.color}52`,
              background: `linear-gradient(145deg, ${action.color}24 0%, rgba(17,17,17,0.94) 48%, rgba(5,5,5,0.98) 100%)`,
              boxShadow: `0 18px 45px -34px ${action.color}`,
            }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1"
              style={{
                background: action.color,
                boxShadow: `0 0 24px ${action.color}`,
              }}
            />

            <div className="relative z-10">
              <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
                {isBusy ? 'Confirming...' : action.label}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/45">
                0.0015 RITUAL +20%
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
