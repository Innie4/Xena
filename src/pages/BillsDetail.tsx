import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import StatusTag from '../components/StatusTag'
import { EmptyState } from '../components/states'
import { useApp } from '../context/AppContext'
import { formatNaira, formatDate } from '../mockData'
import { useFakeLoad } from '../hooks/useFakeLoad'

export default function BillsDetail() {
  const { bills } = useApp()
  const loading = useFakeLoad(700)

  const sorted = [...bills].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const totalDue = bills
    .filter((b) => b.status !== 'paid')
    .reduce((s, b) => s + b.amount, 0)

  return (
    <div className="pb-4">
      <PageHeader title="Bills" subtitle="Everything you owe, in one place" backTo="/app" />

      <div className="max-w-md mx-auto px-5 py-5 space-y-4">
        {loading ? (
          <div className="card-base p-6 text-center text-ink/50 text-sm">Loading your bills…</div>
        ) : bills.length === 0 ? (
          <EmptyState
            title="No bills yet"
            message="When your street raises a shared bill, it will appear here."
          />
        ) : (
          <>
            <Card className="flex items-center justify-between bg-sand border-warmgray">
              <div>
                <p className="text-xs text-ink/60">Outstanding</p>
                <p className="num-lg text-terracotta mt-0.5">{formatNaira(totalDue)}</p>
              </div>
              <div className="text-right text-xs text-ink/55">
                <p>{bills.filter((b) => b.status === 'paid').length} paid</p>
                <p>{bills.filter((b) => b.status !== 'paid').length} open</p>
              </div>
            </Card>

            <div className="space-y-3">
              {sorted.map((b) => (
                <Link key={b.id} to={`/bills/${b.id}`}>
                  <Card className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-ink">{b.type}</p>
                      <p className="text-xs text-ink/55">
                        {b.provider}
                        {b.smartSweepActive && ' · Smart Sweep on'}
                      </p>
                      <p className="text-xs text-ink/45 mt-0.5">Due {formatDate(b.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="num">{formatNaira(b.amount)}</p>
                      <div className="mt-1">
                        <StatusTag status={b.status} />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
