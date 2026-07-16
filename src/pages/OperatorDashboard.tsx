import TopNav from '../components/TopNav'
import Card from '../components/Card'
import FlameRing from '../components/FlameRing'
import ChartWrapper from '../components/ChartWrapper'
import StatusTag from '../components/StatusTag'
import FraudQueue from '../components/FraudQueue'
import { useFakeLoad } from '../hooks/useFakeLoad'
import { LoadingState } from '../components/states'
import { useApp } from '../context/AppContext'
import { browserEngine } from '../services/prediction/engine'
import { FraudInputWorker, WorkerPayoutRecord } from '../services/prediction/types'
import { operatorWeekIncome, operatorStreets, routeStops, formatNaira } from '../mockData'

export default function OperatorDashboard() {
  const loading = useFakeLoad(800)
  const { workerQueue } = useApp()

  const totalExpected = operatorWeekIncome.reduce((s, d) => s + d.amount, 0)
  const collected = operatorStreets.reduce((s, st) => s + st.collected, 0)
  const expectedAll = operatorStreets.reduce((s, st) => s + st.expected, 0)
  const toService = routeStops.filter((r) => r.confirmed).length

  const fraudWorkers: FraudInputWorker[] = workerQueue.map((w) => ({
    id: w.id,
    name: w.name,
    street: w.street,
    city: w.city ?? '',
    wallet: w.wallet,
    payoutAmount: w.payoutAmount,
    joinedAt: w.joinedAt,
  }))
  const fraudPayouts: WorkerPayoutRecord[] = workerQueue
    .filter((w) => w.payoutAmount)
    .map((w) => ({
      id: `p-${w.id}`,
      workerId: w.id,
      wallet: w.wallet ?? '',
      amount: w.payoutAmount ?? 0,
      at: w.joinedAt ?? new Date().toISOString(),
      streetId: w.street,
      city: w.city ?? '',
    }))
  const fraudFlags = browserEngine.detectFraud({
    workers: fraudWorkers,
    payouts: fraudPayouts,
  })

  if (loading) {
    return (
      <div>
        <TopNav title="Trash Company · Uyo" />
        <LoadingState label="Loading operator dashboard…" />
      </div>
    )
  }

  return (
    <div className="pb-10">
      <TopNav title="Trash Company · Uyo" subtitle="Weekly operations" />

      <div className="max-w-6xl mx-auto px-5 py-6 space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-olive text-card border-0">
            <p className="text-xs text-card/70">Expected this week</p>
            <p className="num-lg text-card mt-1">{formatNaira(totalExpected)}</p>
          </Card>
          <Card>
            <p className="label-text">Collected</p>
            <div className="mt-2 flex items-center gap-3">
              <FlameRing value={collected} max={expectedAll} size={64} />
              <div>
                <p className="num text-olive">{formatNaira(collected)}</p>
                <p className="text-xs text-ink/50 mt-0.5">
                  {Math.round((collected / expectedAll) * 100)}% of target
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <p className="label-text">Streets paid</p>
            <p className="num-lg text-ink mt-1">
              {operatorStreets.filter((s) => s.status === 'paid').length}
              <span className="text-sm text-ink/50">/{operatorStreets.length}</span>
            </p>
          </Card>
          <Card>
            <p className="label-text">Routes to run</p>
            <p className="num-lg text-terracotta mt-1">{toService}</p>
            <p className="text-xs text-ink/50 mt-1">fully confirmed</p>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-serif text-lg text-ink">Expected income · this week</h2>
          </div>
          <ChartWrapper type="area" data={operatorWeekIncome} xKey="day" yKey="amount" color="#C1552C" />
        </Card>

        {/* Streets payment status */}
        <section>
          <h2 className="font-serif text-lg text-ink mb-2">Streets &amp; payment status</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {operatorStreets.map((st) => (
              <Card key={st.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink">{st.name}</p>
                    <p className="text-xs text-ink/55">
                      {st.households} households · {st.city}
                    </p>
                  </div>
                  <StatusTag
                    status={st.status === 'paid' ? 'paid' : st.status === 'partial' ? 'pending' : 'overdue'}
                    label={st.status === 'paid' ? 'Paid' : st.status === 'partial' ? 'Partial' : 'Unpaid'}
                  />
                </div>
                <div className="mt-3 h-2 w-full bg-warmgray rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      st.status === 'paid' ? 'bg-olive' : st.status === 'partial' ? 'bg-gold' : 'bg-brick'
                    }`}
                    style={{ width: `${Math.round((st.collected / st.expected) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-ink/60">
                  <span className="num text-ink/80">{formatNaira(st.collected)}</span>
                  <span>of {formatNaira(st.expected)}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Route planning */}
        <section>
          <h2 className="font-serif text-lg text-ink mb-2">Route planning</h2>
          <p className="text-xs text-ink/55 mb-3">
            Streets are serviced only after payment is fully confirmed.
          </p>
          <div className="space-y-2">
            {routeStops.map((r) => (
              <Card key={r.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center ${
                      r.confirmed ? 'bg-olive/10 text-olive' : 'bg-warmgray/60 text-ink/40'
                    }`}
                  >
                    {r.confirmed ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span className="text-sm">•</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-ink">{r.streetName}</p>
                    <p className="text-xs text-ink/55">{r.bins} bins · {r.note}</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    r.confirmed ? 'bg-olive/10 text-olive' : 'bg-gold/15 text-[#8a6516]'
                  }`}
                >
                  {r.confirmed ? 'Confirmed' : 'Awaiting'}
                </span>
              </Card>
            ))}
          </div>
        </section>

        <FraudQueue flags={fraudFlags} title="Worker fraud review" />
      </div>
    </div>
  )
}
