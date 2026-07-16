import { Link } from 'react-router-dom'
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import ToggleSwitch from '../components/ToggleSwitch'
import StandingCard from '../components/StandingCard'
import Modal, { SuccessModal } from '../components/Modal'
import { useApp } from '../context/AppContext'
import { formatNaira, simulateBvnAccounts, LinkedAccount } from '../mockData'
import { ContributorProfile } from '../services/prediction/types'
import { useGame, BADGES } from '../game'
import GameStrip from '../game/components/GameStrip'
import BadgeShelf from '../game/components/BadgeShelf'
import QuestTrail from '../game/components/QuestTrail'

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
    linkedAccounts,
    connectBanks,
    disconnectBanks,
  } = useApp()
  const game = useGame()

  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelTiming, setCancelTiming] = useState(false)
  const [done, setDone] = useState('')

  // Open Banking link flow (simulated)
  const [bvnLinkOpen, setBvnLinkOpen] = useState(false)
  const [bvnInput, setBvnInput] = useState('')
  const [bvnError, setBvnError] = useState<string | null>(null)
  const [simAccounts, setSimAccounts] = useState<LinkedAccount[]>([])
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [linking, setLinking] = useState(false)

  const bvnDigits = bvnInput.replace(/\D/g, '')
  const bvnOk = bvnDigits.length === 11

  const startLink = () => {
    setBvnLinkOpen(true)
    setBvnError(null)
    setSimAccounts([])
    setPicked(new Set())
  }

  const runLookup = () => {
    if (!bvnOk) return
    setBvnError(null)
    const accounts = simulateBvnAccounts(bvnDigits)
    setSimAccounts(accounts)
    setPicked(new Set(accounts.map((a) => a.accountNumber)))
  }

  const togglePick = (num: string) => {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(num)) next.delete(num)
      else next.add(num)
      return next
    })
  }

  const confirmLink = () => {
    const chosen = simAccounts.filter((a) => picked.has(a.accountNumber))
    if (chosen.length === 0) return
    setLinking(true)
    setTimeout(() => {
      connectBanks(bvnDigits, chosen)
      setLinking(false)
      setBvnLinkOpen(false)
      setSimAccounts([])
      setPicked(new Set())
      setBvnInput('')
      setDone(`Linked ${chosen.length} bank${chosen.length > 1 ? 's' : ''} via Open Banking`)
    }, 500)
  }

  const turnOff = () => {
    disconnectBanks()
    setBvnLinkOpen(false)
    setSimAccounts([])
    setPicked(new Set())
    setBvnInput('')
    setDone('Banks disconnected')
  }

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

      <div className="w-full lg:max-w-6xl lg:mx-auto lg:px-8 lg:py-7 px-5 py-5 space-y-4">
        <GameStrip />
        <section className="space-y-4">
          <h2 className="font-serif text-lg text-ink">Account</h2>

          <Card className="relative">
            <Link
              to="/profile/edit"
              aria-label="Edit profile"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink/55 hover:bg-warmgray/60 hover:text-ink transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-terracotta text-card flex items-center justify-center font-serif text-lg font-semibold">
                {user?.firstName?.[0] ?? 'X'}
              </div>
              <div>
                <p className="font-medium text-ink">{user?.name}</p>
                <p className="text-xs text-ink/55">{user?.phone}</p>
                <p className="text-xs text-ink/55">{getStreetName(activeStreetId)}</p>
                {user?.address && <p className="text-xs text-ink/55">{user.address}</p>}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="label-text">Linked banks</p>
                <p className="font-medium text-ink mt-0.5">
                  {linkedAccounts.length > 0
                    ? `${linkedAccounts.length} bank${linkedAccounts.length > 1 ? 's' : ''} connected`
                    : 'None yet'}
                </p>
                <p className="text-xs text-ink/55">
                  {linkedAccounts[0]?.accountName ?? user?.accountName ?? 'Open Banking (simulated)'}
                </p>
              </div>
              <ToggleSwitch
                checked={linkedAccounts.length > 0}
                onChange={(on) => (on ? startLink() : turnOff())}
                label="Connect banks via Open Banking"
              />
            </div>

            {linkedAccounts.length > 0 && (
              <div className="mt-3 space-y-2">
                {linkedAccounts.map((a) => (
                  <div
                    key={a.accountNumber}
                    className="flex items-center justify-between rounded-btn border border-warmgray bg-sand px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{a.bank}</p>
                      <p className="text-xs text-ink/55 num">{a.accountNumber}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-olive font-medium">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Linked
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11px] text-ink/45 mt-3">Secured via Open Banking · read-only access</p>

            {bvnLinkOpen && (
              <div className="mt-4 border-t border-warmgray pt-4 space-y-3">
                {simAccounts.length === 0 ? (
                  <>
                    <Input
                      id="bvn"
                      label="Bank Verification Number"
                      type="otp"
                      placeholder="11 digits"
                      value={bvnInput}
                      onChange={(e) => setBvnInput(e.target.value)}
                      maxLength={11}
                      trailing={
                        bvnOk ? (
                          <span className="text-olive font-medium text-xs">Ready</span>
                        ) : (
                          <span className="text-ink/30 text-sm">{bvnDigits.length}/11</span>
                        )
                      }
                    />
                    {bvnError && <p className="text-sm text-red-500">{bvnError}</p>}
                    <Button size="sm" fullWidth disabled={!bvnOk} onClick={runLookup}>
                      Find my banks
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="label-text">Pick the accounts to link</p>
                    <div className="space-y-2">
                      {simAccounts.map((a) => {
                        const on = picked.has(a.accountNumber)
                        return (
                          <button
                            key={a.accountNumber}
                            onClick={() => togglePick(a.accountNumber)}
                            className={`w-full text-left rounded-btn border px-3 py-2.5 transition-all ${
                              on ? 'border-terracotta bg-terracotta/5' : 'border-warmgray bg-card'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-ink">{a.bank}</p>
                                <p className="text-xs text-ink/55 num">{a.accountNumber}</p>
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
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setBvnLinkOpen(false); setSimAccounts([]); setPicked(new Set()) }}>
                        Cancel
                      </Button>
                      <Button size="sm" fullWidth disabled={picked.size === 0 || linking} onClick={confirmLink}>
                        {linking ? 'Linking…' : `Link ${picked.size} bank${picked.size > 1 ? 's' : ''}`}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </Card>

          <StandingCard profile={profile} />
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-lg text-ink">Street standing</h2>
          <Card className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-ink/60">
                You are a <span className="font-semibold text-olive">{game.rank.label}</span> with a{' '}
                {game.reliabilityScore}/100 reliability score.
              </p>
            </div>
            <div>
              <p className="label-text mb-2">Quests</p>
              <QuestTrail quests={game.quests} />
            </div>
            <hr className="flame-rule" />
            <div>
              <p className="label-text mb-2">
                Badges · {game.badges.length}/{BADGES.length}
              </p>
              <BadgeShelf badges={game.badges} all={BADGES} />
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-lg text-ink">Mandates</h2>

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
