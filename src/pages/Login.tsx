import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import { currentUser } from '../mockData'
import { useApp } from '../context/AppContext'
import FlameRing from '../components/FlameRing'

const MILESTONES = ['Phone', 'Verify']

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
                <div className={`h-1 flex-1 rounded-full ${i === 0 ? 'opacity-0' : ''} ${i <= step ? 'bg-gold' : 'bg-warmgray'}`} />
                <motion.div
                  className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center border-2 ${
                    done ? 'bg-gold/15 border-gold' : active ? 'bg-terracotta/10 border-terracotta' : 'bg-card border-warmgray'
                  }`}
                  animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                  transition={{ duration: 1.2, repeat: active ? Infinity : 0 }}
                >
                  {done ? (
                    <CheckBadge />
                  ) : (
                    <span className={`text-sm font-semibold ${active ? 'text-terracotta' : 'text-ink/40'}`}>{i + 1}</span>
                  )}
                </motion.div>
                <div className={`h-1 flex-1 rounded-full ${i === MILESTONES.length - 1 ? 'opacity-0' : ''} ${i < step ? 'bg-gold' : 'bg-warmgray'}`} />
              </div>
              <span className={`text-[10px] mt-1.5 ${done || active ? 'text-ink/70' : 'text-ink/35'}`}>{label}</span>
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
    <svg className="animate-spin h-4 w-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [step, setStep] = useState(0)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [entering, setEntering] = useState(false)

  const phoneDigits = phone.replace(/\D/g, '')
  const phoneOk = phoneDigits.length >= 10 && phoneDigits.length <= 11
  const otpOk = otp.replace(/\D/g, '').length === 6

  useEffect(() => {
    if (step === 1 && otpOk) {
      const t = setTimeout(() => setStep(2), 450)
      return () => clearTimeout(t)
    }
  }, [otpOk, step])

  const enter = () => {
    setEntering(true)
    login(currentUser)
    setTimeout(() => navigate('/app'), 400)
  }

  const progressPct = (step / (MILESTONES.length - 1)) * 100

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <div className="px-4 sm:px-6 pt-5 flex items-center justify-between w-full lg:max-w-md lg:mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-card bg-terracotta flex items-center justify-center">
            <span className="font-serif text-card text-lg font-semibold">X</span>
          </div>
          <span className="font-serif text-xl font-semibold text-ink">Xena</span>
        </div>
        <Link to="/signup" className="text-xs text-ink/45 hover:text-terracotta">
          New here? Sign up
        </Link>
      </div>

      <div className="px-4 sm:px-6 pt-5 w-full lg:max-w-md lg:mx-auto">
        <Journey step={Math.min(step, 1)} />
        <div className="mt-3 h-1.5 w-full bg-warmgray rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-terracotta to-gold rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 py-7 w-full lg:max-w-md lg:mx-auto flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            {/* ── STEP 0: phone ─────────────────────────────────────── */}
            {step === 0 && (
              <div>
                <div className="flex justify-center mb-5">
                  <FlameRing value={60} max={100} size={92} centerLabel="welcome" />
                </div>
                <span className="inline-block text-xs font-medium uppercase tracking-wider text-terracotta">
                  Re-enter the circle
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Welcome back.</h1>
                <p className="text-ink/65 mt-2 text-sm">
                  Enter the number on your street's wallet and we'll send a quick code.
                </p>

                <div className="mt-6">
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
                </div>

                <Button className="mt-6" fullWidth size="lg" disabled={!phoneOk} onClick={() => setStep(1)}>
                  Send code
                </Button>

                <div className="mt-5">
                  <Button variant="ghost" size="sm" fullWidth onClick={enter}>
                    Use demo account
                  </Button>
                </div>
              </div>
            )}

            {/* ── STEP 1: OTP ───────────────────────────────────────── */}
            {step === 1 && (
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-ink">One quick check.</h1>
                <p className="text-ink/65 mt-2 text-sm">
                  We sent a 6-digit code to <span className="num text-ink">{phoneDigits}</span>. Any 6
                  digits work for this demo.
                </p>

                <div className="mt-7">
                  <OtpInput value={otp} onChange={setOtp} />
                </div>

                <Button className="mt-7" fullWidth size="lg" disabled={!otpOk} onClick={enter}>
                  Enter my community
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

            {/* ── STEP 2: entering ──────────────────────────────────── */}
            {step === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  className="h-16 w-16 rounded-full bg-gold/20 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Spinner />
                </motion.div>
                <p className="text-ink/65 mt-4">Re-lighting your street's fire…</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="mt-6 text-center text-[11px] text-ink/40">
          Secured by Open Banking · Made for Nigerian streets
        </p>
      </div>

      {entering && (
        <div className="fixed inset-0 z-40 bg-ink/30 flex items-center justify-center">
          <Card className="bg-card">Re-lighting your wallet…</Card>
        </div>
      )}
    </div>
  )
}
