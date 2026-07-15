import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import { LoadingState } from '../components/states'
import { streets, lookupBVN, partnerBanks, LinkedAccount, User } from '../mockData'
import { useApp } from '../context/AppContext'

const MILESTONES = ['BVN', 'Bank', 'Verify', 'Home']

function CheckBadge({ size = 18 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#D9A441"
      strokeWidth="3"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.35 }}
    >
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}

function Journey({ step }: { step: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {MILESTONES.map((label, i) => {
          const done = i < step
          const active = i === step
          return (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                <div
                  className={`h-1 flex-1 rounded-full ${i === 0 ? 'opacity-0' : ''} ${
                    i <= step ? 'bg-gold' : 'bg-warmgray'
                  }`}
                />
                <motion.div
                  className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center border-2 ${
                    done
                      ? 'bg-gold/15 border-gold'
                      : active
                        ? 'bg-terracotta/10 border-terracotta'
                        : 'bg-card border-warmgray'
                  }`}
                  animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                  transition={{ duration: 1.2, repeat: active ? Infinity : 0 }}
                >
                  {done ? (
                    <CheckBadge />
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        active ? 'text-terracotta' : 'text-ink/40'
                      }`}
                    >
                      {i + 1}
                    </span>
                  )}
                </motion.div>
                <div
                  className={`h-1 flex-1 rounded-full ${i === MILESTONES.length - 1 ? 'opacity-0' : ''} ${
                    i < step ? 'bg-gold' : 'bg-warmgray'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-1.5 ${done || active ? 'text-ink/70' : 'text-ink/35'}`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(6, ' ').slice(0, 6).split('')

  const setDigit = (i: number, d: string) => {
    const arr = value.split('')
    arr[i] = d
    const next = arr.join('').slice(0, 6)
    onChange(next)
    if (d && i < 5) refs.current[i + 1]?.focus()
  }

  return (
    <div className="flex gap-2 justify-between">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === ' ' ? '' : digits[i]}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, '').slice(-1)
            setDigit(i, d)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus()
          }}
          onPaste={(e) => {
            e.preventDefault()
            const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
            if (text) {
              onChange(text)
              refs.current[Math.min(5, text.length)]?.focus()
            }
          }}
          className="w-full h-14 text-center num text-2xl rounded-btn border-2 border-warmgray bg-card focus:border-terracotta focus:outline-none"
        />
      ))}
    </div>
  )
}

