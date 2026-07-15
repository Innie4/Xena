import { useState, useRef, useEffect, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView, animate } from 'framer-motion'
import Button from '../components/Button'
import { formatNaira } from '../mockData'

function Counter({
  to,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  to: number
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: 1.4,
      ease: 'easeOut',
      onUpdate: (n) => setVal(n),
    })
    return () => controls.stop()
  }, [inView, to])

  return (
    <span ref={ref} className="num">
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  )
}

const QUESTS = [
  {
    n: '01',
    title: 'Link your BVN',
    body: 'One number unlocks your banks through Open Banking. No passwords, no typing.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Join your street',
    body: 'Drop into your street’s Community Wallet and meet the neighbours on your block.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
        <path d="M16 5.5a3 3 0 010 5.8M17 20c0-2.5-1-4-3-4.8" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Watch it get done',
    body: 'Bills clear, projects fund, and you earn streaks & badges as your street levels up.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const PERKS = [
  {
    title: 'Smart Sweep streaks',
    body: 'Auto-collect small amounts and keep a daily streak alive. Miss a day? Start a new run.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1-.5-2-1-3 2 1 3 3 3 5a4 4 0 1 1-8 0c0-4 4-5 4-9z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Street leaderboard',
    body: 'See which street funds fastest. Abak Road is top of the table this month.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 4h8v4a4 4 0 0 1-8 0z" strokeLinejoin="round" />
        <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3M10 12h4M9 20h6M12 16v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Collect badges',
    body: 'First sweep, fully-funded project, 30-day streak — wear them on your profile.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="9" r="5" />
        <path d="M9 13l-1 7 4-2 4 2-1-7" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Watch the work',
    body: 'Verified workers, live progress, job start dates. Every naira is traceable.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

const NEIGHBOURS = [
  { i: 'A', c: 'bg-terracotta text-card' },
  { i: 'U', c: 'bg-olive text-card' },
  { i: 'E', c: 'bg-gold text-ink' },
  { i: 'M', c: 'bg-brick text-card' },
  { i: '+', c: 'bg-warmgray text-ink/60' },
]

function CommunityWalletDemo() {
  const base = 108000
  const goal = 120000
  const [swept, setSwept] = useState(0)
  const total = Math.min(goal, base + swept)
  const pct = total / goal
  const r = 54
  const circ = 2 * Math.PI * r

  return (
    <div className="relative">
      {/* floating coins */}
      <motion.div
        className="absolute -top-4 -left-4 h-10 w-10 rounded-full bg-gold/90 shadow-soft flex items-center justify-center num text-ink text-sm"
        animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        ₦
      </motion.div>
      <motion.div
        className="absolute top-10 -right-3 h-8 w-8 rounded-full bg-terracotta/90 shadow-soft flex items-center justify-center num text-card text-xs"
        animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        ₦
      </motion.div>

      <CardShell>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink/55">Abak Road · Community Wallet</p>
            <div className="flex -space-x-2 mt-2">
              {NEIGHBOURS.map((nb, i) => (
                <div
                  key={i}
                  className={`h-7 w-7 rounded-full ${nb.c} flex items-center justify-center text-xs font-semibold border-2 border-card`}
                >
                  {nb.i}
                </div>
              ))}
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-full">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L4 14h7l-1 8 9-12h-7z" strokeLinejoin="round" />
            </svg>
            streak 12
          </span>
        </div>

        <div className="flex items-center gap-5 mt-5">
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
              <circle cx="60" cy="60" r={r} fill="none" stroke="#E4DCCB" strokeWidth="10" />
              <motion.circle
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ * (1 - pct) }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#C1552C" />
                  <stop offset="100%" stopColor="#D9A441" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="num text-2xl text-ink">{Math.round(pct * 100)}%</span>
              <span className="text-[10px] text-ink/50">funded</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm text-ink/70">Drainage project</p>
            <p className="num text-lg text-olive mt-0.5">{formatNaira(total)}</p>
            <p className="text-xs text-ink/50">of {formatNaira(goal)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" fullWidth onClick={() => setSwept((s) => Math.min(goal - base, s + 500))}>
            Sweep ₦500
          </Button>
        </div>
        <p className="text-[11px] text-ink/45 mt-2 text-center">
          Tap to simulate a Smart Sweep — watch the wallet fill.
        </p>

        <AnimatePresence>
          {swept > 0 && (
            <motion.div
              key={swept}
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: -4, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-4 bottom-3 text-gold num text-sm"
            >
              +{formatNaira(500)}
            </motion.div>
          )}
        </AnimatePresence>
      </CardShell>
    </div>
  )
}

function CardShell({ children }: { children: ReactNode }) {
  return (
    <div className="card-base p-5 bg-card relative overflow-hidden">{children}</div>
  )
}

export default function Landing() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <div className="min-h-screen bg-sand relative overflow-hidden">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-28 -right-24 h-80 w-80 rounded-full bg-terracotta/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-28 h-80 w-80 rounded-full bg-olive/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />

      {/* nav */}
      <header className="relative z-10 px-5 sm:px-8 pt-6 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-card bg-terracotta flex items-center justify-center">
            <span className="font-display text-card text-lg font-extrabold">X</span>
          </div>
          <span className="font-display text-xl font-extrabold text-ink tracking-tight">Xena</span>
        </div>
        <Link to="/app" className="text-sm text-olive font-semibold hover:text-terracotta">
          Open app →
        </Link>
      </header>

      {/* hero */}
      <section className="relative z-10 px-5 sm:px-8 pt-10 pb-14 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta bg-terracotta/10 px-3 py-1.5 rounded-full"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse" />
              Community payments, leveled up
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display font-extrabold leading-[1.05] text-ink mt-5 text-4xl sm:text-5xl lg:text-6xl"
            >
              Turn your street into a{' '}
              <span className="text-gradient">team.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-5 text-ink/70 text-base sm:text-lg max-w-md"
            >
              Xena makes shared bills feel like a game. Connect your BVN, join your street’s wallet,
              and watch the work get done — one small sweep at a time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-7 flex flex-col sm:flex-row gap-3"
            >
              <Link to="/signup">
                <Button size="lg">Get started · 60 sec</Button>
              </Link>
              <Link to="/app">
                <Button variant="secondary" size="lg">
                  Peek inside
                </Button>
              </Link>
            </motion.div>

            <p className="mt-4 text-xs text-ink/45">
              No card needed · Secured by Open Banking · Made for Nigerian streets
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <CommunityWalletDemo />
          </motion.div>
        </div>
      </section>

      {/* live stats */}
      <section className="relative z-10 px-5 sm:px-8 pb-14">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: 2.4, prefix: '₦', suffix: 'M', label: 'moved this year', dec: 1 },
            { to: 7, prefix: '', suffix: '', label: 'streets live', dec: 0 },
            { to: 1.2, prefix: '', suffix: 'k', label: 'neighbours', dec: 1 },
            { to: 98, prefix: '', suffix: '%', label: 'bills on time', dec: 0 },
          ].map((s, i) => (
            <div key={i} className="card-base p-4 text-center">
              <p className="font-display text-3xl text-terracotta">
                <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} decimals={s.dec} />
              </p>
              <p className="text-xs text-ink/55 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works — quests */}
      <section ref={ref} className="relative z-10 px-5 sm:px-8 py-12 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-olive">Your first quest</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink mt-2">
            Three steps to a funded street
          </h2>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-6 relative">
          {QUESTS.map((q, i) => (
            <motion.div
              key={q.n}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12 }}
              className="card-base p-6 relative"
            >
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-2xl bg-olive text-card flex items-center justify-center">
                  {q.icon}
                </div>
                <span className="font-display text-4xl font-extrabold text-warmgray">
                  {q.n}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-ink mt-4">{q.title}</h3>
              <p className="text-sm text-ink/65 mt-1.5">{q.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* perks */}
      <section className="relative z-10 px-5 sm:px-8 py-12 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERKS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08 }}
              className="card-base p-5 hover:border-terracotta/50 transition-colors"
            >
              <div className="text-terracotta">{p.icon}</div>
              <h3 className="font-display text-lg font-bold text-ink mt-3">{p.title}</h3>
              <p className="text-sm text-ink/65 mt-1">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* final CTA */}
      <section className="relative z-10 px-5 sm:px-8 py-12 pb-20 max-w-6xl mx-auto">
        <div className="rounded-card bg-olive text-card p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold/20 blur-2xl" />
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl">
            Ready to level up your street?
          </h2>
          <p className="text-card/75 mt-3 max-w-md mx-auto">
            Join the neighbours already clearing bills together. It takes a BVN and a minute.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-gold text-ink hover:bg-gold/90">
                Start my street’s run
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-warmgray px-5 sm:px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink/45">
          <span>© {new Date().getFullYear()} Xena · A demo product. All data is fictional.</span>
          <span>Made for Nigerian streets · Uyo · Lagos · Abuja</span>
        </div>
      </footer>
    </div>
  )
}
