import { BrowserProvider, Contract } from 'ethers'

export const RITUAL_PAWS_CARD_NFT_ABI = [
  {
    inputs: [
      {
        internalType: 'string',
        name: 'tokenURI',
        type: 'string',
      },
    ],
    name: 'mintCard',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'minter',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'tokenURI',
        type: 'string',
      },
    ],
    name: 'CardMinted',
    type: 'event',
  },
] as const

type EthereumProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>
}

function getWalletProvider(): EthereumProvider {
  if (typeof window === 'undefined') {
    throw new Error('Wallet is only available in the browser.')
  }

  const anyWindow = window as any

  // Prefer the wallet the user selected earlier, if your app stores it.
  const selectedWallet = window.localStorage.getItem('ritualpaws-wallet')

  if (selectedWallet === 'okx' && anyWindow.okxwallet) {
    return anyWindow.okxwallet
  }

  if (selectedWallet === 'metamask' && anyWindow.ethereum) {
    return anyWindow.ethereum
  }

  // Fallbacks: OKX first if present, then generic injected EVM provider.
  if (anyWindow.okxwallet) {
    return anyWindow.okxwallet
  }

  if (anyWindow.ethereum) {
    return anyWindow.ethereum
  }

  throw new Error('No EVM wallet found. Please connect MetaMask or OKX Wallet.')
}

export async function mintRitualPawsCard(tokenURI: string) {
  const nftAddress = process.env.NEXT_PUBLIC_RITUAL_PAWS_CARD_NFT_ADDRESS

  if (!nftAddress) {
    throw new Error('Missing NEXT_PUBLIC_RITUAL_PAWS_CARD_NFT_ADDRESS in .env.local')
  }

  if (!tokenURI) {
    throw new Error('Missing tokenURI for NFT mint.')
  }

  const injectedProvider = getWalletProvider()
  const provider = new BrowserProvider(injectedProvider as any)
  const signer = await provider.getSigner()

  const contract = new Contract(
    nftAddress,
    RITUAL_PAWS_CARD_NFT_ABI,
    signer
  )

  const tx = await contract.mintCard(tokenURI)
  const receipt = await tx.wait()

  return {
    txHash: receipt?.hash || tx.hash,
    receipt,
  }
}
