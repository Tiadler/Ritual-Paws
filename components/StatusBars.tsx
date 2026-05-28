interface StatusBarsProps {
  hunger: number
  happiness: number
  energy: number
  cleanliness: number
}

export function StatusBars({
  hunger,
  happiness,
  energy,
  cleanliness,
}: StatusBarsProps) {
  const bars = [
    { label: 'Feed', value: hunger, color: '#FF5757', code: 'FD' },
    { label: 'Play', value: happiness, color: '#40FFAF', code: 'PL' },
    { label: 'Sleep', value: energy, color: '#8840FF', code: 'SL' },
    { label: 'Clean', value: cleanliness, color: '#00C2FF', code: 'CL' },
  ]

  return (
    <div className="space-y-4">
      {bars.map((bar) => (
        <div key={bar.label} className="brand-tag p-3">
          <div className="mb-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center border text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{
                  borderColor: `${bar.color}66`,
                  color: bar.color,
                  background: `${bar.color}16`,
                }}
              >
                {bar.code}
              </div>
              <span className="text-white/82">{bar.label}</span>
            </div>
            <span className="font-mono text-xs text-white/55">{bar.value}%</span>
          </div>

          <div className="status-bar">
            <div
              className="status-fill"
              style={{
                width: `${bar.value}%`,
                background: `linear-gradient(90deg, ${bar.color}, ${bar.color}CC)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
