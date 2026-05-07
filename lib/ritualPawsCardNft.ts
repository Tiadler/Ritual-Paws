import { BrowserProvider, Contract } from 'ethers'

const RITUAL_PAWS_CARD_NFT_ADDRESS =
  process.env.NEXT_PUBLIC_RITUAL_PAWS_CARD_NFT_ADDRESS

const RITUAL_PAWS_CARD_NFT_ABI = [
  'function mintCard(string tokenURI) external returns (uint256)',
] as const

type InjectedProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on?: (event: string, callback: (...args: any[]) => void) => void
  removeListener?: (event: string, callback: (...args: any[]) => void) => void
}

function getInjectedProvider(): InjectedProvider {
  if (typeof window === 'undefined') {
    throw new Error('Wallet is only available in the browser.')
  }

  const anyWindow = window as any
  const selectedWallet = window.localStorage.getItem('ritualpaws-wallet')

  if (selectedWallet === 'okx' && anyWindow.okxwallet) {
    return anyWindow.okxwallet
  }

  if (selectedWallet === 'metamask' && anyWindow.ethereum) {
    return anyWindow.ethereum
  }

  const provider = anyWindow.ethereum || anyWindow.okxwallet

  if (!provider) {
    throw new Error('No wallet provider found. Please connect MetaMask or OKX Wallet first.')
  }

  return provider
}

export async function mintRitualPawsCard(tokenURI: string) {
  if (!RITUAL_PAWS_CARD_NFT_ADDRESS) {
    throw new Error('Missing NEXT_PUBLIC_RITUAL_PAWS_CARD_NFT_ADDRESS in environment variables.')
  }

  if (!tokenURI) {
    throw new Error('Missing tokenURI for NFT mint.')
  }

  const injectedProvider = getInjectedProvider()
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