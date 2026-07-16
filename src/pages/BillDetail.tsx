import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import StatusTag from '../components/StatusTag'
import Modal, { SuccessModal } from '../components/Modal'
import { useApp } from '../context/AppContext'
import { browserEngine, streetRankForScore } from '../services/prediction/engine'
import { ContributorProfile } from '../services/prediction/types'
import { formatNaira, formatDate } from '../mockData'
import GameStrip from '../game/components/GameStrip'

export default function BillDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bills, payBill, setBillSmartSweep, walletBalance, user, activeStreetId } = useApp()
  const bill = bills.find((b) => b.id === id)

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
  const reliability = browserEngine.scoreReliability(profile)
  const rank = streetRankForScore(reliability.score)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [sweepOpen, setSweepOpen] = useState(false)
  const [sweepSuccess, setSweepSuccess] = useState(false)

  if (!bill) {
    return (
      <div>
        <PageHeader title="Bill" backTo="/bills" />
        <div className="w-full lg:max-w-6xl lg:mx-auto lg:px-8 lg:py-7 px-5 py-10 text-center text-ink/60">
          Bill not found.
        </div>
      </div>
    )
  }

  // Processing fee follows the resident's reliability tier (AI-derived).
  const FEE = Math.max(10, Math.round(bill.amount * reliability.tier.rate))

  const breakdown = [
    { label: 'Base amount', value: bill.amount - FEE },
    { label: 'Processing fee', value: FEE },
  ]

  const doPay = () => {
    payBill(bill.id)
    setConfirmOpen(false)
    setSuccess(true)
  }

  const toggleSweep = () => {
    setBillSmartSweep(bill.id, !bill.smartSweepActive)
    setSweepOpen(false)
    setSweepSuccess(true)
  }

  return (
    <div className="pb-4">
      <PageHeader title={bill.type} subtitle={bill.provider} backTo="/bills" />

      <div className="w-full lg:max-w-6xl lg:mx-auto lg:px-8 lg:py-7 px-5 py-5 space-y-4">
        <GameStrip />
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink/60">Amount due</span>
            <StatusTag status={bill.status} />
          </div>
          <p className="num-lg text-ink mt-1">{formatNaira(bill.amount)}</p>
          <p className="text-xs text-ink/55 mt-2">Due {formatDate(bill.dueDate)}</p>
        </Card>

        {bill.smartSweepActive && (
          <Card className="bg-terracotta/5 border-terracotta/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-terracotta">Smart Sweep active</p>
                <p className="text-xs text-ink/65 mt-0.5">
                  {formatNaira(bill.smartSweepCollected ?? 0)} collected so far
                </p>
              </div>
              <Link to={`/smart-sweep/${bill.id}`}>
                <Button variant="secondary" size="sm">
                  Manage
                </Button>
              </Link>
            </div>
            <div className="mt-3">
              <div className="h-2 w-full bg-warmgray rounded-full overflow-hidden">
                <div
                  className="h-full bg-terracotta rounded-full"
                  style={{
                    width: `${Math.min(100, ((bill.smartSweepCollected ?? 0) / bill.amount) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </Card>
        )}

        <Card>
          <p className="label-text mb-2">Breakdown</p>
          <div className="space-y-1.5 text-sm">
            {breakdown.map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-ink/70">{row.label}</span>
                <span className="num">{formatNaira(row.value)}</span>
              </div>
            ))}
            <div className="border-t border-warmgray my-1.5" />
            <div className="flex justify-between font-medium">
              <span className="text-ink">Total</span>
              <span className="num text-ink">{formatNaira(bill.amount)}</span>
            </div>
          </div>
          <p className="text-[11px] text-olive font-medium mt-2">
            Your {rank.label} standing ({reliability.score}/100) earns the {reliability.tier.label} fee of{' '}
            {(reliability.tier.rate * 100).toFixed(1)}%.
          </p>
        </Card>

        <Card className="bg-sand border-warmgray">
          <div className="flex items-start gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3F4B2B" strokeWidth="1.8" className="mt-0.5 shrink-0">
              <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <div>
              <p className="text-xs font-medium text-olive">Community guarantee</p>
              <p className="text-[11px] text-ink/60 mt-0.5">
                Your street’s sweep reliability keeps this fee fair. Miss a sweep and the rate eases back
                up. Stay on rhythm and it keeps dropping.
              </p>
            </div>
          </div>
        </Card>

        {bill.status !== 'paid' && (
          <div className="space-y-3">
            <Button fullWidth size="lg" onClick={() => setConfirmOpen(true)}>
              Pay {formatNaira(bill.amount)}
            </Button>
            {!bill.smartSweepActive ? (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setSweepOpen(true)}
              >
                Set up Smart Sweep instead
              </Button>
            ) : null}
            {walletBalance < bill.amount && (
              <p className="text-xs text-brick text-center">
                Wallet balance is {formatNaira(walletBalance)}. Top up to pay in full.
              </p>
            )}
          </div>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Pay ${formatNaira(bill.amount)}?`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={doPay} disabled={walletBalance < bill.amount}>
              Confirm & pay
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink/70 mb-3">Here’s exactly what you’ll be charged:</p>
        <div className="bg-sand rounded-btn p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-ink/70">Bill amount</span>
            <span className="num">{formatNaira(bill.amount - FEE)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/70">Processing fee</span>
            <span className="num text-brick">{formatNaira(FEE)}</span>
          </div>
          <div className="border-t border-warmgray my-1" />
          <div className="flex justify-between font-medium">
            <span>Total from wallet</span>
            <span className="num text-terracotta">{formatNaira(bill.amount)}</span>
          </div>
        </div>
        <p className="text-xs text-ink/50 mt-2">
          Your wallet balance after this: {formatNaira(Math.max(0, walletBalance - bill.amount))}
        </p>
      </Modal>

      <Modal
        open={sweepOpen}
        onClose={() => setSweepOpen(false)}
        title="Set up Smart Sweep"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setSweepOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={toggleSweep}>
              Turn on Smart Sweep
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink/75">
          Xena will collect small amounts toward this {bill.type.toLowerCase()} bill whenever your
          balance stays above ₦2,000, up to <span className="num">₦500</span> at a time, capped at the
          bill total. You can pause or cancel anytime.
        </p>
        <p className="text-xs text-ink/50 mt-2">
          No fee is charged for Smart Sweep collections.
        </p>
      </Modal>

      <SuccessModal
        open={success}
        onClose={() => navigate('/bills')}
        title="Payment sent"
        message={`Your ${bill.type.toLowerCase()} bill is now marked paid.`}
        detail={formatNaira(bill.amount)}
      />
      <SuccessModal
        open={sweepSuccess}
        onClose={() => setSweepSuccess(false)}
        title={bill.smartSweepActive ? 'Smart Sweep on' : 'Smart Sweep off'}
        message={
          bill.smartSweepActive
            ? 'Xena will start collecting small amounts automatically.'
            : 'Automatic collection has been stopped for this bill.'
        }
      />
    </div>
  )
}
