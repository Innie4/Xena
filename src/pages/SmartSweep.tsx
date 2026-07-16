import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import FlameRing from '../components/FlameRing'
import EmberBurst from '../components/EmberBurst'
import ToggleSwitch from '../components/ToggleSwitch'
import StatusTag from '../components/StatusTag'
import Modal, { SuccessModal } from '../components/Modal'
import { useApp } from '../context/AppContext'
import { formatNaira, formatDateTime } from '../mockData'
import GameStrip from '../game/components/GameStrip'

export default function SmartSweep() {
  const { billId } = useParams()
  const navigate = useNavigate()
  const { bills, sweepMandates, sweepLog, collectSweep, setMandatePaused, cancelMandate } = useApp()

  const bill = bills.find((b) => b.id === billId)
  const mandate = sweepMandates.find((m) => m.billId === billId)
  const log = sweepLog.filter((l) => l.billId === billId)

  const [flash, setFlash] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [sweepCancelled, setSweepCancelled] = useState(false)
  const [burstKey, setBurstKey] = useState(0)
  const [burstAmount, setBurstAmount] = useState(0)

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(false), 900)
    return () => clearTimeout(t)
  }, [flash])

  if (!bill) {
    return (
      <div>
        <PageHeader title="Smart Sweep" backTo="/bills" />
        <div className="w-full lg:max-w-6xl lg:mx-auto lg:px-8 lg:py-7 px-5 py-10 text-center text-ink/60">Bill not found.</div>
      </div>
    )
  }

  if (!mandate) {
    return (
      <div>
        <PageHeader title="Smart Sweep" backTo={`/bills/${billId}`} />
        <div className="w-full lg:max-w-6xl lg:mx-auto lg:px-8 lg:py-7 px-5 py-10 text-center text-ink/60">
          No Smart Sweep set up for this bill.
          <div className="mt-4">
            <Link to={`/bills/${billId}`}>
              <Button variant="secondary">Back to bill</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const collected = bill.smartSweepCollected ?? 0
  const remaining = Math.max(0, bill.amount - collected)
  const pct = Math.min(100, (collected / bill.amount) * 100)
  const isPaused = !mandate.active

  const doCollect = () => {
    if (isPaused || remaining <= 0) return
    const amount = Math.min(mandate.cap, remaining)
    collectSweep(bill.id, amount)
    setBurstAmount(amount)
    setBurstKey((k) => k + 1)
    setFlash(true)
  }

  const doCancel = () => {
    cancelMandate(mandate.id)
    setCancelOpen(false)
    setSweepCancelled(true)
  }

  return (
    <div className="pb-4">
      <PageHeader title="Smart Sweep" subtitle={bill.type} backTo={`/bills/${billId}`} />

      <div className="w-full lg:max-w-6xl lg:mx-auto lg:px-8 lg:py-7 px-5 py-5 space-y-4">
        <GameStrip />
        <p className="text-sm text-ink/60 -mt-2">Small automatic sweeps keep your rhythm without you lifting a finger.</p>
        {/* Mandate summary: always visible per trust rules */}
        <Card className="bg-olive text-card border-0">
          <div className="flex items-center justify-between">
            <p className="text-xs text-card/70">Mandate</p>
            <StatusTag status={isPaused ? 'pending' : 'in_progress'} label={isPaused ? 'Paused' : 'Active'} />
          </div>
          <p className="mt-1 text-sm">
            Collects up to <span className="num">{formatNaira(mandate.cap)}</span> per sweep
          </p>
          <p className="text-xs text-card/70 mt-1">{mandate.frequency}.</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-card/15">
            <div className="flex items-center gap-2">
              <ToggleSwitch checked={!isPaused} onChange={(v) => setMandatePaused(mandate.id, !v)} />
              <span className="text-xs text-card/80">{isPaused ? 'Paused' : 'Running'}</span>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setCancelOpen(true)}
            >
              Cancel
            </Button>
          </div>
        </Card>

        {/* Visual container that fills up */}
        <Card className="relative">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs text-ink/55">Collected so far</p>
              <motion.p
                key={collected}
                initial={{ color: '#D9A441' }}
                animate={{ color: '#C1552C' }}
                transition={{ duration: 0.8 }}
                className="num-lg text-terracotta"
              >
                {formatNaira(collected)}
              </motion.p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink/55">Still needed</p>
              <p className="num text-ink/80">{formatNaira(remaining)}</p>
            </div>
          </div>

          <div className="flex justify-center my-2">
            <FlameRing value={collected} max={bill.amount} size={96} showPercent centerLabel="collected" />
          </div>
          <p className="text-xs text-ink/50 mt-1 text-center">
            {Math.round(pct)}% of {formatNaira(bill.amount)} collected through sweeps
          </p>

          <Button
            className="mt-4"
            fullWidth
            onClick={doCollect}
            disabled={isPaused || remaining <= 0}
          >
            {remaining <= 0 ? 'Goal reached' : isPaused ? 'Resume to collect' : `Collect ₦${mandate.cap} now`}
          </Button>
          {remaining <= 0 && (
            <p className="text-center text-sm text-olive mt-2 font-medium">
              This bill is fully covered. Well done.
            </p>
          )}
          {burstAmount > 0 && <EmberBurst amount={burstAmount} triggerKey={burstKey} />}
        </Card>

        {/* Running log */}
        <div>
          <h2 className="font-serif text-lg text-ink mb-2">Collection log</h2>
          {log.length === 0 ? (
            <Card className="text-sm text-ink/55">
              No collections yet. Tap “Collect” to sweep a small amount toward this bill.
            </Card>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {log.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-base p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-ink">Swept {formatNaira(entry.amount)}</p>
                        <p className="text-xs text-ink/50">{formatDateTime(entry.timestamp)}</p>
                      </div>
                    </div>
                    <span className="num text-olive">+{formatNaira(entry.amount)}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel Smart Sweep?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setCancelOpen(false)}>
              Keep it
            </Button>
            <Button variant="danger" size="sm" onClick={doCancel}>
              Yes, cancel
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink/75">
          This stops Xena from collecting toward your {bill.type.toLowerCase()} bill. You can set it up
          again anytime from the bill screen. Already collected amounts stay applied.
        </p>
      </Modal>

      <SuccessModal
        open={sweepCancelled}
        onClose={() => navigate('/bills')}
        title="Smart Sweep cancelled"
        message="Automatic collection has stopped for this bill."
      />
    </div>
  )
}
