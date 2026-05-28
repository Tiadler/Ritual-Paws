import { Interface } from 'ethers'
import { getProviderAndSigner } from '@/lib/ritualTom'

const RITUAL_PAWS_CARD_NFT_ADDRESS =
  process.env.NEXT_PUBLIC_RITUAL_PAWS_CARD_NFT_ADDRESS

const RITUAL_PAWS_CARD_NFT_ABI = [
  'function mintCard(string tokenURI) external returns (uint256)',
] as const

const RITUAL_PAWS_CARD_NFT_INTERFACE = new Interface(RITUAL_PAWS_CARD_NFT_ABI)
const MINT_CARD_GAS_HEX = '0x493e0'

export async function mintRitualPawsCard(tokenURI: string) {
  if (!RITUAL_PAWS_CARD_NFT_ADDRESS) {
    throw new Error('Missing NEXT_PUBLIC_RITUAL_PAWS_CARD_NFT_ADDRESS in environment variables.')
  }

  if (!tokenURI) {
    throw new Error('Missing tokenURI for NFT mint.')
  }

  const { injectedProvider, provider, address } = await getProviderAndSigner()
  const txHash = await injectedProvider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: address,
        to: RITUAL_PAWS_CARD_NFT_ADDRESS,
        data: RITUAL_PAWS_CARD_NFT_INTERFACE.encodeFunctionData('mintCard', [
          tokenURI,
        ]),
        gas: MINT_CARD_GAS_HEX,
      },
    ],
  })

  const receipt = await provider.waitForTransaction(txHash)

  if (!receipt || receipt.status !== 1) {
    throw new Error('NFT mint transaction failed on-chain.')
  }

  return {
    txHash,
  }
}
