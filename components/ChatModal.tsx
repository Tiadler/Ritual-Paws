'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ChatModalProps {
  onClose: () => void
  petLevel: string
  mood: 'happy' | 'normal' | 'sad'
}

export function ChatModal({ onClose, petLevel, mood }: ChatModalProps) {
  const [messages, setMessages] = useState([
    { from: 'pet', text: "Hey! What's up? Want to chat with me? 😸" }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = () => {
    if (!input.trim()) return

    setMessages([...messages, { from: 'user', text: input }])
    const userMessage = input
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      let reply = ''
      
      if (userMessage.toLowerCase().includes('hungry') || userMessage.toLowerCase().includes('eat')) {
        reply = "I want tuna! 🐟 Meow! 😸"
      } else if (userMessage.toLowerCase().includes('play')) {
        reply = "Yes! Let's play together! 🎮"
      } else if (userMessage.toLowerCase().includes('sleep')) {
        reply = "I'm tired... need a nap 😴"
      } else {
        reply = "That's cool! I like hanging out with you 😸"
      }

      setMessages(prev => [...prev, { from: 'pet', text: reply }])
      setIsTyping(false)
    }, 850)
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1A2E] w-full max-w-[520px] rounded-3xl overflow-hidden border border-white/10 flex flex-col h-[620px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-4">
          <div className="text-4xl"></div>
          <div className="flex-1">
            <div className="font-semibold">Ritual Paws • {petLevel}</div>
            <div className="text-xs text-[#00E5C4]">● Online • Mood: {mood}</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#11111F]">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 text-sm ${msg.from === 'user' ? 'chat-bubble-user' : 'chat-bubble-pet'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-center gap-2 text-white/60 text-sm pl-1">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-150"></div>
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-300"></div>
              </div>
              <span>Pet is thinking...</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message to your pet..."
            className="flex-1 bg-[#11111F] border border-white/20 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[#FF6B9D]"
          />
          <button 
            onClick={sendMessage}
            className="px-6 bg-[#FF6B9D] rounded-2xl font-medium active:scale-95 transition-all"
          >
            Send
          </button>
        </div>
      </motion.div>
    </div>
  )
}
