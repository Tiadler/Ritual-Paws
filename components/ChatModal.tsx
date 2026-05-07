'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ChatModalProps {
  onClose: () => void
  petLevel: string
  mood: 'happy' | 'normal' | 'sad'
  petStats?: {
    hunger?: number
    happiness?: number
    energy?: number
    cleanliness?: number
  }
  petName?: string
}

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export function ChatModal({ onClose, petLevel, mood, petStats, petName }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hey! I'm here. Want to chat with me? 😸" },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isTyping) return

    const userMessage: ChatMessage = { role: 'user', content: text }
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          petContext: {
            petLevel,
            mood,
            name: petName || 'Ritual Paws pet',
            hunger: petStats?.hunger,
            happiness: petStats?.happiness,
            energy: petStats?.energy,
            cleanliness: petStats?.cleanliness,
          },
        }),
      })

      const rawText = await res.text()
      let data: any = {}

      try {
        data = JSON.parse(rawText)
      } catch {
        data = { error: rawText }
      }

      if (!res.ok) {
        throw new Error(data.error || rawText || 'Chat API failed')
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.content || 'Meow... I am thinking about that.',
        },
      ])
    } catch (error) {
      console.error('Pet chat failed:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? `Chat API error: ${error.message}`
              : 'Chat API error.',
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1A2E] w-full max-w-[520px] rounded-3xl overflow-hidden border border-white/10 flex flex-col h-[620px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-4">
          <div className="text-4xl">🐾</div>
          <div className="flex-1">
            <div className="font-semibold">Ritual Paws • {petLevel}</div>
            <div className="text-xs text-[#00E5C4]">● Online • Mood: {mood}</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#11111F]">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-pet'}`}>
                {msg.content}
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
            disabled={isTyping || !input.trim()}
            className="px-6 bg-[#FF6B9D] rounded-2xl font-medium active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </motion.div>
    </div>
  )
}
