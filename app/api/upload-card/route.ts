import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const PINATA_JWT = process.env.PINATA_JWT

function base64ToBlob(base64Data: string, mimeType: string) {
  const base64 = base64Data.split(',')[1]
  const buffer = Buffer.from(base64, 'base64')

  return new Blob([buffer], { type: mimeType })
}

function toIpfsUri(gatewayUrl: string) {
  const match = gatewayUrl.match(/\/ipfs\/([^/?#]+)/)
  if (!match?.[1]) return gatewayUrl

  return `ipfs://${match[1]}`
}

async function uploadFileToPinata(fileBlob: Blob, fileName: string) {
  if (!PINATA_JWT) {
    throw new Error('Missing PINATA_JWT in environment variables.')
  }

  const formData = new FormData()

  formData.append('file', fileBlob, fileName)
  formData.append(
    'pinataMetadata',
    JSON.stringify({
      name: fileName,
    })
  )

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Pinata file upload failed: ${text}`)
  }

  const data = await response.json()

  return {
    ipfsHash: data.IpfsHash as string,
    ipfsUri: `ipfs://${data.IpfsHash}`,
    gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  }
}

async function uploadJsonToPinata(json: Record<string, any>, fileName: string) {
  if (!PINATA_JWT) {
    throw new Error('Missing PINATA_JWT in environment variables.')
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pinataMetadata: {
        name: fileName,
      },
      pinataContent: json,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Pinata metadata upload failed: ${text}`)
  }

  const data = await response.json()

  return {
    ipfsHash: data.IpfsHash as string,
    ipfsUri: `ipfs://${data.IpfsHash}`,
    gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      imageBase64,
      petName,
      level,
      mood,
      expPercent,
    } = body

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing imageBase64.' },
        { status: 400 }
      )
    }

    const safePetName = String(petName || 'ritual-paws')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const imageBlob = base64ToBlob(imageBase64, 'image/png')

    const imageUpload = await uploadFileToPinata(
      imageBlob,
      `${safePetName || 'ritual-paws'}-card.png`
    )

    const metadata = {
      name: `Ritual Paws Card - ${petName || 'Unnamed Pet'}`,
      description:
        'A Ritual Paws on-chain pet companion card minted on Ritual testnet.',
      image: imageUpload.ipfsUri,
      external_url: 'https://ritual-paws.vercel.app',
      attributes: [
        {
          trait_type: 'Pet Name',
          value: petName || 'Unnamed Pet',
        },
        {
          trait_type: 'Level',
          value: Number(level || 1),
        },
        {
          trait_type: 'Mood',
          value: mood || 'Unknown',
        },
        {
          trait_type: 'EXP Progress',
          value: `${Number(expPercent || 0)}%`,
        },
        {
          trait_type: 'Collection',
          value: 'Ritual Paws Card',
        },
      ],
    }

    const metadataUpload = await uploadJsonToPinata(
      metadata,
      `${safePetName || 'ritual-paws'}-metadata.json`
    )

    return NextResponse.json({
      imageURI: imageUpload.ipfsUri,
      imageGatewayURL: imageUpload.gatewayUrl,
      metadataURI: metadataUpload.ipfsUri,
      metadataGatewayURL: metadataUpload.gatewayUrl,
    })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      {
        error: error?.message || 'Upload card failed.',
      },
      { status: 500 }
    )
  }
}