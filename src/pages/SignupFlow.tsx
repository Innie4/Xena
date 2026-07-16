import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import { LoadingState } from '../components/states'
import { streets, User } from '../mockData'
import { useApp } from '../context/AppContext'
import EmberBurst from '../components/EmberBurst'

const MILESTONES = ['Name', 'Verify', 'Home']

// ---------------------------------------------------------------------------
// API types
// ---------------------------------------------------------------------------

interface EstateResult {
  id: string
  name: string
  city: string
}

// ---------------------------------------------------------------------------
// Small shared components
// ---------------------------------------------------------------------------

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
                    <span className={`text-sm font-semibold ${active ? 'text-terracotta' : 'text-ink/40'}`}>
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
              <span className={`text-[10px] mt-1.5 ${done || active ? 'text-ink/70' : 'text-ink/35'}`}>
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

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 inline-block"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  )
}

/* A lightweight, dependency-free "map": a stylized street grid with a draggable
   pin. Dropping the pin picks the street nearest to its horizontal position. */
function MapPicker({
  streets,
  onPick,
  onClose,
}: {
  streets: EstateResult[]
  onPick: (s: EstateResult) => void
  onClose: () => void
}) {
  const reduce = useReducedMotion()
  const mapRef = useRef<HTMLDivElement>(null)
  const [pin, setPin] = useState({ x: 0.5, y: 0.45 })

  const nearest = (fractionX: number) => {
    const idx = Math.min(streets.length - 1, Math.max(0, Math.floor(fractionX * streets.length)))
    return streets[idx]
  }

  const place = (clientX: number, clientY: number) => {
    const el = mapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const fx = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    const fy = Math.min(1, Math.max(0, (clientY - r.top) / r.height))
    setPin({ x: fx, y: fy })
  }

  const picked = nearest(pin.x)

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        className="w-full max-w-md bg-card rounded-card overflow-hidden shadow-soft"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <h3 className="font-serif text-lg text-ink">Drop your pin</h3>
          <button onClick={onClose} aria-label="Close map" className="text-ink/45 hover:text-ink text-xl leading-none">
            ×
          </button>
        </div>
        <p className="text-xs text-ink/55 px-4 mt-1">
          Tap or drag the pin to where your house sits. We'll match it to the nearest street.
        </p>

        <div
          ref={mapRef}
          onPointerDown={(e) => place(e.clientX, e.clientY)}
          className="relative mx-4 mt-3 h-60 rounded-btn overflow-hidden cursor-crosshair select-none"
          style={{
            background:
              'linear-gradient(135deg, #efe6d4 0%, #e4dccb 100%)',
          }}
        >
          {/* stylized roads */}
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute top-[28%] left-0 right-0 h-2.5 bg-warmgray/70" />
            <div className="absolute top-[62%] left-0 right-0 h-2.5 bg-warmgray/70" />
            <div className="absolute left-[22%] top-0 bottom-0 w-2.5 bg-warmgray/70" />
            <div className="absolute left-[68%] top-0 bottom-0 w-2.5 bg-warmgray/70" />
            <div className="absolute left-[44%] top-0 bottom-0 w-1 bg-olive/30" />
          </div>

          {/* pin */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
            drag={reduce ? false : true}
            dragConstraints={mapRef}
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={(_, info) => place(info.point.x, info.point.y)}
          >
            <div className="relative">
              <svg width="30" height="40" viewBox="0 0 24 32" fill="none">
                <path d="M12 0C5.4 0 0 5.4 0 12c0 8 12 20 12 20s12-12 12-20C24 5.4 18.6 0 12 0z" fill="#C1552C" />
                <circle cx="12" cy="12" r="5" fill="#FFFDF8" />
              </svg>
            </div>
          </motion.div>
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="label-text">Nearest street</p>
            <p className="font-medium text-ink">{picked.name}</p>
            <p className="text-xs text-ink/55">{picked.city}</p>
          </div>
          <Button size="sm" onClick={() => onPick(picked)}>
            Confirm pin
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SignupFlow() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [step, setStep] = useState(0)

  // Step 0: name + phone + house address
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [houseAddress, setHouseAddress] = useState('')

  // Step 1: OTP
  const [otp, setOtp] = useState('')

  // Step 2: estate search
  const [mode, setMode] = useState<'choose' | 'locate' | 'type' | 'map'>('choose')
  const [locating, setLocating] = useState(false)
  const [suggested, setSuggested] = useState<EstateResult | null>(null)
  const [mapPicked, setMapPicked] = useState<EstateResult | null>(null)
  const [query, setQuery] = useState('')
  const [estates, setEstates] = useState<EstateResult[]>([])
  const [estatesLoading, setEstatesLoading] = useState(false)
  const [selectedEstateId, setSelectedEstateId] = useState<string>('')
  const [locateError, setLocateError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Final submit
  const [finalizing, setFinalizing] = useState(false)
  const [done, setDone] = useState(false)
  const [finishError, setFinishError] = useState<string | null>(null)

  const phoneDigits = phone.replace(/\D/g, '')
  const nameOk = fullName.trim().split(/\s+/).length >= 1 && fullName.trim().length >= 2
  const phoneOk = phoneDigits.length >= 10 && phoneDigits.length <= 11
  const otpOk = otp.replace(/\D/g, '').length === 6

  // auto-advance OTP when complete
  useEffect(() => {
    if (step === 1 && otpOk) {
      const t = setTimeout(() => setStep(2), 450)
      return () => clearTimeout(t)
    }
  }, [otpOk, step])

  const fromStreets = (): EstateResult[] =>
    streets.map((s) => ({ id: s.id, name: s.name, city: s.city }))

  // -------------------------------------------------------------------------
  // Estate search (frontend-only, simulated from mock streets)
  // -------------------------------------------------------------------------

  const loadEstates = useCallback(() => {
    setEstates(fromStreets())
    setEstatesLoading(false)
  }, [])

  useEffect(() => {
    if (mode !== 'type') return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => loadEstates(), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, mode, loadEstates])

  useEffect(() => {
    if (mode === 'type') loadEstates()
  }, [mode, loadEstates])

  // -------------------------------------------------------------------------
  // "Use my location" (mock detect, pre-fills first result)
  // -------------------------------------------------------------------------

  const detectLocation = () => {
    setMode('locate')
    setLocating(true)
    setLocateError(null)

    const first = fromStreets()[0]
    if (!first) {
      setLocateError('No streets found in the system. Please type your street name instead.')
      setLocating(false)
      return
    }

    setTimeout(() => {
      setSuggested(first)
      setSelectedEstateId(first.id)
      setLocating(false)
    }, 900)
  }

  // -------------------------------------------------------------------------
  // Final submit — create the resident locally (banks are linked later)
  // -------------------------------------------------------------------------

  const finish = (overrideEstateId?: string) => {
    const estateId = overrideEstateId ?? selectedEstateId
    if (!estateId) return

    setFinalizing(true)
    setFinishError(null)

    const formattedPhone = phoneDigits.length === 10 ? `+234 ${phoneDigits}` : `+234 ${phoneDigits.slice(-10)}`

    const newUser: User = {
      id: `u-${phoneDigits.slice(-10)}`,
      name: fullName.trim(),
      firstName: fullName.trim().split(' ')[0],
      phone: formattedPhone,
      streetId: estateId,
      address: houseAddress.trim(),
      bankConnected: false,
      bankName: '',
      accountName: '',
    }

    login(newUser)
    setFinalizing(false)
    setDone(true)
  }

  const matchFound = estates.some((s) => s.name.toLowerCase() === query.trim().toLowerCase())

  const progressPct = (step / (MILESTONES.length - 1)) * 100

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <div className="px-4 sm:px-6 pt-5 flex items-center justify-between w-full lg:max-w-md lg:mx-auto">
          <div className="flex items-center gap-2">
            <img src="/actual-xena.png" alt="Xena" className="h-9 w-9 rounded-card object-contain" />
            <span className="font-serif text-xl font-semibold text-ink">Xena</span>
          </div>
        <span className="text-xs text-ink/45">Step {Math.min(step + 1, 3)} of 3</span>
      </div>

      {/* Gamified journey bar */}
      <div className="px-4 sm:px-6 pt-5 w-full lg:max-w-md lg:mx-auto">
        <Journey step={step} />
        <div className="mt-3 h-1.5 w-full bg-warmgray rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-terracotta to-gold rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 py-7 w-full lg:max-w-md lg:mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {/* ── STEP 0: name + phone ─────────────────────────────────── */}
            {step === 0 && (
              <div>
                <span className="inline-block text-xs font-medium uppercase tracking-wider text-terracotta">
                  Light the first spark
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl text-ink mt-1">
                  Just your name and number.
                </h1>
                <p className="text-ink/65 mt-2 text-sm">
                  No bank details yet. You can link your banks later from your profile, whenever you
                  are ready.
                </p>

                <div className="mt-6 space-y-4">
                  <Input
                    id="name"
                    label="Full name"
                    type="text"
                    placeholder="e.g. Iniobong Udofia"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <Input
                    id="phone"
                    label="Phone number"
                    type="phone"
                    placeholder="0803 555 0142"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={11}
                    trailing={
                      phoneOk ? (
                        <span className="text-gold">
                          <CheckBadge />
                        </span>
                      ) : (
                        <span className="text-ink/30 text-sm">{phoneDigits.length}/11</span>
                      )
                    }
                  />
                  <Input
                    id="address"
                    label="House address"
                    type="text"
                    placeholder="e.g. 14 Abak Road, by the corner shop"
                    value={houseAddress}
                    onChange={(e) => setHouseAddress(e.target.value)}
                  />
                </div>

                <Button
                  className="mt-6"
                  fullWidth
                  size="lg"
                  disabled={!nameOk || !phoneOk}
                  onClick={() => setStep(1)}
                >
                  Continue
                </Button>

                <p className="mt-4 text-center text-xs text-ink/45">
                  Already keeping a street lit?{' '}
                  <Link to="/login" className="text-terracotta font-medium hover:underline">
                    Log in
                  </Link>
                </p>

              </div>
            )}

            {/* ── STEP 1: OTP ──────────────────────────────────────────── */}
            {step === 1 && (
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-ink">One quick check.</h1>
                <p className="text-ink/65 mt-2 text-sm">
                  We sent a 6-digit code to{' '}
                  <span className="num text-ink">{phoneDigits}</span>. Any 6 digits work for this
                  demo.
                </p>

                <div className="mt-7">
                  <OtpInput value={otp} onChange={setOtp} />
                </div>

                <Button
                  className="mt-7"
                  fullWidth
                  size="lg"
                  disabled={!otpOk}
                  onClick={() => setStep(2)}
                >
                  Verify &amp; continue
                </Button>

                <button
                  className="mt-3 w-full text-sm text-ink/55 hover:text-terracotta"
                  onClick={() => {
                    setOtp('')
                    setStep(0)
                  }}
                >
                  Use a different number
                </button>
              </div>
            )}

            {/* ── STEP 2: estate / home ────────────────────────────────── */}
            {step === 2 && (
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-ink">Where's home?</h1>
                <p className="text-ink/65 mt-2 text-sm">
                  We'll drop you into your street's Community Wallet.
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
                      onClick={() => setMode('map')}
                      className="card-base p-5 text-left hover:border-terracotta/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gold/15 text-[#8a6516] flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" strokeLinejoin="round" />
                            <path d="M9 3v15M15 6v15" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-ink">Pick on map</p>
                          <p className="text-xs text-ink/55">Drop a pin on your house</p>
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
                    ) : locateError ? (
                      <div className="space-y-3">
                        <p className="text-sm text-red-500">{locateError}</p>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => { setMode('choose'); setLocateError(null) }}>
                            Back
                          </Button>
                          <Button size="sm" fullWidth onClick={() => { setLocateError(null); setMode('type') }}>
                            Type my street
                          </Button>
                        </div>
                      </div>
                    ) : (
                      suggested && (
                        <Card>
                          <p className="label-text">We think you're near</p>
                          <p className="font-serif text-xl text-ink mt-1">{suggested.name}</p>
                          <p className="text-sm text-ink/55">{suggested.city}</p>
                          <div className="flex gap-2 mt-4">
                            <Button variant="secondary" size="sm" onClick={() => { setMode('choose'); setSuggested(null) }}>
                              Not me
                            </Button>
                            <Button
                              size="sm"
                              fullWidth
                              disabled={finalizing}
                              onClick={() => finish(suggested.id)}
                            >
                              {finalizing ? <span className="flex items-center gap-2"><Spinner /> Saving…</span> : "That's home"}
                            </Button>
                          </div>
                          {finishError && <p className="mt-3 text-sm text-red-500">{finishError}</p>}
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
                      {estatesLoading && (
                        <div className="flex items-center gap-2 px-1 text-xs text-ink/45">
                          <Spinner /> Searching…
                        </div>
                      )}
                      {!estatesLoading &&
                        estates
                          .filter((e) => !query.trim() || e.name.toLowerCase().includes(query.trim().toLowerCase()))
                          .map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSelectedEstateId(s.id)
                                finish(s.id)
                              }}
                              className="w-full text-left rounded-btn border border-warmgray bg-card px-4 py-3 hover:border-terracotta/40"
                            >
                              <span className="font-medium text-ink">{s.name}</span>
                              <span className="text-ink/45 text-sm"> · {s.city}</span>
                            </button>
                          ))}
                      {!estatesLoading && query.trim() && !matchFound && (
                        <p className="text-sm text-ink/55 px-1 py-2">
                          No match for <span className="font-medium text-ink">"{query.trim()}"</span>.
                          Only existing streets can be selected — try a different search term.
                        </p>
                      )}
                      {!estatesLoading && !query && estates.length === 0 && (
                        <p className="text-xs text-ink/45 px-1">Start typing to find your street.</p>
                      )}
                      {!estatesLoading && !query && estates.length > 0 && (
                        <p className="text-xs text-ink/45 px-1">Recent streets — or start typing to search.</p>
                      )}
                    </div>
                    {finishError && <p className="mt-1 text-sm text-red-500">{finishError}</p>}
                    <button className="text-sm text-ink/55 hover:text-terracotta" onClick={() => setMode('choose')}>
                      ← Back to options
                    </button>
                  </div>
                )}

                {mode === 'map' && (
                  <div className="mt-6">
                    <MapPicker
                      streets={fromStreets()}
                      onClose={() => setMode('choose')}
                      onPick={(s) => {
                        setMapPicked(s)
                        setSelectedEstateId(s.id)
                        setMode('choose')
                        finish(s.id)
                      }}
                    />
                    {mapPicked && (
                      <Card>
                        <p className="label-text">Pinned near</p>
                        <p className="font-serif text-xl text-ink mt-1">{mapPicked.name}</p>
                        <p className="text-sm text-ink/55">{mapPicked.city}</p>
                        <p className="text-xs text-ink/45 mt-1">Setting up your wallet…</p>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── SUCCESS overlay ──────────────────────────────────────────── */}
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
              <h1 className="font-serif text-3xl text-ink mt-5">You're in, {fullName.trim().split(' ')[0]}!</h1>
              <p className="text-ink/65 mt-2">
                Your street wallet is ready. Link your banks from your profile whenever you want, then
                watch the work get done.
              </p>
              <Button className="mt-6" size="lg" fullWidth onClick={() => navigate('/app')}>
                Enter my community
              </Button>
              <EmberBurst amount={1} triggerKey="signup-done" />
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
