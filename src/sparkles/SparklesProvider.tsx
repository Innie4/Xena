import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { useApp } from '../context/AppContext'
import { formatNaira } from '../mockData'
import { Reminder, SparklesSettings, SnoozePreset } from './types'
import SparklesBubble from './SparklesBubble'
import SparklesPanel from './SparklesPanel'
import ReminderToast from './ReminderToast'

interface SparklesContextValue {
  settings: SparklesSettings
  log: Reminder[]
  unread: boolean
  toast: Reminder | null
  openPanel: boolean
  setOpenPanel: (v: boolean) => void
  updateSettings: (patch: Partial<SparklesSettings>) => void
  setQuietHours: (patch: Partial<SparklesSettings['quietHours']>) => void
  setGoalEnabled: (goalId: string, enabled: boolean) => void
  dismiss: (id: string) => void
  snooze: (id: string, preset: SnoozePreset) => void
  triggerDemo: () => void
  clearUnread: () => void
}

const Ctx = createContext<SparklesContextValue | null>(null)

export function useSparkles(): SparklesContextValue {
  const c = useContext(Ctx)
  if (!c) throw new Error('useSparkles must be used within SparklesProvider')
  return c
}

const DAILY_CAP = 3
const SNOOZE_DEMO_MS: Record<SnoozePreset, number> = { '1h': 8000, '1d': 12000, '1w': 16000 }

function eventKey(r: Pick<Reminder, 'type' | 'goalId' | 'title'>): string {
  return `${r.type}:${r.goalId ?? r.title}`
}

function inQuietHours(now: Date, qh: SparklesSettings['quietHours']): boolean {
  if (!qh.enabled) return false
  const cur = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = qh.start.split(':').map(Number)
  const [eh, em] = qh.end.split(':').map(Number)
  const start = sh * 60 + sm
  const end = eh * 60 + em
  if (start <= end) return cur >= start && cur < end
  return cur >= start || cur < end
}

function escalateBody(body: string, attempt: number): string {
  if (attempt <= 1) return body
  if (attempt === 2) return `${body} Still a good moment to keep your rhythm.`
  return `${body} This is the last nudge, then we'll leave it with you.`
}

