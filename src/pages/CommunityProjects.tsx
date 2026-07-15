import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'
import { EmptyState } from '../components/states'
import { useApp } from '../context/AppContext'
import { formatNaira } from '../mockData'
import { useFakeLoad } from '../hooks/useFakeLoad'

export default function CommunityProjects() {
  const { projects, activeStreetId, getStreetName } = useApp()
  const loading = useFakeLoad(700)

  const streetProjects = projects.filter((p) => p.streetId === activeStreetId)

  return (
    <div className="pb-4">
      <PageHeader
        title="Community"
        subtitle={getStreetName(activeStreetId)}
        backTo="/app"
      />

      <div className="max-w-md mx-auto px-5 py-5 space-y-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="font-medium text-ink">{streetProjects.filter((p) => p.status === 'active').length} active</p>
            <p className="text-xs text-ink/55">projects on your street</p>
          </div>
          <Link to="/vote">
            <span className="text-xs text-terracotta font-medium">Vote on next →</span>
          </Link>
        </Card>

        {loading ? (
          <div className="card-base p-6 text-center text-ink/50 text-sm">Loading projects…</div>
        ) : streetProjects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            message="Your street hasn’t started a community project. Propose one in the voting screen."
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
                  <div className="mt-3">
                    <ProgressBar value={p.raised} max={p.goal} size="sm" />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-ink/60">
                    <span className="num text-ink/80">{formatNaira(p.raised)} raised</span>
                    <span>{formatNaira(p.goal - p.raised)} to go</span>
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
