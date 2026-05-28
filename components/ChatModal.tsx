'use client'

import { Fragment, useState } from 'react'
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

function renderFormattedMessage(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={index} className="italic text-white/90">
          {part.slice(1, -1)}
        </em>
      )
    }

    return <Fragment key={index}>{part}</Fragment>
  })
}

export function ChatModal({
  onClose,
  petLevel,
  mood,
  petStats,
  petName,
}: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Signal received. Ready to talk?' },
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/88 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="brand-panel flex h-[620px] w-full max-w-[560px] flex-col overflow-hidden rounded-[1.35rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 border-b border-[#40FFAF]/14 px-6 py-4">
          <div className="brand-panel flex h-12 w-12 items-center justify-center rounded-none">
            <img
              src="/static/Pet/Pet(1).png"
              alt="Pet 1"
              className="h-10 w-10 object-contain"
            />
          </div>

          <div className="flex-1">
            <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
              Ritual Paws / {petLevel}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#40FFAF]">
              Online • Mood: {mood}
            </div>
          </div>

          <button
            onClick={onClose}
            className="brand-button-secondary px-3 py-2 text-sm"
          >
            Close
          </button>
        </div>

        <div className="brand-grid-surface flex-1 space-y-4 overflow-y-auto bg-[#0A0A0A]/60 p-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-wrap px-4 py-3 text-sm ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-pet'}`}
              >
                {renderFormattedMessage(msg.content)}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 pl-1 text-sm text-white/60">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60"></div>
                <div className="delay-150 h-1.5 w-1.5 animate-bounce rounded-full bg-white/60"></div>
                <div className="delay-300 h-1.5 w-1.5 animate-bounce rounded-full bg-white/60"></div>
              </div>
              <span>Pet is thinking...</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-[#40FFAF]/14 p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message to your pet..."
            className="flex-1 border border-[#40FFAF]/18 bg-[#0A0A0A] px-5 py-3 text-sm text-white outline-none transition focus:border-[#40FFAF]"
          />
          <button
            onClick={sendMessage}
            disabled={isTyping || !input.trim()}
            className="brand-button-primary px-6 font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </motion.div>
    </div>
  )
}
