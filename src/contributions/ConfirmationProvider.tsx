import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from 'react'
import ConfirmContribution from './ConfirmContribution'
import { ContributionRequest, Receipt } from './types'

interface ContributionContextValue {
  requestContribution: (req: ContributionRequest) => Promise<Receipt>
}

const Ctx = createContext<ContributionContextValue | null>(null)

export function useContribution(): ContributionContextValue {
  const c = useContext(Ctx)
  if (!c) throw new Error('useContribution must be used within ConfirmationProvider')
  return c
}

const QUICKPAY_KEY = 'xena.quickpay'

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ContributionRequest | null>(null)
  const [quickPay, setQuickPay] = useState<boolean>(() => {
    try {
      return localStorage.getItem(QUICKPAY_KEY) === '1'
    } catch {
      return false
    }
  })
  const resolveRef = useRef<((r: Receipt) => void) | null>(null)
  const rejectRef = useRef<((e: Error) => void) | null>(null)

  const requestContribution = useCallback((req: ContributionRequest) => {
    return new Promise<Receipt>((resolve, reject) => {
      resolveRef.current = resolve
      rejectRef.current = reject
      setActive(req)
    })
  }, [])

  const handleConfirmed = useCallback((receipt: Receipt) => {
    resolveRef.current?.(receipt)
    resolveRef.current = null
    rejectRef.current = null
    setActive(null)
  }, [])

  const handleCancelled = useCallback(() => {
    rejectRef.current?.(new Error('cancelled'))
    resolveRef.current = null
    rejectRef.current = null
    setActive(null)
  }, [])

  const setQuickPayPersist = useCallback((v: boolean) => {
    setQuickPay(v)
    try {
      localStorage.setItem(QUICKPAY_KEY, v ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <Ctx.Provider value={{ requestContribution }}>
      {children}
      {active && (
        <ConfirmContribution
          request={active}
          quickPay={quickPay}
          onToggleQuickPay={setQuickPayPersist}
          onConfirmed={handleConfirmed}
          onCancelled={handleCancelled}
        />
      )}
    </Ctx.Provider>
  )
}
