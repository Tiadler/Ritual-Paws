import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'

type ClientMessage = {
  role: 'user' | 'assistant'
  content: string
}

type PetContext = {
  petLevel?: string
  mood?: 'happy' | 'normal' | 'sad' | string
  hunger?: number
  happiness?: number
  energy?: number
  cleanliness?: number
  name?: string
}

const client = new OpenAI({
  apiKey: process.env.POE_API_KEY,
  baseURL: process.env.POE_API_BASE_URL || 'https://api.poe.com/v1',
})

function cleanReply(text: string) {
  return text
    .replace(/\[\[\d+\]\]\[doc_\d+\]/g, '')
    .replace(/\[\[\d+\]\]/g, '')
    .replace(/\[doc_\d+\]/g, '')
    .replace(/##\s*📚?\s*References[\s\S]*/i, '')
    .replace(/References[\s\S]*/i, '')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function buildSystemPrompt(petContext?: PetContext) {
  const level = petContext?.petLevel || 'Unknown level'
  const mood = petContext?.mood || 'normal'
  const name = petContext?.name || 'Ritual Paws pet'

  const stats = [
    typeof petContext?.hunger === 'number' ? `hunger=${petContext.hunger}/100` : null,
    typeof petContext?.happiness === 'number' ? `happiness=${petContext.happiness}/100` : null,
    typeof petContext?.energy === 'number' ? `energy=${petContext.energy}/100` : null,
    typeof petContext?.cleanliness === 'number' ? `cleanliness=${petContext.cleanliness}/100` : null,
  ]
    .filter(Boolean)
    .join(', ')

  return `You are ${name}, a cute on-chain cat companion inside the Ritual Paws DApp.
Current pet context: level=${level}, mood=${mood}${stats ? `, stats: ${stats}` : ''}.
Your style: warm, playful, slightly magical, short and emotionally expressive.
Answer in the same language as the user. If the user uses Vietnamese, answer in Vietnamese.
Do not mention that you are an API, model, Poe, OpenAI, or ChatGPT.
If the user asks about caring actions, naturally suggest feed, play, sleep, or clean based on the pet stats.
Keep replies concise: 1-4 sentences unless the user asks for details.`
}

export async function POST(req: Request) {
  try {
    if (!process.env.POE_API_KEY) {
      return NextResponse.json(
        { error: 'Missing POE_API_KEY in .env.local' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const messages = (body.messages || []) as ClientMessage[]
    const petContext = body.petContext as PetContext | undefined

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Missing messages' }, { status: 400 })
    }

    const completion = await client.chat.completions.create({
      model: process.env.POE_BOT_MODEL || 'siggyrath',
      messages: [
        { role: 'system', content: buildSystemPrompt(petContext) },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    })

    const reply = cleanReply(completion.choices[0]?.message?.content || '')

    return NextResponse.json({ content: reply || 'Meow... I am here with you.' })
  } catch (error) {
    console.error('Pet chat API error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Pet chat API request failed',
      },
      { status: 500 }
    )
  }
}
