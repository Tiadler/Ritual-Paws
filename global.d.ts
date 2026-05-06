declare module '*.css'
declare module '*.scss'
declare module '*.sass'
declare module '*.less'
declare module '*.styl'

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>
    on?: (event: string, callback: (...args: any[]) => void) => void
    removeListener?: (event: string, callback: (...args: any[]) => void) => void
  }
}
