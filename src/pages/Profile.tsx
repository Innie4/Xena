import { Link } from 'react-router-dom'
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import StandingCard from '../components/StandingCard'
import Modal, { SuccessModal } from '../components/Modal'
import { useApp } from '../context/AppContext'
import { formatNaira } from '../mockData'
import { ContributorProfile } from '../services/prediction/types'

export default function Profile() {
  const {
    user,
    activeStreetId,
    getStreetName,
    sweepMandates,
    timing,
    cancelMandate,
    toggleTiming,
    bills,
  } = useApp()

  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelTiming, setCancelTiming] = useState(false)
  const [done, setDone] = useState('')

  const activeMandates = sweepMandates.filter((m) => m.active)
  const billTypeFor = (billId: string) =>
    bills.find((b) => b.id === billId)?.type ?? 'bill'

  const profile: ContributorProfile = {
    id: user?.id ?? 'me',
    name: user?.name ?? 'You',
    streetId: user?.streetId ?? activeStreetId,
    events: (user?.contributions ?? []).map((c) => ({
      id: c.id,
      contributorId: user?.id ?? 'me',
      amount: c.amount,
      at: c.at,
    })),
  }

  return (
    <div className="pb-4">
      <PageHeader title="Profile" subtitle="Your account & mandates" backTo="/app" showBell={false} />

      <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8 lg:py-7 px-5 py-5 space-y-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-terracotta text-card flex items-center justify-center font-serif text-lg font-semibold">
              {user?.firstName?.[0] ?? 'X'}
            </div>
            <div>
              <p className="font-medium text-ink">{user?.name}</p>
              <p className="text-xs text-ink/55">{user?.phone}</p>
              <p className="text-xs text-ink/55">{getStreetName(activeStreetId)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="label-text">Linked bank</p>
              <p className="font-medium text-ink mt-0.5">{user?.bankName}</p>
              <p className="text-xs text-ink/55">{user?.accountName}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-olive font-medium bg-olive/10 px-2.5 py-1 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Connected
            </span>
          </div>
          <p className="text-[11px] text-ink/45 mt-2">Secured via Open Banking · read-only access</p>
        </Card>

        <StandingCard profile={profile} />

        <section>
          <h2 className="font-serif text-lg text-ink mb-2">Your mandates</h2>

          {activeMandates.length === 0 && !timing.enabled && (
            <Card className="text-sm text-ink/55">
              No active mandates. Turn on Smart Sweep from a bill or enable Payment Timing to automate
              your payments.
            </Card>
          )}

          {activeMandates.map((m) => (
            <Card key={m.id} className="mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink">Smart Sweep · {billTypeFor(m.billId)}</p>
                  <p className="text-xs text-ink/55">
                    Up to {formatNaira(m.cap)} per sweep
                  </p>
                </div>
                <span className="text-xs text-olive font-medium">Active</span>
              </div>
              <p className="text-xs text-ink/55 mt-1.5">{m.frequency}.</p>
              <div className="flex gap-2 mt-3">
                <Link to={`/smart-sweep/${m.billId}`} className="flex-1">
                  <Button variant="secondary" size="sm" fullWidth>
                    Manage
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => setCancelId(m.id)}>
                  Cancel
                </Button>
              </div>
            </Card>
          ))}

          {timing.enabled && (
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink">Smart Payment Timing</p>
                  <p className="text-xs text-ink/55">
                    Collects bills around the {timing.payPatternDay}
                    {timing.payPatternDay === 1 ? 'st' : timing.payPatternDay === 2 ? 'nd' : timing.payPatternDay === 3 ? 'rd' : 'th'}
                  </p>
                </div>
                <span className="text-xs text-olive font-medium">On</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Link to="/payment-timing" className="flex-1">
                  <Button variant="secondary" size="sm" fullWidth>
                    Manage
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => setCancelTiming(true)}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}
        </section>

        <Link to="/signup" className="block">
          <Button variant="ghost" size="sm" fullWidth>
            Switch street / account
          </Button>
        </Link>
      </div>

      <Modal
        open={cancelId !== null}
        onClose={() => setCancelId(null)}
        title="Cancel this Smart Sweep?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setCancelId(null)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (cancelId) cancelMandate(cancelId)
                setCancelId(null)
                setDone('Smart Sweep cancelled')
              }}
            >
              Yes, cancel
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink/75">
          Automatic collection will stop. Any amount already swept stays applied to the bill.
        </p>
      </Modal>

      <Modal
        open={cancelTiming}
        onClose={() => setCancelTiming(false)}
        title="Turn off Payment Timing?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setCancelTiming(false)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                toggleTiming(false)
                setCancelTiming(false)
                setDone('Payment Timing turned off')
              }}
            >
              Turn off
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink/75">
          Xena will return to collecting your bills on their fixed due dates.
        </p>
      </Modal>

      <SuccessModal open={done !== ''} onClose={() => setDone('')} title="Done" message={done} />
    </div>
  )
}
