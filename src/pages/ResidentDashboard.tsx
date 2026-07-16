import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'
import StatusTag from '../components/StatusTag'
import StandingCard from '../components/StandingCard'
import { EmptyState } from '../components/states'
import { useApp } from '../context/AppContext'
import { formatNaira, formatDate } from '../mockData'
import { ContributorProfile } from '../services/prediction/types'
import { useFakeLoad } from '../hooks/useFakeLoad'

export default function ResidentDashboard() {
  const { user, bills, projects, activeStreetId, getStreetName, walletBalance } = useApp()
  const loading = useFakeLoad(600)

  const activeBills = bills.filter((b) => b.status !== 'paid')
  const streetProject = projects.find(
    (p) => p.streetId === activeStreetId && p.status === 'active',
  )

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
      <PageHeader title={`Welcome, ${user?.firstName ?? ''}`} subtitle={getStreetName(activeStreetId)} />

      <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8 lg:py-7 px-5 py-5">
        {/* Wallet summary */}
        <Card className="bg-olive text-card border-0 mb-5">
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

        <div className="lg:grid lg:grid-cols-3 lg:gap-5 space-y-5 lg:space-y-0">
          {/* Street standing: AI-derived reliability + next contribution */}
          <div className="lg:col-span-3">
            <StandingCard profile={profile} />
          </div>

          {/* Bills */}
          {/* Bills */}
          {loading ? (
            <div className="lg:col-span-2 card-base p-6 text-center text-ink/50 text-sm">
              Loading your bills…
            </div>
          ) : activeBills.length === 0 ? (
            <div className="lg:col-span-2">
              <EmptyState
                title="No active bills"
                message="You’re all caught up. When a new bill lands on Abak Road we’ll show it here."
                icon={
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              />
            </div>
          ) : (
            <section className="lg:col-span-2">
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

          {/* Community project */}
          <section className="lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif text-lg text-ink">Community</h2>
              <Link to="/community" className="text-xs text-terracotta font-medium">
                Details
              </Link>
            </div>
            {streetProject ? (
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
            ) : (
              <Card className="text-sm text-ink/55">
                No active project on your street right now.
              </Card>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
