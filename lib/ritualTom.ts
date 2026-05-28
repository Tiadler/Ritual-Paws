import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers'

export const ACTION_PRICE = parseEther('0.0015')
export const ACTION_PRICE_HEX = `0x${ACTION_PRICE.toString(16)}`
export const CARE_ACTION_GAS_HEX = '0x186a0'

const RITUAL_TOM_ADDRESS = process.env.NEXT_PUBLIC_RITUALTOM_ADDRESS

export const RITUAL_CHAIN_ID_DECIMAL = 1979
export const RITUAL_CHAIN_ID_HEX = '0x7bb'

export const RITUAL_CHAIN_PARAMS = {
  chainId: RITUAL_CHAIN_ID_HEX,
  chainName: 'Ritual Chain Testnet',
  nativeCurrency: {
    name: 'RITUAL',
    symbol: 'RITUAL',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.ritualfoundation.org'],
  blockExplorerUrls: ['https://explorer.ritualfoundation.org'],
}

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
  isOKExWallet?: boolean
  isPhantom?: boolean
  providers?: InjectedProvider[]
}

export type WalletProviderId = 'metamask' | 'phantom' | 'okx'

export const WALLET_PROVIDER_LABELS: Record<WalletProviderId, string> = {
  metamask: 'MetaMask',
  phantom: 'Phantom',
  okx: 'OKX Wallet',
}

const SELECTED_WALLET_STORAGE_KEY = 'ritualpaws-wallet'

type WalletWindow = Window & {
  ethereum?: InjectedProvider
  okxwallet?: InjectedProvider
  phantom?: {
    ethereum?: InjectedProvider
  }
}

function dedupeProviders(providers: Array<InjectedProvider | undefined | null>) {
  return providers.filter((provider, index, list): provider is InjectedProvider =>
    Boolean(provider) && list.indexOf(provider) === index
  )
}

function getEthereumProviders(anyWindow: WalletWindow) {
  const ethereum = anyWindow.ethereum
  const providers = Array.isArray(ethereum?.providers) ? ethereum.providers : []

  return dedupeProviders([...providers, ethereum])
}

export function getWalletProvider(walletId: WalletProviderId): InjectedProvider | null {
  if (typeof window === 'undefined') return null

  const anyWindow = window as WalletWindow
  const providers = getEthereumProviders(anyWindow)

  if (walletId === 'phantom') {
    return (
      anyWindow.phantom?.ethereum ||
      providers.find((provider) => provider.isPhantom) ||
      null
    )
  }

  if (walletId === 'okx') {
    return (
      anyWindow.okxwallet ||
      providers.find((provider) => provider.isOkxWallet || provider.isOKExWallet) ||
      null
    )
  }

  return (
    providers.find(
      (provider) =>
        provider.isMetaMask &&
        !provider.isPhantom &&
        !provider.isOkxWallet &&
        !provider.isOKExWallet
    ) ||
    providers.find((provider) => provider.isMetaMask) ||
    null
  )
}

export function getWalletProviderAvailability() {
  const walletIds: WalletProviderId[] = ['metamask', 'phantom', 'okx']

  return walletIds.map((id) => ({
    id,
    label: WALLET_PROVIDER_LABELS[id],
    installed: Boolean(getWalletProvider(id)),
  }))
}

export function setSelectedWalletProvider(walletId: WalletProviderId) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SELECTED_WALLET_STORAGE_KEY, walletId)
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

export type PetActionType = 'feed' | 'play' | 'sleep' | 'clean'

type RawPet = {
  name: string
  color: string
  totalExp?: bigint
  hunger?: number
  happiness?: number
  energy?: number
  cleanliness?: number
  adoptedAt?: bigint
  updatedAt?: bigint
  adopted?: boolean
}

export function getSelectedInjectedProvider(): InjectedProvider {
  if (typeof window === 'undefined') {
    throw new Error('Wallet is only available in the browser.')
  }

  const anyWindow = window as WalletWindow
  const selectedWallet = window.localStorage.getItem(
    SELECTED_WALLET_STORAGE_KEY
  ) as WalletProviderId | null

  if (selectedWallet) {
    const selectedProvider = getWalletProvider(selectedWallet)
    if (selectedProvider) return selectedProvider
  }

  const provider =
    getWalletProvider('metamask') ||
    getWalletProvider('phantom') ||
    getWalletProvider('okx')

  if (!provider) {
    throw new Error('No wallet provider found. Please install MetaMask, Phantom, or OKX Wallet first.')
  }

  return provider
}

export async function ensureRitualChain(injectedProvider?: InjectedProvider) {
  const provider = injectedProvider || getSelectedInjectedProvider()

  const currentChainId = await provider.request({
    method: 'eth_chainId',
  })

  if (String(currentChainId).toLowerCase() === RITUAL_CHAIN_ID_HEX) {
    return
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: RITUAL_CHAIN_ID_HEX }],
    })
  } catch (switchError: any) {
    if (switchError?.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [RITUAL_CHAIN_PARAMS],
      })

      return
    }

    throw switchError
  }
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

  await ensureRitualChain(injectedProvider)

  let accounts = await injectedProvider.request({
    method: 'eth_accounts',
  })

  if (forceWalletSelection || !Array.isArray(accounts) || accounts.length === 0) {
    accounts = await injectedProvider.request({
      method: 'eth_requestAccounts',
    })
  }

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

const PET_ACTION_CALL_DATA: Record<PetActionType, string> = {
  feed: '0x37a7b7d8',
  play: '0x93e84cd9',
  sleep: '0x0958764e',
  clean: '0xfc4333cd',
}

export async function runPetActionRaw(action: PetActionType) {
  if (!RITUAL_TOM_ADDRESS) {
    throw new Error('Missing NEXT_PUBLIC_RITUALTOM_ADDRESS in environment variables.')
  }

  const { injectedProvider, provider, address } = await getProviderAndSigner()
  const txHash = await injectedProvider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: address,
        to: RITUAL_TOM_ADDRESS,
        data: PET_ACTION_CALL_DATA[action],
        value: ACTION_PRICE_HEX,
        gas: CARE_ACTION_GAS_HEX,
      },
    ],
  })

  const receipt = await provider.waitForTransaction(txHash)

  if (!receipt || receipt.status !== 1) {
    throw new Error('Transaction failed on-chain.')
  }

  return {
    address,
    txHash,
  }
}

function normalizePet(
  rawPet: RawPet,
  level?: bigint,
  expInLevel?: bigint,
  expToNextLevel?: bigint
): RitualTomPet {
  const hunger = Number(rawPet.hunger ?? 0)
  const happiness = Number(rawPet.happiness ?? 0)
  const energy = Number(rawPet.energy ?? 0)
  const cleanliness = Number(rawPet.cleanliness ?? 0)

  return {
    name: rawPet.name,
    color: rawPet.color,
    totalExp: Number(rawPet.totalExp ?? BigInt(0)),

    hunger,
    happiness,
    energy,
    cleanliness,

    food: hunger,
    play: happiness,
    sleep: energy,
    clean: cleanliness,

    adoptedAt: Number(rawPet.adoptedAt ?? BigInt(0)),
    updatedAt: Number(rawPet.updatedAt ?? BigInt(0)),
    adopted: Boolean(rawPet.adopted),

    level: Number(level ?? BigInt(1)),
    expInLevel: Number(expInLevel ?? BigInt(0)),
    expToNextLevel: Number(expToNextLevel ?? BigInt(100)),
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