function newId(): string {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function SparklesProvider({ children }: { children: ReactNode }) {
  const { bills, projects, walletBalance, activeStreetId, getStreetName } = useApp()

  const [settings, setSettings] = useState<SparklesSettings>({
    enabled: true,
    quietHours: { enabled: true, start: '22:00', end: '07:00' },
    perGoal: {},
  })
  const [log, setLog] = useState<Reminder[]>([])
  const [toast, setToast] = useState<Reminder | null>(null)
  const [unread, setUnread] = useState(false)
  const [openPanel, setOpenPanel] = useState(false)

  const activeEvents = useRef<Set<string>>(new Set())
  const attempts = useRef<Record<string, number>>({})
  const daily = useRef<{ date: string; count: number }>({ date: '', count: 0 })
  const shownRef = useRef(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const addLog = useCallback((r: Reminder) => {
    setLog((l) => [r, ...l].slice(0, 60))
  }, [])

  const notify = useCallback(
    (r: Reminder) => {
      const key = eventKey(r)

      // Never send more than one reminder about the same event at a time.
      if (activeEvents.current.has(key)) return

      // Respect per-goal toggles.
      if (r.goalId && settings.perGoal[r.goalId] === false) {
        addLog({ ...r, status: 'dismissed' })
        return
      }

      // Master switch off: log but stay quiet.
      if (!settings.enabled) {
        addLog(r)
        return
      }

      const now = new Date()

      // Quiet hours: log it, hold the toast until later (demo just logs).
      if (inQuietHours(now, settings.quietHours)) {
        addLog({ ...r, status: 'sent' })
        return
      }

      // Daily send cap.
      const today = now.toISOString().slice(0, 10)
      if (daily.current.date !== today) daily.current = { date: today, count: 0 }
      if (daily.current.count >= DAILY_CAP) {
        addLog(r)
        return
      }
      daily.current.count += 1

      activeEvents.current.add(key)
      addLog(r)
      setToast(r)
      setUnread(true)
    },
    [settings, addLog],
  )

  const dismiss = useCallback((id: string) => {
    setLog((l) => l.map((x) => (x.id === id ? { ...x, status: 'dismissed' } : x)))
    setToast((t) => (t?.id === id ? null : t))
    const idx = log.findIndex((x) => x.id === id)
    if (idx >= 0) activeEvents.current.delete(eventKey(log[idx]))
  }, [log])

  const reschedule = useCallback(
    (r: Reminder, preset: SnoozePreset) => {
      const delay = SNOOZE_DEMO_MS[preset]
      const t = setTimeout(() => {
        const key = eventKey(r)
        const attempt = (attempts.current[key] ?? 0) + 1
        attempts.current[key] = attempt
        activeEvents.current.delete(key)
        notify({ ...r, id: newId(), body: escalateBody(r.body, attempt), createdAt: new Date().toISOString() })
      }, delay)
      timers.current.push(t)
    },
    [notify],
  )

  const snooze = useCallback(
    (id: string, preset: SnoozePreset) => {
      const source = log.find((x) => x.id === id) ?? toast
      setToast(null)
      if (source) {
        setLog((l) => l.map((x) => (x.id === id ? { ...x, status: 'snoozed' } : x)))
        reschedule(source, preset)
      }
    },
    [log, toast, reschedule],
  )

  const buildGoalReminder = useCallback((): Reminder | null => {
    const bill = bills.find((b) => b.status !== 'paid')
    if (bill) {
      return {
        id: newId(),
        type: 'scheduled',
        title: 'Contribution due soon',
        body: `Your ${formatNaira(bill.amount)} ${bill.type} bill is due soon. A small sweep keeps ${getStreetName(activeStreetId)} lit.`,
        goalId: bill.id,
        cta: { label: 'Contribute', amount: 500, purpose: bill.type, destination: bill.provider },
        createdAt: new Date().toISOString(),
        status: 'sent',
      }
    }
    const project = projects.find((p) => p.status === 'active')
    if (project) {
      const stillNeeded = Math.max(0, project.goal - project.raised)
      return {
        id: newId(),
        type: 'milestone',
        title: 'Your street project is moving',
        body: `The ${project.title} project on ${getStreetName(activeStreetId)} has ${formatNaira(stillNeeded)} left. A top-up keeps the work on track.`,
        goalId: project.id,
        cta: { label: 'Contribute', amount: 1000, purpose: project.title, destination: 'Community Wallet' },
        createdAt: new Date().toISOString(),
        status: 'sent',
      }
    }
    return null
  }, [bills, projects, activeStreetId, getStreetName])

  const triggerDemo = useCallback(() => {
    const r = buildGoalReminder()
    if (r) notify(r)
  }, [buildGoalReminder, notify])

  // One welcome nudge shortly after the app loads (demo of a scheduled reminder).
  useEffect(() => {
    if (shownRef.current) return
    const t = setTimeout(() => {
      shownRef.current = true
      triggerDemo()
    }, 3200)
    timers.current.push(t)
    return () => {
      timers.current.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateSettings = useCallback((patch: Partial<SparklesSettings>) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  const setQuietHours = useCallback((patch: Partial<SparklesSettings['quietHours']>) => {
    setSettings((s) => ({ ...s, quietHours: { ...s.quietHours, ...patch } }))
  }, [])

  const setGoalEnabled = useCallback((goalId: string, enabled: boolean) => {
    setSettings((s) => ({ ...s, perGoal: { ...s.perGoal, [goalId]: enabled } }))
  }, [])

  const clearUnread = useCallback(() => setUnread(false), [])

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout)
  }, [])

  const value: SparklesContextValue = {
    settings,
    log,
    unread,
    toast,
    openPanel,
    setOpenPanel,
    updateSettings,
    setQuietHours,
    setGoalEnabled,
    dismiss,
    snooze,
    triggerDemo,
    clearUnread,
  }

  return (
    <Ctx.Provider value={value}>
      {children}
      <SparklesBubble />
      <SparklesPanel />
      <ReminderToast walletBalance={walletBalance} />
    </Ctx.Provider>
  )
}
