'use client'

import { motion } from 'framer-motion'

interface ShopModalProps {
  onClose: () => void
}

const shopItems = [
  { id: 1, name: 'Tuna', price: 0.5, emoji: '🐟', category: 'food' },
  { id: 2, name: 'Special Cat Pastry', price: 2.8, emoji: '🥐', category: 'food' },
  { id: 3, name: 'Party Hat', price: 1.2, emoji: '🎩', category: 'accessory' },
  { id: 4, name: 'Chad Shades', price: 4.5, emoji: '😎', category: 'accessory' },
  { id: 5, name: 'Mini Bed', price: 3.0, emoji: '🛏️', category: 'furniture' },
  { id: 6, name: 'Gaming Chair', price: 12.0, emoji: '🪑', category: 'furniture' },
  { id: 7, name: 'Mini Aquarium', price: 35.0, emoji: '🐠', category: 'furniture' },
  { id: 8, name: 'Legend Collar', price: 28.0, emoji: '👑', category: 'accessory' },
]

export function ShopModal({ onClose }: ShopModalProps) {
  const handleBuy = (item: any) => {
    alert(`✅ Purchased ${item.name} for ${item.price} RITUAL!\n\n(In the live app this would open MetaMask.)`)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-6" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="bg-[#1A1A2E] rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">🛍️ Ritual Store</div>
            <div className="text-white/60 text-sm">Purchase with RITUAL token</div>
          </div>
          <button onClick={onClose} className="text-2xl text-white/60 hover:text-white">✕</button>
        </div>

        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-y-auto max-h-[70vh]">
          {shopItems.map((item) => (
            <div key={item.id} className="shop-card bg-[#11111F] rounded-2xl p-5 border border-white/10">
              <div className="text-6xl mb-4 flex justify-center">{item.emoji}</div>
              <div className="font-semibold text-lg mb-1">{item.name}</div>
              <div className="text-[#FFD700] font-mono text-xl mb-4">{item.price} RITUAL</div>
              
              <button 
                onClick={() => handleBuy(item)}
                className="w-full py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.985] transition-all text-sm"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        <div className="px-8 py-4 bg-black/30 text-xs text-center text-white/50">
          All purchases are executed on-chain on Ritual Testnet.
        </div>
      </motion.div>
    </div>
  )
}
