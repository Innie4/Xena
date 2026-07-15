import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'
import StatusTag from '../components/StatusTag'
import { EmptyState } from '../components/states'
import { useApp } from '../context/AppContext'
import { formatNaira, formatDate } from '../mockData'
import { useFakeLoad } from '../hooks/useFakeLoad'

export default function ResidentDashboard() {
  const { user, bills, projects, activeStreetId, getStreetName, walletBalance } = useApp()
  const loading = useFakeLoad(600)

  const activeBills = bills.filter((b) => b.status !== 'paid')
  const streetProject = projects.find(
    (p) => p.streetId === activeStreetId && p.status === 'active',
  )

  return (
    <div className="pb-4">
      <PageHeader title={`Welcome, ${user?.firstName ?? ''}`} subtitle={getStreetName(activeStreetId)} />

      <div className="max-w-md mx-auto px-5 py-5 space-y-5">
        {/* Wallet summary */}
        <Card className="bg-olive text-card border-0">
          <p className="text-xs text-card/70">Wallet balance</p>
          <p className="num-lg text-card mt-0.5">{formatNaira(walletBalance)}</p>
          <div className="flex gap-3 mt-3">
            <Link
              to="/community"
              className="text-xs bg-card/15 rounded-btn px-3 py-1.5 hover:bg-card/25 transition-colors"
            >
              View community
            </Link>
            <Link
              to="/vote"
              className="text-xs bg-card/15 rounded-btn px-3 py-1.5 hover:bg-card/25 transition-colors"
            >
              Vote on projects
            </Link>
          </div>
        </Card>

        {loading ? (
          <div className="card-base p-6 text-center text-ink/50 text-sm">Loading your bills…</div>
        ) : activeBills.length === 0 ? (
          <EmptyState
            title="No active bills"
            message="You’re all caught up. When a new bill lands on Abak Road we’ll show it here."
            icon={
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        ) : (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif text-lg text-ink">Your bills</h2>
              <Link to="/bills" className="text-xs text-terracotta font-medium">
                See all
              </Link>
            </div>
            <div className="space-y-3">
              {activeBills.map((b) => (
                <Link key={b.id} to={`/bills/${b.id}`}>
                  <Card className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-ink">{b.type}</p>
                      <p className="text-xs text-ink/55">
                        {b.provider} · Due {formatDate(b.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="num text-terracotta">{formatNaira(b.amount)}</p>
                      <div className="mt-1">
                        <StatusTag status={b.status} />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {streetProject && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif text-lg text-ink">Community project</h2>
              <Link to="/community" className="text-xs text-terracotta font-medium">
                Details
              </Link>
            </div>
            <Link to={`/community/${streetProject.id}`}>
              <Card>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink">{streetProject.title}</p>
                  <span className="text-xs text-ink/50">{streetProject.daysRemaining} days left</span>
                </div>
                <p className="text-xs text-ink/55 mt-1">
                  {formatNaira(streetProject.raised)} of {formatNaira(streetProject.goal)} raised
                </p>
                <div className="mt-3">
                  <ProgressBar value={streetProject.raised} max={streetProject.goal} size="sm" />
                </div>
              </Card>
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}