export default function SignupFlow() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [step, setStep] = useState(0)

  // Step 1 — BVN
  const [bvn, setBvn] = useState('')
  const [looking, setLooking] = useState(false)
  const [lookup, setLookup] = useState<ReturnType<typeof lookupBVN> | null>(null)

  // Step 2 — bank
  const [selected, setSelected] = useState<LinkedAccount | null>(null)

  // Step 3 — OTP
  const [otp, setOtp] = useState('')

  // Step 4 — street
  const [mode, setMode] = useState<'choose' | 'locate' | 'type'>('choose')
  const [locating, setLocating] = useState(false)
  const [suggested, setSuggested] = useState<{ id: string; name: string; city: string } | null>(null)
  const [query, setQuery] = useState('')
  const [streetId, setStreetId] = useState('st-abak')
  const [, setCustomName] = useState('')

  const [finalizing, setFinalizing] = useState(false)
  const [done, setDone] = useState(false)

  const bvnDigits = bvn.replace(/\D/g, '')
  const bvnOk = bvnDigits.length === 11
  const otpOk = otp.replace(/\D/g, '').length === 6

  // auto-advance OTP when complete
  useEffect(() => {
    if (step === 2 && otpOk) {
      const t = setTimeout(() => setStep(3), 450)
      return () => clearTimeout(t)
    }
  }, [otpOk, step])

  const runLookup = () => {
    if (!bvnOk) return
    setLooking(true)
    setTimeout(() => {
      setLookup(lookupBVN(bvnDigits))
      setLooking(false)
      setStep(1)
    }, 900)
  }

  const detectLocation = () => {
    setMode('locate')
    setLocating(true)
    const finish = (id: string) => {
      const s = streets.find((x) => x.id === id)!
      setSuggested({ id: s.id, name: s.name, city: s.city })
      setStreetId(s.id)
      setLocating(false)
    }
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => finish('st-abak'),
        () => finish('st-abak'),
        { timeout: 4000 },
      )
    } else {
      setTimeout(() => finish('st-abak'), 900)
    }
  }

  const filtered = streets.filter((s) =>
    (s.name + ' ' + s.city + ' ' + s.lga).toLowerCase().includes(query.toLowerCase().trim()),
  )
  const matchFound = filtered.some((s) => s.name.toLowerCase() === query.trim().toLowerCase())

  const finish = () => {
    setFinalizing(true)
    setTimeout(() => {
      const firstName = (selected?.accountName ?? 'Neighbour').split(' ')[0]
      const newUser: User = {
        id: 'u-' + bvnDigits.slice(-6),
        name: selected?.accountName ?? firstName,
        firstName,
        phone: lookup?.phone ?? '+234 803 555 0142',
        streetId,
        bankConnected: true,
        bankName: selected?.bank ?? partnerBanks[0],
        accountName: selected?.accountName ?? firstName,
      }
      login(newUser)
      setFinalizing(false)
      setDone(true)
    }, 1100)
  }

  const progressPct = (step / (MILESTONES.length - 1)) * 100

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <div className="px-4 sm:px-6 pt-5 flex items-center justify-between max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-card bg-terracotta flex items-center justify-center">
            <span className="font-serif text-card text-lg font-semibold">X</span>
          </div>
          <span className="font-serif text-xl font-semibold text-ink">Xena</span>
        </div>
        <span className="text-xs text-ink/45">Step {Math.min(step + 1, 4)} of 4</span>
      </div>

      {/* Gamified journey bar */}
      <div className="px-4 sm:px-6 pt-5 max-w-md mx-auto w-full">
        <Journey step={step} />
        <div className="mt-3 h-1.5 w-full bg-warmgray rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-terracotta to-gold rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 py-7 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {/* STEP 1 — BVN */}
            {step === 0 && (
              <div>
                <span className="inline-block text-xs font-medium uppercase tracking-wider text-terracotta">
                  Start in seconds
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl text-ink mt-1">
                  Your BVN is all we need.
                </h1>
                <p className="text-ink/65 mt-2 text-sm">
                  One number unlocks your banks — no passwords, no typing account details.
                </p>

                <div className="mt-6">
                  <Input
                    id="bvn"
                    label="Bank Verification Number"
                    type="otp"
                    placeholder="11 digits"
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value)}
                    maxLength={11}
                    trailing={
                      bvnOk ? (
                        <span className="text-gold">
                          <CheckBadge />
                        </span>
                      ) : (
                        <span className="text-ink/30 text-sm">{bvnDigits.length}/11</span>
                      )
                    }
                  />
                </div>

                <Button
                  className="mt-6"
                  fullWidth
                  size="lg"
                  disabled={!bvnOk || looking}
                  onClick={runLookup}
                >
                  {looking ? 'Finding your banks…' : 'Find my accounts'}
                </Button>

                <div className="mt-4 flex items-center gap-2 bg-olive/5 border border-olive/20 rounded-btn px-3 py-2.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3F4B2B" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="text-xs text-olive font-medium">
                    Your BVN is read-only and never stored as your login
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2 — linked accounts */}
            {step === 1 && lookup && (
              <div>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-2 bg-gold/15 text-[#8a6516] text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  <CheckBadge size={14} /> Found {lookup.accounts.length} accounts on this BVN
                </motion.div>
                <h1 className="font-serif text-2xl sm:text-3xl text-ink mt-3">
                  Pick the account to link.
                </h1>
                <p className="text-ink/65 mt-1 text-sm">
                  These are pulled from your BVN via Open Banking. Choose one — you can add more later.
                </p>

                <div className="mt-5 space-y-2.5">
                  {lookup.accounts.map((acc) => {
                    const on = selected?.accountNumber === acc.accountNumber
                    return (
                      <button
                        key={acc.accountNumber}
                        onClick={() => setSelected(acc)}
                        className={`w-full text-left rounded-card border p-4 transition-all ${
                          on
                            ? 'border-terracotta bg-terracotta/5 shadow-soft'
                            : 'border-warmgray bg-card hover:border-terracotta/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-ink">{acc.bank}</p>
                            <p className="text-sm text-ink/60 num">{acc.accountNumber}</p>
                            <p className="text-xs text-ink/50">{acc.accountName}</p>
                          </div>
                          <span
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                              on ? 'border-terracotta bg-terracotta' : 'border-warmgray'
                            }`}
                          >
                            {on && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFDF8" strokeWidth="3">
                                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <p className="label-text mt-5 mb-2">Works with</p>
                <div className="flex flex-wrap gap-1.5">
                  {partnerBanks.map((b) => (
                    <span key={b} className="text-[11px] bg-warmgray/60 text-ink/60 rounded-full px-2.5 py-1">
                      {b}
                    </span>
                  ))}
                </div>

                <Card className="mt-5 bg-sand">
                  <div className="flex items-center justify-between">
                    <span className="label-text">We WILL access</span>
                    <span className="text-xs text-olive font-medium">Read-only</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-ink/75">
                    <li>• Account name &amp; number</li>
                    <li>• Available balance (to time sweeps)</li>
                  </ul>
                  <div className="border-t border-warmgray my-2.5" />
                  <span className="label-text">We will NEVER</span>
                  <ul className="mt-2 space-y-1 text-xs text-ink/75">
                    <li>• See or store your bank password</li>
                    <li>• Move money without your approval</li>
                  </ul>
                  <div className="mt-3 flex items-center gap-2 bg-olive/5 border border-olive/20 rounded-btn px-3 py-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3F4B2B" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="10" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="text-[11px] text-olive font-medium">Powered by Open Banking</span>
                  </div>
                </Card>

                <div className="flex gap-2 mt-5">
                  <Button variant="ghost" size="lg" onClick={() => setStep(0)}>
                    Back
                  </Button>
                  <Button size="lg" fullWidth disabled={!selected} onClick={() => setStep(2)}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3 — OTP */}
            {step === 2 && lookup && (
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-ink">One quick check.</h1>
                <p className="text-ink/65 mt-2 text-sm">
                  We sent a 6-digit code to{' '}
                  <span className="num text-ink">{lookup.phone}</span> — the number on your BVN. Any
                  6 digits work for this demo.
                </p>

                <div className="mt-7">
                  <OtpInput value={otp} onChange={setOtp} />
                </div>

                <Button
                  className="mt-7"
                  fullWidth
                  size="lg"
                  disabled={!otpOk}
                  onClick={() => setStep(3)}
                >
                  Verify &amp; continue
                </Button>

                <button
                  className="mt-3 w-full text-sm text-ink/55 hover:text-terracotta"
                  onClick={() => setOtp('')}
                >
                  Use a different number
                </button>
              </div>
            )}

            {/* STEP 4 — street */}
            {step === 3 && (
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-ink">Where’s home?</h1>
                <p className="text-ink/65 mt-2 text-sm">
                  We’ll drop you into your street’s Community Wallet.
                </p>

                {mode === 'choose' && (
                  <div className="mt-6 grid grid-cols-1 gap-3">
                    <button
                      onClick={detectLocation}
                      className="card-base p-5 text-left hover:border-terracotta/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" strokeLinejoin="round" />
                            <circle cx="12" cy="10" r="2.5" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-ink">Use my location</p>
                          <p className="text-xs text-ink/55">Detect my street automatically</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setMode('type')}
                      className="card-base p-5 text-left hover:border-terracotta/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-olive/10 text-olive flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-ink">Type my street</p>
                          <p className="text-xs text-ink/55">Search Uyo, Lagos or Abuja</p>
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {mode === 'locate' && (
                  <div className="mt-6">
                    {locating ? (
                      <LoadingState label="Finding your street…" />
                    ) : (
                      suggested && (
                        <Card>
                          <p className="label-text">We think you’re near</p>
                          <p className="font-serif text-xl text-ink mt-1">{suggested.name}</p>
                          <p className="text-sm text-ink/55">{suggested.city}</p>
                          <div className="flex gap-2 mt-4">
                            <Button variant="secondary" size="sm" onClick={() => { setMode('choose'); setSuggested(null) }}>
                              Not me
                            </Button>
                            <Button size="sm" fullWidth onClick={finish}>
                              That’s home
                            </Button>
                          </div>
                        </Card>
                      )
                    )}
                  </div>
                )}

                {mode === 'type' && (
                  <div className="mt-6 space-y-3">
                    <Input
                      id="street"
                      label="Search your street"
                      type="text"
                      placeholder="e.g. Abak Road"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      trailing={
                        query ? (
                          <button onClick={() => setQuery('')} className="text-ink/40 text-sm">
                            Clear
                          </button>
                        ) : null
                      }
                    />
                    <div className="space-y-2 max-h-72 overflow-auto">
                      {filtered.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => { setStreetId(s.id); setCustomName(''); finish() }}
                          className="w-full text-left rounded-btn border border-warmgray bg-card px-4 py-3 hover:border-terracotta/40"
                        >
                          <span className="font-medium text-ink">{s.name}</span>
                          <span className="text-ink/45 text-sm"> · {s.city}</span>
                        </button>
                      ))}
                      {query.trim() && !matchFound && (
                        <button
                          onClick={() => {
                            setStreetId('st-abak')
                            setCustomName(query.trim())
                            finish()
                          }}
                          className="w-full text-left rounded-btn border border-dashed border-terracotta/50 bg-terracotta/5 px-4 py-3"
                        >
                          <span className="font-medium text-terracotta">Add “{query.trim()}”</span>
                          <span className="text-ink/55 text-sm"> · we’ll set up its wallet</span>
                        </button>
                      )}
                      {!query && (
                        <p className="text-xs text-ink/45 px-1">Start typing to find your street.</p>
                      )}
                    </div>
                    <button className="text-sm text-ink/55 hover:text-terracotta" onClick={() => setMode('choose')}>
                      ← Back to options
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* SUCCESS */}
      <AnimatePresence>
        {done && (
          <motion.div
            className="fixed inset-0 z-50 bg-sand flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="text-center max-w-sm w-full"
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            >
              <motion.div
                className="h-20 w-20 mx-auto rounded-full bg-gold/20 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
              >
                <CheckBadge size={42} />
              </motion.div>
              <h1 className="font-serif text-3xl text-ink mt-5">You’re in, {selected?.accountName.split(' ')[0]}!</h1>
              <p className="text-ink/65 mt-2">
                Your {selected?.bank} account is linked and your street wallet is ready. Time to watch
                the work get done.
              </p>
              <Button className="mt-6" size="lg" fullWidth onClick={() => navigate('/app')}>
                Enter my community
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {finalizing && (
        <div className="fixed inset-0 z-40 bg-ink/30 flex items-center justify-center">
          <Card className="bg-card">Setting up your wallet…</Card>
        </div>
      )}
    </div>
  )
}
