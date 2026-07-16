import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatNaira } from '../mockData'
import {
  ContributionRequest,
  Receipt,
  AuthMethod,
  SKIP_THRESHOLD,
  MAX_PIN_ATTEMPTS,
} from './types'
import {
  CloseIcon,
  ChevronLeftIcon,
  FingerprintIcon,
  FaceScanIcon,
  CheckIcon,
  BackspaceIcon,
  ShieldCheckIcon,
} from '../components/icons'

interface Props {
  request: ContributionRequest
  quickPay: boolean
  onToggleQuickPay: (v: boolean) => void
  onConfirmed: (r: Receipt) => void
  onCancelled: () => void
}

const DEMO_PIN = '1470'

type Step = 'review' | 'auth' | 'success'

export default function ConfirmContribution({
  request,
  quickPay,
  onToggleQuickPay,
  onConfirmed,
  onCancelled,
}: Props) {
  const forceConfirm = request.amount > SKIP_THRESHOLD
  const useSkip = quickPay && !forceConfirm

  const [step, setStep] = useState<Step>('review')
  const [authMethod, setAuthMethod] = useState<AuthMethod>('pin')
  const [pin, setPin] = useState<string[]>([])
  const [verifying, setVerifying] = useState(false)
  const [pinAttempts, setPinAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [fingerScan, setFingerScan] = useState(false)
  const [fingerDone, setFingerDone] = useState(false)
  const [faceScan, setFaceScan] = useState(false)
  const [faceDone, setFaceDone] = useState(false)
  const [skipDraft, setSkipDraft] = useState(false)
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => {
    return () => timers.current.forEach(clearTimeout)
  }, [])

  const fee = request.fee ?? 0

  const finalize = (method: string) => {
    if (skipDraft && !useSkip) onToggleQuickPay(true)
    const r: Receipt = {
      id: 'XN-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      amount: request.amount,
      purpose: request.purpose,
      destination: request.destination,
      fee,
      method,
      timestamp: new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }),
    }
    setReceipt(r)
    setStep('success')
  }

  const confirmPayment = () => {
    if (useSkip) finalize('Skipped, saved preference')
    else {
      setPin([])
      setStep('auth')
    }
  }

  // ---- PIN ----
  const pressDigit = (d: string) => {
    if (verifying || locked || pin.length >= 4) return
    const next = [...pin, d]
    setPin(next)
    if (next.length === 4) {
      setVerifying(true)
      const t = setTimeout(() => {
        setVerifying(false)
        if (next.join('') === DEMO_PIN) {
          finalize('4-digit PIN')
        } else {
          setPin([])
          const attempts = pinAttempts + 1
          setPinAttempts(attempts)
          if (attempts >= MAX_PIN_ATTEMPTS) setLocked(true)
        }
      }, 650)
      timers.current.push(t)
    }
  }
  const backspace = () => {
    if (verifying || locked) return
    setPin((p) => p.slice(0, -1))
  }

  // ---- Biometrics ----
  const runFinger = () => {
    if (fingerScan || fingerDone) return
    setFingerScan(true)
    const t = setTimeout(() => {
      setFingerScan(false)
      setFingerDone(true)
      const t2 = setTimeout(() => {
        setFingerDone(false)
        finalize('Fingerprint')
      }, 450)
      timers.current.push(t2)
    }, 1050)
    timers.current.push(t)
  }
  const runFace = () => {
    if (faceScan || faceDone) return
    setFaceScan(true)
    const t = setTimeout(() => {
      setFaceScan(false)
      setFaceDone(true)
      const t2 = setTimeout(() => {
        setFaceDone(false)
        finalize('Face ID')
      }, 450)
      timers.current.push(t2)
    }, 1250)
    timers.current.push(t)
  }

  const today = new Date().toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/40" onClick={onCancelled} />
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="relative w-full max-w-md bg-card rounded-t-card sm:rounded-card shadow-soft max-h-[90vh] overflow-y-auto"
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          {step === 'auth' ? (
            <button onClick={() => setStep('review')} aria-label="Back" className="text-ink/55 hover:text-ink">
              <ChevronLeftIcon size={20} />
            </button>
          ) : (
            <span className="text-xs uppercase tracking-wide text-ink/45">
              {step === 'review' ? 'Review' : 'Receipt'}
            </span>
          )}
          <button onClick={onCancelled} aria-label="Close" className="text-ink/55 hover:text-ink">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="px-5 pb-6">
          <AnimatePresence mode="wait">
            {/* ---------------- REVIEW ---------------- */}
            {step === 'review' && (
              <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="relative rounded-card bg-sand border border-warmgray overflow-hidden">
                  <div className="px-5 pt-6 pb-4 text-center border-b border-dashed border-warmgray">
                    <p className="text-xs uppercase tracking-widest text-ink/55">You are sending</p>
                    <p className="num-lg text-ink mt-2">{formatNaira(request.amount)}</p>
                  </div>
                  <div className="px-5 py-4 text-sm space-y-2.5">
                    <Row label="Purpose" value={request.purpose} />
                    {request.destination && <Row label="Destination" value={request.destination} />}
                    <Row label="Fee" value={formatNaira(fee)} />
                    <Row label="Date" value={today} />
                    {request.balanceAfter !== undefined && (
                      <Row label="Balance after" value={formatNaira(Math.max(0, request.balanceAfter))} />
                    )}
                  </div>
                </div>

                <div className="mt-4 px-1 text-xs text-ink/60">
                  {useSkip ? (
                    <span>
                      Quick-pay is on, this confirms instantly without a PIN or biometrics.{' '}
                      <button
                        onClick={() => onToggleQuickPay(false)}
                        className="underline text-terracotta font-medium"
                      >
                        Require confirmation again
                      </button>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheckIcon size={13} className="text-olive" />
                      You will confirm with your PIN, fingerprint, or Face ID next.
                    </span>
                  )}
                  {forceConfirm && (
                    <p className="text-brick mt-1">
                      This amount is large, so confirmation is still required.
                    </p>
                  )}
                </div>

                <button
                  onClick={confirmPayment}
                  className="w-full mt-4 py-3 rounded-btn font-semibold text-sm bg-terracotta text-card hover:bg-terracotta-dark"
                >
                  {useSkip ? 'Pay instantly' : 'Confirm & pay'}
                </button>
              </motion.div>
            )}

            {/* ---------------- AUTH ---------------- */}
            {step === 'auth' && (
              <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-lg font-semibold text-ink text-center">Confirm it is you</p>
                <p className="text-sm text-ink/60 text-center mt-1">
                  Securing {formatNaira(request.amount)} to {request.purpose}
                </p>

                <div className="flex mt-5 rounded-btn p-1 bg-sand border border-warmgray">
                  {(['pin', 'fingerprint', 'face'] as AuthMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setAuthMethod(m)}
                      className={`flex-1 py-2 rounded-btn text-xs font-medium capitalize transition-colors ${
                        authMethod === m ? 'bg-terracotta text-card' : 'text-ink/60'
                      }`}
                    >
                      {m === 'face' ? 'Face ID' : m}
                    </button>
                  ))}
                </div>

                {authMethod === 'pin' && (
                  <div className="mt-8 flex flex-col items-center">
                    {locked ? (
                      <div className="text-center">
                        <p className="text-sm font-medium text-brick">Temporary lockout</p>
                        <p className="text-xs text-ink/55 mt-1">
                          Too many wrong attempts. Use account recovery to continue.
                        </p>
                        <button
                          onClick={() => {
                            setLocked(false)
                            setPinAttempts(0)
                            setPin([])
                          }}
                          className="mt-3 py-2 px-4 rounded-btn bg-olive text-card text-sm font-medium"
                        >
                          Use account recovery
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-3 mb-6">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-3.5 w-3.5 rounded-full border-2"
                              style={{
                                background: pin.length > i ? '#C1552C' : 'transparent',
                                borderColor: pin.length > i ? '#C1552C' : '#E4DCCB',
                              }}
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k, idx) =>
                            k === '' ? (
                              <div key={idx} />
                            ) : (
                              <button
                                key={idx}
                                onClick={() => (k === 'del' ? backspace() : pressDigit(k))}
                                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-medium bg-sand border border-warmgray text-ink"
                              >
                                {k === 'del' ? <BackspaceIcon size={18} /> : k}
                              </button>
                            ),
                          )}
                        </div>
                        <p className="text-[11px] text-ink/40 mt-4">Demo PIN: {DEMO_PIN}</p>
                        {pinAttempts > 0 && !verifying && (
                          <p className="text-xs text-brick mt-1">
                            {MAX_PIN_ATTEMPTS - pinAttempts} attempt{MAX_PIN_ATTEMPTS - pinAttempts === 1 ? '' : 's'} left
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {authMethod === 'fingerprint' && (
                  <div className="mt-10 flex flex-col items-center">
                    <button
                      onClick={runFinger}
                      className={`w-28 h-28 rounded-full flex items-center justify-center ${fingerScan ? 'animate-pulse' : ''}`}
                      style={{ background: '#FFFDF8', border: `2px solid ${fingerDone ? '#3F4B2B' : '#C1552C'}` }}
                    >
                      {fingerDone ? (
                        <CheckIcon size={40} className="text-olive" />
                      ) : (
                        <FingerprintIcon size={44} className={fingerScan ? 'text-terracotta' : 'text-ink/60'} />
                      )}
                    </button>
                    <p className="text-sm mt-5 text-ink/60">
                      {fingerDone ? 'Verified' : fingerScan ? 'Scanning' : 'Tap to scan fingerprint'}
                    </p>
                    <button onClick={() => setAuthMethod('pin')} className="text-xs text-terracotta underline mt-3">
                      Use PIN instead
                    </button>
                  </div>
                )}

                {authMethod === 'face' && (
                  <div className="mt-10 flex flex-col items-center">
                    <button
                      onClick={runFace}
                      className="relative w-32 h-32 rounded-card flex items-center justify-center"
                      style={{ background: '#FFFDF8', border: `2px solid ${faceDone ? '#3F4B2B' : '#C1552C'}` }}
                    >
                      {faceDone ? (
                        <CheckIcon size={40} className="text-olive" />
                      ) : (
                        <FaceScanIcon size={44} className={faceScan ? 'text-terracotta' : 'text-ink/60'} />
                      )}
                      {faceScan && (
                        <div
                          className="absolute left-3 right-3 h-0.5"
                          style={{ top: '30%', background: '#C1552C', boxShadow: '0 0 8px #C1552C' }}
                        />
                      )}
                    </button>
                    <p className="text-sm mt-5 text-ink/60">
                      {faceDone ? 'Verified' : faceScan ? 'Scanning' : 'Tap to scan your face'}
                    </p>
                    <button onClick={() => setAuthMethod('pin')} className="text-xs text-terracotta underline mt-3">
                      Use PIN instead
                    </button>
                  </div>
                )}

                <label className="flex items-center gap-2 mt-8 text-xs justify-center text-ink/60">
                  <input
                    type="checkbox"
                    checked={skipDraft}
                    onChange={(e) => setSkipDraft(e.target.checked)}
                  />
                  Skip confirmation for future contributions
                </label>
              </motion.div>
            )}

            {/* ---------------- SUCCESS / RECEIPT ---------------- */}
            {step === 'success' && receipt && (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full flex items-center justify-center mt-2" style={{ background: 'rgba(63,75,43,0.15)' }}>
                  <CheckIcon size={30} className="text-olive" />
                </div>
                <p className="text-lg font-semibold mt-4 text-ink">Payment confirmed</p>
                <p className="text-sm mt-1 text-ink/60">via {receipt.method}</p>

                <div className="relative w-full rounded-card mt-6 bg-sand border border-warmgray overflow-hidden">
                  <div className="px-5 pt-6 pb-4 text-center border-b border-dashed border-warmgray">
                    <p className="num-lg text-ink">{formatNaira(receipt.amount)}</p>
                    <p className="text-xs mt-1 text-ink/55">{receipt.purpose}</p>
                  </div>
                  <div className="px-5 py-4 text-sm space-y-2.5">
                    <Row label="Receipt ID" value={receipt.id} mono />
                    <Row label="Destination" value={receipt.destination ?? '—'} />
                    <Row label="Date" value={receipt.timestamp} />
                    <Row label="Method" value={receipt.method} />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 w-full">
                  <button
                    onClick={() => {
                      const text = `Xena receipt ${receipt.id}: ${formatNaira(receipt.amount)} to ${receipt.purpose} via ${receipt.method} on ${receipt.timestamp}`
                      if (navigator.share) navigator.share({ text }).catch(() => {})
                      else navigator.clipboard?.writeText(text).catch(() => {})
                    }}
                    className="flex-1 py-2.5 rounded-btn text-sm font-medium bg-sand border border-warmgray text-ink"
                  >
                    Share / copy
                  </button>
                  <button
                    onClick={() => onConfirmed(receipt)}
                    className="flex-1 py-2.5 rounded-btn text-sm font-semibold bg-terracotta text-card hover:bg-terracotta-dark"
                  >
                    Done
                  </button>
                </div>
                <p className="text-[11px] text-ink/45 mt-3 text-center">Saved to your transaction history.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink/55 shrink-0">{label}</span>
      <span className={`text-ink text-right ${mono ? 'num' : ''}`}>{value}</span>
    </div>
  )
}
