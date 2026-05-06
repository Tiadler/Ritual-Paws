interface StatusBarsProps {
  hunger: number
  happiness: number
  energy: number
  cleanliness: number
}

export function StatusBars({ hunger, happiness, energy, cleanliness }: StatusBarsProps) {
  const bars = [
    { label: 'Food', value: hunger, color: '#FF6B9D', icon: '🍖' },
    { label: 'Play', value: happiness, color: '#00E5C4', icon: '😺' },
    { label: 'Sleep', value: energy, color: '#FFD700', icon: '⚡' },
    { label: 'Clean', value: cleanliness, color: '#60A5FA', icon: '🛁' },
  ]

  return (
    <div className="space-y-5">
      {bars.map((bar, index) => (
        <div key={index}>
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-2">
              <span>{bar.icon}</span>
              <span className="text-white/80">{bar.label}</span>
            </div>
            <span className="font-mono text-xs text-white/60">{bar.value}%</span>
          </div>
          <div className="status-bar">
            <div
              className="status-fill"
              style={{
                width: `${bar.value}%`,
                background: bar.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
