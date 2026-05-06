import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers'
import { RITUAL_TOM_ABI } from './ritualTomAbi'

export const RITUAL_CHAIN_ID = Number(process.env.NEXT_PUBLIC_RITUAL_CHAIN_ID || 1979)
export const RITUAL_CHAIN_HEX = `0x${RITUAL_CHAIN_ID.toString(16)}`
export const RITUAL_RPC = process.env.NEXT_PUBLIC_RITUAL_RPC || 'https://rpc.ritualfoundation.org'
export const RITUALTOM_ADDRESS = process.env.NEXT_PUBLIC_RITUALTOM_ADDRESS || ''
export const ACTION_PRICE = parseEther('0.0015')

export type RitualTomPet = {
  name: string
  color: string
  totalExp: bigint
  hunger: number
  happiness: number
  energy: number
  cleanliness: number
  adoptedAt: bigint
  updatedAt: bigint
  adopted: boolean
  level: number
  expInLevel: number
  expToNextLevel: number
}

type EthereumProvider = NonNullable<Window['ethereum']>

export function shortAddress(address: string) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function getEthereumProvider(): EthereumProvider {
  if (typeof window === 'undefined') {
    throw new Error('MetaMask chưa được cài. Hãy cài MetaMask trước.')
  }

  const ethereum = window.ethereum

  if (!ethereum) {
    throw new Error('MetaMask chưa được cài. Hãy cài MetaMask trước.')
  }

  return ethereum
}

export function assertMetaMask() {
  getEthereumProvider()
}

export function assertContractAddress() {
  if (!RITUALTOM_ADDRESS || RITUALTOM_ADDRESS.startsWith('0xYOUR')) {
    throw new Error('Bạn chưa điền NEXT_PUBLIC_RITUALTOM_ADDRESS trong .env.local')
  }
}

function normalizeWalletError(error: any) {
  const message = String(error?.shortMessage || error?.message || '')

  if (error?.code === 4001 || message.includes('User rejected')) {
    return new Error('Bạn đã từ chối yêu cầu trong MetaMask.')
  }

  if (error?.code === -32002) {
    return new Error(
      'MetaMask đang có một popup đang chờ xử lý. Hãy mở MetaMask và xử lý popup đó trước.'
    )
  }

  if (message.includes('Failed to connect to MetaMask')) {
    return new Error(
      'MetaMask chưa cấp quyền cho website này. Hãy mở MetaMask → Connected sites → kết nối lại account.'
    )
  }

  return error
}

export async function requestAccounts(forceWalletSelection = false): Promise<string[]> {
  const ethereum = getEthereumProvider()

  try {
    if (forceWalletSelection) {
      await ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      })
    }

    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    })

    return accounts as string[]
  } catch (error: any) {
    throw normalizeWalletError(error)
  }
}

export async function switchToRitualChain() {
  const ethereum = getEthereumProvider()

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: RITUAL_CHAIN_HEX }],
    })
  } catch (error: any) {
    if (error?.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: RITUAL_CHAIN_HEX,
            chainName: 'Ritual Chain',
            nativeCurrency: {
              name: 'RITUAL',
              symbol: 'RITUAL',
              decimals: 18,
            },
            rpcUrls: [RITUAL_RPC],
            blockExplorerUrls: ['https://explorer.ritualfoundation.org'],
          },
        ],
      })

      return
    }

    throw normalizeWalletError(error)
  }
}

export async function getProviderAndSigner(forceWalletSelection = false) {
  const ethereum = getEthereumProvider()

  // Important: ask account permission first, then switch network.
  // This allows any MetaMask account/user to connect to the DApp.
  const accounts = await requestAccounts(forceWalletSelection)

  if (!accounts?.length) {
    throw new Error('Không tìm thấy account MetaMask nào được cấp quyền.')
  }

  await switchToRitualChain()

  const provider = new BrowserProvider(ethereum)
  const signer = await provider.getSigner(accounts[0])
  const address = await signer.getAddress()

  return {
    provider,
    signer,
    address,
  }
}

export async function getRitualTomContract() {
  assertContractAddress()

  const { signer, address, provider } = await getProviderAndSigner()

  return {
    contract: new Contract(RITUALTOM_ADDRESS, RITUAL_TOM_ABI, signer),
    signer,
    address,
    provider,
  }
}

export async function readMyPet(): Promise<RitualTomPet | null> {
  const { contract } = await getRitualTomContract()

  try {
    const [pet, level, expInLevel, expToNextLevel] = await contract.getMyPet()

    return {
      name: pet.name,
      color: pet.color,
      totalExp: pet.totalExp,
      hunger: Number(pet.hunger),
      happiness: Number(pet.happiness),
      energy: Number(pet.energy),
      cleanliness: Number(pet.cleanliness),
      adoptedAt: pet.adoptedAt,
      updatedAt: pet.updatedAt,
      adopted: pet.adopted,
      level: Number(level),
      expInLevel: Number(expInLevel),
      expToNextLevel: Number(expToNextLevel),
    }
  } catch (error: any) {
    const message = String(error?.shortMessage || error?.message || '')

    if (message.includes('NoPetAdopted') || message.includes('No pet')) {
      return null
    }

    throw normalizeWalletError(error)
  }
}

export async function getWalletBalance(address: string) {
  const ethereum = getEthereumProvider()
  const provider = new BrowserProvider(ethereum)
  const balance = await provider.getBalance(address)

  return Number(formatEther(balance)).toFixed(4)
}