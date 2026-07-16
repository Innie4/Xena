import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import FlameRing from '../components/FlameRing'
import { EmptyState } from '../components/states'
import { useApp } from '../context/AppContext'
import { browserEngine, streetRankForScore } from '../services/prediction/engine'
import { ContributorProfile } from '../services/prediction/types'
import { formatNaira } from '../mockData'
import { useFakeLoad } from '../hooks/useFakeLoad'

export default function CommunityProjects() {
  const { projects, activeStreetId, getStreetName, user } = useApp()
  const loading = useFakeLoad(700)

  const streetProjects = projects.filter((p) => p.streetId === activeStreetId)

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

  return (
    <div className="pb-4">
      <PageHeader
        title="Community"
        subtitle={getStreetName(activeStreetId)}
        backTo="/app"
      />

      <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8 lg:py-7 px-5 py-5 space-y-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="font-medium text-ink">{streetProjects.filter((p) => p.status === 'active').length} active</p>
            <p className="text-xs text-ink/55">projects on your street</p>
          </div>
          <Link to="/vote">
            <span className="text-xs text-terracotta font-medium">Vote on next →</span>
          </Link>
        </Card>

        <Card className="bg-olive/5 border-olive/20">
          <div className="flex items-start gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3F4B2B" strokeWidth="1.8" className="mt-0.5 shrink-0">
              <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <div>
              <p className="text-xs font-medium text-olive">Community guarantee</p>
              <p className="text-[11px] text-ink/60 mt-0.5">
                Your {rank.label} standing ({reliability.score}/100) keeps this street’s project financing
                at the {reliability.tier.label} rate of {(reliability.tier.rate * 100).toFixed(1)}%. Sweep
                on rhythm and the whole street pays less.
              </p>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="card-base p-6 text-center text-ink/50 text-sm">Loading projects…</div>
        ) : streetProjects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            message="Your street hasn’t started a waste project. Propose one in the voting screen."
          />
        ) : (
          <div className="space-y-3">
            {streetProjects.map((p) => (
              <Link key={p.id} to={`/community/${p.id}`}>
                <Card>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-terracotta">
                      {p.category}
                    </span>
                    {p.status === 'active' ? (
                      <span className="text-xs text-ink/50">{p.daysRemaining} days left</span>
                    ) : (
                      <span className="text-xs text-olive font-medium">
                        {p.status === 'funded' ? 'Funded' : 'Completed'}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-ink mt-1">{p.title}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <FlameRing value={p.raised} max={p.goal} size={56} strokeWidth={6} showPercent />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-ink/60">
                        <span className="num text-ink/80">{formatNaira(p.raised)} raised</span>
                        <span>{formatNaira(p.goal - p.raised)} to go</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
