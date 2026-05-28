'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ShopModalProps {
  onClose: () => void
}

const shopItems = [
  { id: 1, name: 'Tuna', price: 0.5, category: 'Food' },
  { id: 2, name: 'Special Cat Pastry', price: 2.8, category: 'Food' },
  { id: 3, name: 'Party Hat', price: 1.2, category: 'Accessory' },
  { id: 4, name: 'Chad Shades', price: 4.5, category: 'Accessory' },
  { id: 5, name: 'Mini Bed', price: 3.0, category: 'Furniture' },
  { id: 6, name: 'Gaming Chair', price: 12.0, category: 'Furniture' },
  { id: 7, name: 'Mini Aquarium', price: 35.0, category: 'Furniture' },
  { id: 8, name: 'Legend Collar', price: 28.0, category: 'Accessory' },
]

export function ShopModal({ onClose }: ShopModalProps) {
  const [purchaseMessage, setPurchaseMessage] = useState('')

  const handleBuy = (item: (typeof shopItems)[number]) => {
    setPurchaseMessage(
      `Purchased ${item.name} for ${item.price} RITUAL. Live purchases will open your wallet.`
    )
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#1A1A2E]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">
          <div>
            <div className="text-2xl font-bold">Ritual Store</div>
            <div className="text-sm text-white/60">Purchase with RITUAL token</div>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-white/60 hover:text-white"
          >
            x
          </button>
        </div>

        <div className="grid max-h-[70vh] grid-cols-1 gap-5 overflow-y-auto p-8 sm:grid-cols-2 lg:grid-cols-4">
          {purchaseMessage ? (
            <div className="col-span-full rounded-2xl border border-[#40FFAF]/20 bg-[#40FFAF]/10 px-4 py-3 text-sm text-white/72">
              {purchaseMessage}
            </div>
          ) : null}

          {shopItems.map((item) => (
            <div
              key={item.id}
              className="shop-card rounded-2xl border border-white/10 bg-[#11111F] p-5"
            >
              <div className="mb-3 text-xs uppercase tracking-[0.18em] text-white/40">
                {item.category}
              </div>
              <div className="mb-1 text-lg font-semibold">{item.name}</div>
              <div className="mb-4 font-mono text-xl text-[#FFD700]">
                {item.price} RITUAL
              </div>

              <button
                onClick={() => handleBuy(item)}
                className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.985]"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        <div className="bg-black/30 px-8 py-4 text-center text-xs text-white/50">
          All purchases are executed on-chain on Ritual Testnet.
        </div>
      </motion.div>
    </div>
  )
}
