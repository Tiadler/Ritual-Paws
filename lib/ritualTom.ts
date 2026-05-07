import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers'

export const ACTION_PRICE = parseEther('0.0015')

const RITUAL_TOM_ADDRESS = process.env.NEXT_PUBLIC_RITUALTOM_ADDRESS

export const RITUAL_TOM_ABI = [
  'function adoptPet(string name, string color) external',
  'function getMyPet() external view returns ((string name,string color,uint256 totalExp,uint8 hunger,uint8 happiness,uint8 energy,uint8 cleanliness,uint256 adoptedAt,uint256 updatedAt,bool adopted) pet,uint256 level,uint256 expInLevel,uint256 expToNextLevel)',
  'function getPet(address user) external view returns ((string name,string color,uint256 totalExp,uint8 hunger,uint8 happiness,uint8 energy,uint8 cleanliness,uint256 adoptedAt,uint256 updatedAt,bool adopted) pet,uint256 level,uint256 expInLevel,uint256 expToNextLevel)',
  'function hasAdopted(address user) external view returns (bool)',
  'function feed() external payable',
  'function play() external payable',
  'function sleepPet() external payable',
  'function clean() external payable',
  'function syncPet() external',
] as const

export type InjectedProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on?: (event: string, callback: (...args: any[]) => void) => void
  removeListener?: (event: string, callback: (...args: any[]) => void) => void
  isMetaMask?: boolean
  isOkxWallet?: boolean
}

export type RitualTomPet = {
  name: string
  color: string
  totalExp: number

  hunger: number
  happiness: number
  energy: number
  cleanliness: number

  food: number
  play: number
  sleep: number
  clean: number

  adoptedAt: number
  updatedAt: number
  adopted: boolean

  level: number
  expInLevel: number
  expToNextLevel: number
}

type RawPet = {
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
}

function getSelectedInjectedProvider(): InjectedProvider {
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

export async function getProviderAndSigner(forceWalletSelection = false) {
  const injectedProvider = getSelectedInjectedProvider()

  if (forceWalletSelection) {
    try {
      await injectedProvider.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      })
    } catch {
      // Some wallets do not support wallet_requestPermissions.
      // Continue with eth_requestAccounts.
    }
  }

  await injectedProvider.request({
    method: 'eth_requestAccounts',
  })

  const provider = new BrowserProvider(injectedProvider as any)
  const signer = await provider.getSigner()
  const address = await signer.getAddress()

  return {
    injectedProvider,
    provider,
    signer,
    address,
  }
}

export async function getRitualTomContract(forceWalletSelection = false) {
  if (!RITUAL_TOM_ADDRESS) {
    throw new Error('Missing NEXT_PUBLIC_RITUALTOM_ADDRESS in environment variables.')
  }

  const { provider, signer, address } = await getProviderAndSigner(forceWalletSelection)

  const contract = new Contract(
    RITUAL_TOM_ADDRESS,
    RITUAL_TOM_ABI,
    signer
  )

  return {
    provider,
    signer,
    address,
    contract,
  }
}

function normalizePet(rawPet: RawPet, level: bigint, expInLevel: bigint, expToNextLevel: bigint): RitualTomPet {
  const hunger = Number(rawPet.hunger ?? 0)
  const happiness = Number(rawPet.happiness ?? 0)
  const energy = Number(rawPet.energy ?? 0)
  const cleanliness = Number(rawPet.cleanliness ?? 0)

  return {
    name: rawPet.name,
    color: rawPet.color,
    totalExp: Number(rawPet.totalExp ?? 0n),

    hunger,
    happiness,
    energy,
    cleanliness,

    food: hunger,
    play: happiness,
    sleep: energy,
    clean: cleanliness,

    adoptedAt: Number(rawPet.adoptedAt ?? 0n),
    updatedAt: Number(rawPet.updatedAt ?? 0n),
    adopted: Boolean(rawPet.adopted),

    level: Number(level ?? 1n),
    expInLevel: Number(expInLevel ?? 0n),
    expToNextLevel: Number(expToNextLevel ?? 100n),
  }
}

export async function readMyPet(): Promise<RitualTomPet> {
  const { contract } = await getRitualTomContract()

  const [pet, level, expInLevel, expToNextLevel] = await contract.getMyPet()

  return normalizePet(
    pet as RawPet,
    level as bigint,
    expInLevel as bigint,
    expToNextLevel as bigint
  )
}

export async function readPet(userAddress: string): Promise<RitualTomPet> {
  const { contract } = await getRitualTomContract()

  const [pet, level, expInLevel, expToNextLevel] = await contract.getPet(userAddress)

  return normalizePet(
    pet as RawPet,
    level as bigint,
    expInLevel as bigint,
    expToNextLevel as bigint
  )
}

export async function hasAdoptedPet(userAddress: string): Promise<boolean> {
  const { contract } = await getRitualTomContract()

  return Boolean(await contract.hasAdopted(userAddress))
}

export async function adoptPet(name: string, color: string) {
  const { contract, address } = await getRitualTomContract()

  const tx = await contract.adoptPet(name, color)
  const receipt = await tx.wait()

  return {
    address,
    txHash: receipt?.hash || tx.hash,
  }
}

export async function syncPetOnChain() {
  const { contract, address } = await getRitualTomContract()

  const tx = await contract.syncPet()
  const receipt = await tx.wait()

  return {
    address,
    txHash: receipt?.hash || tx.hash,
  }
}

export async function getWalletBalance(address?: string): Promise<string> {
  const { provider, address: connectedAddress } = await getProviderAndSigner()

  const targetAddress = address || connectedAddress
  const balance = await provider.getBalance(targetAddress)

  return Number(formatEther(balance)).toFixed(4)
}

export function shortAddress(address?: string | null) {
  if (!address) return ''

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
