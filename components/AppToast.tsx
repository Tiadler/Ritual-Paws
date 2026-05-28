'use client'

import { AnimatePresence, motion } from 'framer-motion'

export type ToastTone = 'success' | 'error' | 'info'

export type AppToastMessage = {
  id: number
  title: string
  message?: string
  tone?: ToastTone
}

interface AppToastProps {
  toast: AppToastMessage | null
  onClose: () => void
}

const toneClassNames: Record<ToastTone, string> = {
  success: 'border-[#40FFAF]/28 bg-[#07130E]/94 text-[#40FFAF]',
  error: 'border-[#FF5757]/28 bg-[#160B0D]/94 text-[#FF9090]',
  info: 'border-[#00C2FF]/28 bg-[#071018]/94 text-[#8FE6FF]',
}

export function AppToast({ toast, onClose }: AppToastProps) {
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="fixed right-4 top-4 z-[220] w-[min(calc(100vw-2rem),420px)]"
        >
          <div
            className={`rounded-[16px] border px-4 py-3 shadow-[0_24px_70px_-34px_rgba(0,0,0,0.8)] backdrop-blur-md ${
              toneClassNames[toast.tone || 'info']
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-bold uppercase tracking-[0.12em] text-white">
                  {toast.title}
                </div>
                {toast.message ? (
                  <div className="mt-1 text-sm leading-5 text-white/68">
                    {toast.message}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-[10px] border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-semibold text-white/58 transition hover:bg-white/[0.08] hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
