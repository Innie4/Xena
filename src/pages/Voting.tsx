import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import CountdownRing from '../components/CountdownRing'
import AvatarStack from '../components/AvatarStack'
import ResolvedBanner from '../components/ResolvedBanner'
import { useApp } from '../context/AppContext'
import { formatNaira } from '../mockData'
import { useFakeLoad } from '../hooks/useFakeLoad'

export default function Voting() {
  const { proposals, contacts, activeStreetId, user, castProposalVote } = useApp()
  const loading = useFakeLoad(600)

  const streetProposals = proposals.filter((p) => p.streetId === activeStreetId)
  const open = streetProposals.filter((p) => p.status === 'open')
  const resolved = streetProposals.filter((p) => p.status !== 'open')
  const leaderVotes = open.length ? Math.max(...open.map((p) => p.votes)) : 0
  const leaderId = open.length ? open.reduce((a, b) => (b.votes > a.votes ? b : a)).id : ''

  const nameFor = (id: string) => contacts.find((c) => c.id === id)?.name ?? 'Someone'

  return (
    <div className="pb-4">
      <PageHeader title="Vote" subtitle="Fund the next street project" backTo="/app" />

      <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8 lg:py-7 px-5 py-5 space-y-4">
        <ResolvedBanner />

        {loading ? (
          <div className="card-base p-6 text-center text-ink/50 text-sm">Loading proposals…</div>
        ) : (
          <>
            {open.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-serif text-lg text-ink">Open proposals</h2>
                {open.map((p) => {
                  const voted = p.votedBy.includes(user?.id ?? '')
                  const isLeader = p.id === leaderId
                  const pct = leaderVotes ? Math.round((p.votes / leaderVotes) * 100) : 0
                  return (
                    <Card key={p.id} className={isLeader ? 'border-gold/50 bg-gold/5' : ''}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium uppercase tracking-wide text-terracotta">
                              {p.category}
                            </span>
                            {isLeader && (
                              <span className="text-[11px] font-medium text-[#8a6516] bg-gold/20 px-2 py-0.5 rounded-full">
                                Leading
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-ink mt-1">{p.title}</p>
                          <p className="text-sm text-ink/60 mt-1">{p.description}</p>
                          <p className="text-xs text-ink/55 mt-1.5">
                            Proposed by {p.proposerName} · {formatNaira(p.estimatedCost)} est.
                          </p>
                        </div>
                        <CountdownRing deadline={p.deadline} startedAt={p.startedAt} />
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <AvatarStack names={p.voters.map(nameFor)} />
                        <span className="text-xs text-ink/50">{p.voters.length} invited</span>
                      </div>

                      <div className="mt-3 h-2 w-full bg-warmgray rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isLeader ? 'bg-gold' : 'bg-olive'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="num text-ink/80">{p.votes} votes</span>
                        <Button
                          size="sm"
                          variant={voted ? 'secondary' : 'primary'}
                          disabled={voted}
                          onClick={() => castProposalVote(p.id)}
                        >
                          {voted ? 'Voted ✓' : 'Vote'}
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </section>
            )}

            {resolved.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-serif text-lg text-ink">Past votes</h2>
                {resolved.map((p) => {
                  const won = p.status === 'won'
                  return (
                    <Card key={p.id} className={won ? 'border-gold/50 bg-gold/5' : 'opacity-80'}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium uppercase tracking-wide text-terracotta">
                              {p.category}
                            </span>
                            {won ? (
                              <span className="text-[11px] font-medium text-[#8a6516] bg-gold/20 px-2 py-0.5 rounded-full">
                                Won
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-ink/50 bg-warmgray px-2 py-0.5 rounded-full">
                                Lost
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-ink mt-1">{p.title}</p>
                          <p className="text-sm text-ink/60 mt-1">{p.description}</p>
                          <p className="text-xs text-ink/55 mt-1.5">
                            {p.votes} votes · {formatNaira(p.estimatedCost)} est.
                          </p>
                        </div>
                        {won && (
                          <div className="h-9 w-9 shrink-0 rounded-full bg-gold/20 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D9A441" strokeWidth="2.5">
                              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {won && (
                        <div className="mt-3 flex gap-4 text-xs font-medium">
                          {p.winnerBillId && (
                            <Link to="/bills" className="text-terracotta hover:text-terracotta-dark">
                              View bill →
                            </Link>
                          )}
                          {p.winnerProjectId && (
                            <Link to="/community" className="text-terracotta hover:text-terracotta-dark">
                              View project →
                            </Link>
                          )}
                        </div>
                      )}
                    </Card>
                  )
                })}
              </section>
            )}

            {streetProposals.length === 0 && (
              <Card className="text-sm text-ink/60">No proposals yet. Tap Propose to start one.</Card>
            )}
          </>
        )}
        <p className="text-xs text-ink/45 text-center">
          One vote per resident. The top proposal when the timer ends becomes a bill and a community
          project.
        </p>
      </div>
    </div>
  )
}
