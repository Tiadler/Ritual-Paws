'use client'

import { DEFAULT_EQUIPPED_ITEMS, PET_ITEM_SLOTS, getPetArtByColor, imageFallback } from '@/lib/staticAssets'

type CardTone = 'green' | 'purple'

interface PetCardProps {
  petName: string
  mood: string
  level: number
  expPercent: number
  subtitle?: string
  color?: string
}

const colorLabel: Record<string, string> = {
  black: 'Midnight Black',
  cream: 'Dreamy Purple',
  orange: 'Orange Tabby',
  gray: 'Emerald green',
  white: 'Snow White',
  silver: 'Silver Mist',
  brown: 'Purple Gradient',
  blue: 'Water Spirit',
  purple: 'Forest Spirit',
  green: 'Rose Pink',
  pink: 'Galaxy Universe',
}

export function PetCard({ petName, mood, level, expPercent, subtitle = 'RitualTom Cat', color = 'black' }: PetCardProps) {
  const tone: CardTone = level >= 20 ? 'purple' : 'green'
  const isPurple = tone === 'purple'
  const petArt = getPetArtByColor(color)

  return (
    <div
      className={`w-[420px] max-w-full aspect-[5/7] rounded-[2.5rem] p-[2px] transition-transform duration-300 ease-out card-glow-hover ${
        isPurple
          ? 'bg-gradient-to-br from-white via-[#a78bfa] to-white shadow-[0_30px_120px_-40px_rgba(168,85,247,0.65)]'
          : 'bg-gradient-to-br from-white via-[#7eff9a] to-white shadow-[0_30px_120px_-40px_rgba(56,176,0,0.45)]'
      }`}
    >
      <div className={`flex h-full flex-col overflow-hidden rounded-[2.3rem] ${isPurple ? 'bg-[#160b2b]' : 'bg-[#041908]'}`}>
        <div className={`p-6 ${isPurple ? 'bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#7e22ce]' : 'bg-gradient-to-br from-[#04220c] via-[#083b1d] to-[#0f5832]'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className={`text-xs font-semibold uppercase tracking-[0.3em] ${isPurple ? 'text-[#ddd6fe]' : 'text-[#b7f5c3]'}`}>RitualTom Card</div>
              <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{petName}</div>
              <div className={`mt-1 text-sm ${isPurple ? 'text-[#ede9fe]' : 'text-[#c5f2af]'}`}>{subtitle}</div>
            </div>
            <div className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${isPurple ? 'bg-white/15 text-[#f5f3ff]' : 'bg-[#18592e]/80 text-[#a7ff9a]'}`}>
              Lv. {level}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-6">
          <div className={`rounded-[2rem] border p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] ${isPurple ? 'border-[#a78bfa]/25 bg-[#21113d]' : 'border-[#38b000]/20 bg-[#0c1d11]'}`}>
            <div className="relative h-[230px] overflow-hidden rounded-[2rem]">
              <div className={`absolute inset-0 ${isPurple ? 'bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.18),transparent_34%)]' : 'bg-[radial-gradient(circle_at_top_left,_rgba(74,222,128,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),transparent_30%)]'}`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`relative h-[190px] w-[190px] rounded-[2.5rem] border shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] ${isPurple ? 'border-[#c4b5fd]/30 bg-[#120720]' : 'border-[#3cf47c]/20 bg-[#041409]'}`}>
                  <img
                    src={petArt.src}
                    alt="Pet snapshot"
                    onError={(event) => imageFallback(event, petArt.fallbackSrc)}
                    className="absolute inset-0 z-10 h-full w-full rounded-[2.5rem] object-contain p-2"
                  />
                  {DEFAULT_EQUIPPED_ITEMS.map((item) => (
                    <img
                      key={item.id}
                      src={item.src}
                      alt={item.name}
                      onError={(event) => imageFallback(event, item.fallbackSrc)}
                      className="absolute select-none pointer-events-none drop-shadow-xl"
                      style={PET_ITEM_SLOTS[item.slot]}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
            <div className={`rounded-[1.4rem] border p-4 ${isPurple ? 'border-[#a78bfa]/25 bg-white/5' : 'border-[#38b000]/20 bg-[#0b2615]/95'}`}>
              <div className={`text-[10px] uppercase tracking-[0.2em] ${isPurple ? 'text-[#ddd6fe]' : 'text-[#a7ff9a]'}`}>Mood</div>
              <div className="mt-2 text-lg font-semibold text-white">{mood}</div>
            </div>
            <div className={`rounded-[1.4rem] border p-4 ${isPurple ? 'border-[#a78bfa]/25 bg-white/5' : 'border-[#38b000]/20 bg-[#0b2615]/95'}`}>
              <div className={`text-[10px] uppercase tracking-[0.2em] ${isPurple ? 'text-[#ddd6fe]' : 'text-[#a7ff9a]'}`}>Color</div>
              <div className="mt-2 text-lg font-semibold text-white">{colorLabel[color] || color}</div>
            </div>
            <div className={`rounded-[1.4rem] border p-4 ${isPurple ? 'border-[#a78bfa]/25 bg-white/5' : 'border-[#38b000]/20 bg-[#0b2615]/95'}`}>
              <div className={`text-[10px] uppercase tracking-[0.2em] ${isPurple ? 'text-[#ddd6fe]' : 'text-[#a7ff9a]'}`}>Type</div>
              <div className="mt-2 text-lg font-semibold text-white">Cat</div>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>EXP progress</span>
              <span>{expPercent}%</span>
            </div>
            <div className={`h-4 overflow-hidden rounded-full ${isPurple ? 'bg-[#2e1065]' : 'bg-[#143921]'}`}>
              <div
                className={`h-4 rounded-full ${isPurple ? 'bg-gradient-to-r from-[#a78bfa] via-[#c084fc] to-[#f0abfc]' : 'bg-gradient-to-r from-[#4ade80] via-[#22c55e] to-[#16a34a]'}`}
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
