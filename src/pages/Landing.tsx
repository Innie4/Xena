import { useState, useRef, useEffect, useMemo, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useScroll,
  useTransform,
} from 'framer-motion'
import Button from '../components/Button'
import FlameRing from '../components/FlameRing'
import EmberBurst from '../components/EmberBurst'
import { formatNaira } from '../mockData'

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  className = '',
  delay = 0,
  y = 26,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}

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
  const reduce = useReducedMotion()
  const [val, setVal] = useState(reduce ? to : 0)

  useEffect(() => {
    if (!inView || reduce) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400)
      setVal(to * (1 - Math.pow(1 - t, 3)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduce, to])

  return (
    <span ref={ref} className="num">
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  )
}

/* A warm cursor glow: the world is aware of the visitor. Desktop only. */
function CursorGlow() {
  const reduce = useReducedMotion()
  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const sx = useSpring(x, { stiffness: 120, damping: 22 })
  const sy = useSpring(y, { stiffness: 120, damping: 22 })
  const bg = useMotionTemplate`radial-gradient(260px circle at ${sx}px ${sy}px, rgba(217,164,65,0.16), rgba(193,85,44,0.05) 45%, transparent 70%)`

  useEffect(() => {
    if (reduce) return
    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [reduce, x, y])

  if (reduce) return null
  return <motion.div className="pointer-events-none fixed inset-0 z-0" style={{ background: bg }} />
}

/* A restrained drift of embers: ten that mean something, not a hundred. */
function Embers({ count = 10 }: { count?: number }) {
  const reduce = useReducedMotion()
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 37 + 11) % 96}%`,
        delay: (i * 0.9) % 6,
        dur: 6 + (i % 4),
        size: 2 + (i % 3),
        tone: i % 2 === 0 ? 'bg-gold' : 'bg-terracotta',
      })),
    [count],
  )
  if (reduce) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {embers.map((e, i) => (
        <motion.span
          key={i}
          className={`absolute bottom-0 rounded-full ${e.tone} opacity-60`}
          style={{ left: e.left, width: e.size, height: e.size }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [-10, -260], opacity: [0, 0.7, 0] }}
          transition={{ duration: e.dur, delay: e.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

/* The one meaningful threshold: night lifts to reveal the lit street. */
function Gate({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-25% 0px -25% 0px' })
  const reduce = useReducedMotion()
  return (
    <div ref={ref} className="relative">
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 bg-ink"
          initial={{ opacity: 1 }}
          animate={inView ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        />
      )}
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* The living wallet demo (interaction preserved, copy reframed)      */
/* ------------------------------------------------------------------ */

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

  return (
    <div className="relative">
      <motion.div
        className="absolute -top-4 -left-4 h-10 w-10 rounded-full bg-gold/90 shadow-soft flex items-center justify-center num text-ink text-sm"
        animate={useReducedMotion() ? {} : { y: [0, -8, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        ₦
      </motion.div>

      <div className="card-base p-5 bg-card relative overflow-hidden border-warmgray">
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
          <FlameRing value={total} max={goal} centerLabel="funded" />

          <div className="flex-1">
            <p className="text-sm text-ink/70">Gutter clearing fund</p>
            <p className="num text-lg text-olive mt-0.5">{formatNaira(total)}</p>
            <p className="text-xs text-ink/50">of {formatNaira(goal)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" fullWidth onClick={() => setSwept((s) => Math.min(goal - base, s + 500))}>
            Add your sweep · ₦500
          </Button>
        </div>
        <p className="text-[11px] text-ink/45 mt-2 text-center">
          Tap to drop a sweep into the wallet. Watch the work take shape.
        </p>

        {swept > 0 && <EmberBurst amount={500} triggerKey={swept} />}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* The page                                                            */
/* ------------------------------------------------------------------ */

const TURNS = [
  {
    n: 'I',
    title: 'Light the first spark',
    body: 'One BVN unlocks your banks through Open Banking. No passwords, no typing out account details. The fire knows you.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1-.5-2-1-3 2 1 3 3 3 5a4 4 0 1 1-8 0c0-4 4-5 4-9z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: 'II',
    title: 'Step into the circle',
    body: 'Drop into your street’s Community Wallet and meet the neighbours on your block. The circle closes only when you’re in it.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
        <path d="M16 5.5a3 3 0 010 5.8M17 20c0-2.5-1-4-3-4.8" />
      </svg>
    ),
  },
  {
    n: 'III',
    title: 'Keep the fire',
    body: 'Bills clear, projects fund, and your street builds streaks and standing as it levels up. A street that holds, holds together.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const MARKS = [
  {
    title: 'The fire’s steadiness',
    body: 'Smart Sweep collects small amounts automatically and keeps a daily streak alive. Miss a day? You simply begin a new run.',
    tone: 'bg-terracotta/10 text-terracotta',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1-.5-2-1-3 2 1 3 3 3 5a4 4 0 1 1-8 0c0-4 4-5 4-9z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Which hearth burns brightest',
    body: 'See which street funds fastest. Abak Road leads the table this month, and the next street is close behind.',
    tone: 'bg-gold/15 text-[#8a6516]',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 4h8v4a4 4 0 0 1-8 0z" strokeLinejoin="round" />
        <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3M10 12h4M9 20h6M12 16v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Marks you earn',
    body: 'First sweep, a fully-funded project, a 30-day streak. Wear them on your profile like brands from the fire.',
    tone: 'bg-olive/10 text-olive',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="9" r="5" />
        <path d="M9 13l-1 7 4-2 4 2-1-7" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Every log is seen',
    body: 'Verified workers, live progress, job start dates. Nothing vanishes into the dark. Every naira on the fire is traceable.',
    tone: 'bg-brick/10 text-brick',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

export default function Landing() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const heroRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true })
  const heroParallax = useTransform(scrollYProgress, [0, 0.25], [0, -60])

  return (
    <div className="relative bg-sand text-ink overflow-hidden">
      <CursorGlow />

      {/* ============================ HERO ============================ */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden bg-gradient-to-b from-ink via-[#20190f] to-[#2a211a] text-card"
      >
        {/* atmosphere */}
        <div className="pointer-events-none absolute -top-24 -right-20 h-80 w-80 rounded-full bg-terracotta/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-72 w-[36rem] max-w-[90vw] rounded-[100%] bg-gold/15 blur-3xl" />
        <motion.div style={{ y: heroParallax }} className="pointer-events-none absolute inset-x-0 bottom-0 h-64">
          <Embers count={10} />
        </motion.div>

        {/* nav */}
        <header className="absolute top-0 inset-x-0 z-20 px-5 sm:px-8 pt-6 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-card bg-terracotta flex items-center justify-center shadow-soft">
              <span className="font-display text-card text-lg font-extrabold">X</span>
            </div>
            <span className="font-display text-xl font-extrabold text-card tracking-tight">Xena</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-card/70 font-semibold hover:text-card transition-colors">
              Log in
            </Link>
            <Link to="/app" className="text-sm text-gold font-semibold hover:text-card transition-colors">
              Open app →
            </Link>
          </div>
        </header>

        {/* the opening line */}
        <div className="relative z-10 px-5 sm:px-8 max-w-4xl mx-auto w-full text-center">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-xs font-semibold uppercase tracking-[0.25em] text-gold/80"
          >
            A tale of one street
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
            className="font-serif font-semibold leading-[1.02] mt-5 text-5xl sm:text-6xl lg:text-7xl"
          >
            A street is a fire.
            <br />
            <span className="text-gradient">Keep yours lit.</span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.28 }}
            className="mt-6 text-card/75 text-base sm:text-lg max-w-xl mx-auto font-sans"
          >
            Xena turns the bills a street shares, trash, water, waste pickup, into small, steady sweeps, so
            the work gets done and no one carries the load alone.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-9 flex flex-col items-center gap-5"
          >
            <Link
              to="/signup"
              className="text-sm text-gold font-semibold hover:text-card transition-colors border-b border-gold/40 pb-0.5"
            >
              Begin your street’s tale →
            </Link>
            <span className="text-[11px] text-card/40 tracking-wide">Scroll to step into Abak Road ↓</span>
          </motion.div>
        </div>
      </section>

      {/* ====================== THE GATE / WORLD ====================== */}
      <Gate>
        <div className="relative z-10">
          {/* warm light pools behind the world */}
          <div className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
          <div className="pointer-events-none absolute top-1/3 -left-20 h-72 w-72 rounded-full bg-terracotta/10 blur-3xl" />

          {/* What the fire is: concrete, in-world */}
          <section className="px-5 sm:px-8 pt-20 pb-16 max-w-3xl mx-auto">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta">
                What the fire means
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="font-serif text-2xl sm:text-3xl leading-snug text-ink mt-3">
                On Abak Road, the <span className="text-terracotta">₦1,500 trash bill</span> isn’t one
                person’s weight. It’s the street’s fire, and every neighbour feeds it{' '}
                <span className="text-olive">₦500 at a time</span>, without thinking.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-ink/70 mt-5 font-sans leading-relaxed">
                Xena is the hearth-keeper. It links your BVN, opens your street’s Community Wallet, and
                runs Smart Sweep, small automatic collections that land when your balance is healthy.
                The money funds the projects your street votes on, and every naira is seen by everyone.
                Stay on rhythm and your standing rises; the whole street pays less.
              </p>
            </Reveal>
          </section>

          {/* The living wallet */}
          <section className="px-5 sm:px-8 pb-16 max-w-3xl mx-auto">
            <Reveal>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink">Feed the fire</h2>
              <p className="text-ink/65 mt-2 font-sans">
                This is a Community Wallet. Drop a sweep in and watch the work take shape.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="mt-7">
              <CommunityWalletDemo />
            </Reveal>
          </section>

          {/* How it works: three turns, not three cards */}
          <section className="px-5 sm:px-8 py-16 max-w-4xl mx-auto">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-olive">
                How a street is lit
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink mt-2">Three turns of the page</h2>
            </Reveal>

            <div className="relative mt-10">
              {/* the connecting ember thread */}
              <div className="hidden sm:block absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-terracotta via-gold to-olive/40" />
              <div className="space-y-10">
                {TURNS.map((t, i) => (
                  <Reveal key={t.n} delay={i * 0.1}>
                    <div className="flex items-start gap-5">
                      <div
                        className={`relative z-10 h-14 w-14 shrink-0 rounded-2xl ${i === 0 ? 'bg-terracotta' : i === 1 ? 'bg-gold text-ink' : 'bg-olive'} text-card flex items-center justify-center shadow-soft`}
                      >
                        {t.icon}
                      </div>
                      <div className="pt-1">
                        <p className="font-display text-xs font-bold tracking-widest text-ink/40">
                          TURN {t.n}
                        </p>
                        <h3 className="font-serif text-xl font-semibold text-ink mt-1">{t.title}</h3>
                        <p className="text-ink/65 mt-1.5 font-sans max-w-xl">{t.body}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* The street's ledger: plain words, not a stat grid */}
          <section className="px-5 sm:px-8 py-16 max-w-3xl mx-auto">
            <Reveal>
              <p className="font-serif text-2xl sm:text-3xl leading-snug text-ink">
                This year the streets moved{' '}
                <span className="text-terracotta">
                  <Counter to={2.4} prefix="₦" suffix="M" decimals={1} />
                </span>
                , lit{' '}
                <span className="text-olive">
                  <Counter to={7} suffix="" decimals={0} />
                </span>{' '}
                streets, and kept{' '}
                <span className="text-gold">
                  <Counter to={98} suffix="%" decimals={0} />
                </span>{' '}
                of bills on time.
              </p>
            </Reveal>
          </section>

          {/* The street's marks, set down like a codex */}
          <section className="px-5 sm:px-8 py-16 max-w-5xl mx-auto">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta">
                Marks of a street that holds
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink mt-2">Earned, not given</h2>
            </Reveal>
            <div className="mt-9 border-y border-warmgray/70 divide-y divide-warmgray/70">
              {MARKS.map((m, i) => (
                <Reveal key={m.title} delay={(i % 4) * 0.05}>
                  <div className="group flex items-start gap-5 py-7">
                    <div className="shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-terracotta to-gold flex items-center justify-center text-card font-display text-lg shadow-soft">
                      {['I', 'II', 'III', 'IV'][i]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-xl font-semibold text-ink">{m.title}</h3>
                      <p className="text-ink/65 mt-1.5 font-sans text-sm leading-relaxed">{m.body}</p>
                    </div>
                    <div className={`hidden sm:flex h-11 w-11 rounded-full items-center justify-center shrink-0 ${m.tone}`}>
                      {m.icon}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* The close of the chapter */}
          <section className="px-5 sm:px-8 py-20 max-w-4xl mx-auto">
            <Reveal>
              <div className="relative overflow-hidden rounded-card bg-olive text-card p-9 sm:p-14 text-center">
                <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-gold/20 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-terracotta/20 blur-2xl" />
                <h2 className="relative font-serif font-semibold text-3xl sm:text-5xl leading-tight">
                  The fire is waiting
                  <br />
                  for your stick.
                </h2>
                <p className="relative text-card/80 mt-4 max-w-md mx-auto font-sans">
                  Join the neighbours already keeping Abak Road lit. It takes a BVN and a minute.
                </p>
                <div className="relative mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link to="/signup">
                    <Button size="lg" className="bg-gold text-ink hover:bg-gold/90">
                      Start my street’s run
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" size="lg" className="text-card border-card/40 hover:bg-card/10">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/app">
                    <Button variant="ghost" size="lg" className="text-card/80 hover:text-card">
                      Peek inside
                    </Button>
                  </Link>
                </div>
                <p className="relative mt-4 text-[11px] text-card/50">
                  No card needed · Secured by Open Banking · Made for Nigerian streets
                </p>
              </div>
            </Reveal>
          </section>

          <footer className="border-t border-warmgray px-5 sm:px-8 py-6">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink/45">
              <span>© {new Date().getFullYear()} Xena · A demo product. All data is fictional.</span>
              <span>Made for Nigerian streets · Uyo · Lagos · Abuja</span>
            </div>
          </footer>
        </div>
      </Gate>
    </div>
  )
}
