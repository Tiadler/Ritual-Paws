import { BrowserProvider, Contract } from 'ethers'
import {
  ensureRitualChain,
  getSelectedInjectedProvider,
  type InjectedProvider,
} from '@/lib/ritualTom'

const RITUAL_PAWS_CARD_NFT_ADDRESS =
  process.env.NEXT_PUBLIC_RITUAL_PAWS_CARD_NFT_ADDRESS

const RITUAL_PAWS_CARD_NFT_ABI = [
  'function mintCard(string tokenURI) external returns (uint256)',
] as const

function getInjectedProvider(): InjectedProvider {
  return getSelectedInjectedProvider()
}

export async function mintRitualPawsCard(tokenURI: string) {
  if (!RITUAL_PAWS_CARD_NFT_ADDRESS) {
    throw new Error('Missing NEXT_PUBLIC_RITUAL_PAWS_CARD_NFT_ADDRESS in environment variables.')
  }

  if (!tokenURI) {
    throw new Error('Missing tokenURI for NFT mint.')
  }

  const injectedProvider = getInjectedProvider()

  await ensureRitualChain(injectedProvider)

  await injectedProvider.request({
    method: 'eth_requestAccounts',
  })

  const browserProvider = new BrowserProvider(injectedProvider as any)
  const signer = await browserProvider.getSigner()

  const contract = new Contract(
    RITUAL_PAWS_CARD_NFT_ADDRESS,
    RITUAL_PAWS_CARD_NFT_ABI,
    signer
  )

  const tx = await contract.mintCard(tokenURI)
  const receipt = await tx.wait()

  return {
    txHash: receipt?.hash || tx.hash,
  }
}
