import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { useFakeLoad } from '../hooks/useFakeLoad'

export default function Voting() {
  const { votes, activeStreetId, castVote, user } = useApp()
  const loading = useFakeLoad(600)

  const streetVotes = votes.filter((v) => v.streetId === activeStreetId)
  const maxVotes = Math.max(1, ...streetVotes.map((v) => v.votes))

  return (
    <div className="pb-4">
      <PageHeader title="Vote" subtitle="Choose your street’s next project" backTo="/app" />

      <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8 lg:py-7 px-5 py-5 space-y-4">
        {loading ? (
          <div className="card-base p-6 text-center text-ink/50 text-sm">Loading proposals…</div>
        ) : (
          <div className="space-y-3">
            {streetVotes.map((v) => {
              const voted = v.votedBy.includes(user?.id ?? '')
              const pct = Math.round((v.votes / maxVotes) * 100)
              return (
                <Card key={v.id}>
                  <p className="font-medium text-ink">{v.title}</p>
                  <p className="text-sm text-ink/60 mt-1">{v.description}</p>

                  <div className="mt-3 h-2 w-full bg-warmgray rounded-full overflow-hidden">
                    <div
                      className="h-full bg-olive rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="num text-ink/80">{v.votes} votes</span>
                    <Button
                      size="sm"
                      variant={voted ? 'secondary' : 'primary'}
                      disabled={voted}
                      onClick={() => castVote(v.id)}
                    >
                      {voted ? 'Voted ✓' : 'Vote'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
        <p className="text-xs text-ink/45 text-center">
          One vote per resident. You can change your mind by refreshing the demo.
        </p>
      </div>
    </div>
  )
}
