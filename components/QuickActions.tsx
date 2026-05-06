'use client'

import { motion } from 'framer-motion'

interface QuickActionsProps {
  onFeed: () => void
  onPlay: () => void
  onSleep: () => void
  onClean: () => void
  busyAction?: string
}

export function QuickActions({ onFeed, onPlay, onSleep, onClean, busyAction }: QuickActionsProps) {
  const actions = [
    { key: 'feed', label: 'Food', icon: '🍖', onClick: onFeed, color: '#FF6B9D' },
    { key: 'play', label: 'Play', icon: '🎾', onClick: onPlay, color: '#00E5C4' },
    { key: 'sleep', label: 'Sleep', icon: '😴', onClick: onSleep, color: '#7C3AED' },
    { key: 'clean', label: 'Bath', icon: '🛁', onClick: onClean, color: '#3B82F6' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const isBusy = busyAction === action.key
        return (
          <motion.button
            key={action.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.985 }}
            onClick={action.onClick}
            disabled={Boolean(busyAction)}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-white/10 hover:border-white/30 transition-all active:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: `${action.color}10` }}
          >
            <div className="text-3xl">{isBusy ? '⏳' : action.icon}</div>
            <div className="text-sm font-medium">{isBusy ? 'Confirming...' : action.label}</div>
            <div className="text-[11px] text-white/45">0.0015 RITUAL • +20%</div>
          </motion.button>
        )
      })}
    </div>
  )
}
