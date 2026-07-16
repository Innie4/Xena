import type {
  User,
  Bill,
  CommunityProject,
  Proposal,
  SmartSweepMandate,
  VoteOption,
} from '../mockData'
import { browserEngine, streetRankForScore } from '../services/prediction/engine'
import type { ContributorProfile } from '../services/prediction/types'
import type {
  GameState,
  GameLevel,
  GameRank,
  BadgeDef,
  EarnedBadge,
  QuestDef,
  QuestStep,
} from './types'

export const LEVELS: GameLevel[] = [
  { level: 1, title: 'Ember', minSparks: 0, blurb: 'The hearth is lit. Keep feeding it.' },
  { level: 2, title: 'Hearth Tender', minSparks: 150, blurb: 'You tend the street’s fire.' },
  { level: 3, title: 'Flamekeeper', minSparks: 400, blurb: 'A steady hand at the flame.' },
  { level: 4, title: 'Street Keeper', minSparks: 800, blurb: 'The lane leans on you.' },
  { level: 5, title: 'Hearth Warden', minSparks: 1400, blurb: 'Guardian of the gathering.' },
  { level: 6, title: 'Bonfire', minSparks: 2200, blurb: 'Your warmth reaches the whole street.' },
  { level: 7, title: 'Legend of the Lane', minSparks: 3200, blurb: 'Stories are told of your sweep.' },
]

export const BADGES: BadgeDef[] = [
  { id: 'first-sweep', label: 'First Sweep', blurb: 'Made your first contribution.', category: 'milestone', glyph: 'S' },
  { id: 'monthly-keeper', label: 'Monthly Keeper', blurb: 'Kept a 3-month rhythm.', category: 'streak', glyph: 'M' },
  { id: 'smart-sweep', label: 'Smart Sweep', blurb: 'Set up an automatic sweep.', category: 'milestone', glyph: 'A' },
  { id: 'community-heart', label: 'Community Heart', blurb: 'Gave to a street project.', category: 'community', glyph: 'C' },
  { id: 'voice', label: 'Voice of the Street', blurb: 'Voted on a proposal.', category: 'community', glyph: 'V' },
  { id: 'proposer', label: 'Proposer', blurb: 'Started a street proposal.', category: 'milestone', glyph: 'P' },
  { id: 'all-clear', label: 'All Bills Clear', blurb: 'Cleared every overdue bill.', category: 'milestone', glyph: 'B' },
  { id: 'funder', label: 'Project Funder', blurb: 'Helped a project reach its goal.', category: 'community', glyph: 'F' },
]

const SPARKS = {
  bankLinked: 100,
  contribution: 25,
  communityContribution: 20,
  billPaid: 40,
  smartSweep: 60,
  voteCast: 15,
  proposalCreated: 50,
  projectFunded: 30,
  streakBonus: 8,
}

export interface GameInput {
  user: User | null
  bills: Bill[]
  projects: CommunityProject[]
  proposals: Proposal[]
  sweepMandates: SmartSweepMandate[]
  votes: VoteOption[]
}

interface Derived {
  bankConnected: boolean
  contributionCount: number
  communityContribCount: number
  billsPaid: number
  overdueCount: number
  hasMandate: boolean
  votedAny: boolean
  proposalsCreated: number
  projectsFundedGiven: number
  streak: number
  reliabilityScore: number
  rank: GameRank
}

function levelFor(sparks: number): { level: GameLevel; next: GameLevel | null } {
  let cur = LEVELS[0]
  let next: GameLevel | null = null
  for (let i = 0; i < LEVELS.length; i++) {
    if (LEVELS[i].minSparks <= sparks) {
      cur = LEVELS[i]
      next = LEVELS[i + 1] ?? null
    }
  }
  return { level: cur, next }
}

function buildQuests(d: Derived): QuestDef[] {
  const step = (id: string, label: string, done: boolean): QuestStep => ({ id, label, done })
  return [
    {
      id: 'getting-started',
      title: 'Get started',
      blurb: 'Set the foundations of your street hearth.',
      steps: [
        step('bank', 'Connect your bank', d.bankConnected),
        step('sweep', 'Set up Smart Sweep', d.hasMandate),
        step('contrib', 'Make a contribution', d.contributionCount > 0),
      ],
    },
    {
      id: 'good-neighbour',
      title: 'Be a good neighbour',
      blurb: 'Help decide and build for the street.',
      steps: [
        step('vote', 'Vote on a proposal', d.votedAny),
        step('propose', 'Start a proposal', d.proposalsCreated > 0),
        step('give', 'Fund a community project', d.communityContribCount > 0),
      ],
    },
    {
      id: 'stay-rhythm',
      title: 'Stay on rhythm',
      blurb: 'Keep the sweep steady and the bills clear.',
      steps: [
        step('paid', 'Pay a bill', d.billsPaid > 0),
        step('streak', 'Reach a 3-month streak', d.streak >= 3),
        step('clear', 'Clear every overdue bill', d.overdueCount === 0),
      ],
    },
  ]
}

export function deriveGame(input: GameInput): GameState {
  const { user, bills, projects, proposals, sweepMandates, votes } = input
  const userId = user?.id ?? ''
  const firstName = (user?.firstName ?? '').toLowerCase()
  const contributions = user?.contributions ?? []

  const contributionCount = contributions.length
  const communityContribCount = projects.filter((p) =>
    p.contributors.some((c) => !c.anonymous && c.name.toLowerCase() === firstName),
  ).length
  const billsPaid = bills.filter((b) => b.status === 'paid').length
  const overdueCount = bills.filter((b) => b.status === 'overdue').length
  const hasMandate = sweepMandates.some((m) => m.active)
  const votedOptions = votes.some((v) => v.votedBy.includes(userId))
  const votedProposals = proposals.some((p) => p.votedBy.includes(userId))
  const votedAny = votedOptions || votedProposals
  const proposalsCreated = proposals.filter((p) => p.proposerId === userId).length
  const projectsFundedGiven = projects.filter(
    (p) =>
      (p.status === 'funded' || p.status === 'completed') &&
      p.contributors.some((c) => !c.anonymous && c.name.toLowerCase() === firstName),
  ).length
  const voteCount =
    votes.filter((v) => v.votedBy.includes(userId)).length +
    proposals.filter((p) => p.votedBy.includes(userId)).length

  const profile: ContributorProfile = {
    id: userId,
    name: user?.name ?? '',
    streetId: user?.streetId ?? '',
    events: contributions.map((c) => ({
      id: c.id,
      contributorId: userId,
      amount: c.amount,
      at: c.at,
    })),
  }
  const rel = browserEngine.scoreReliability(profile)
  const reliabilityScore = rel.score
  const streak = rel.recentStreak
  const rank: GameRank = streetRankForScore(reliabilityScore)

  let sparks = 0
  if (user?.bankConnected) sparks += SPARKS.bankLinked
  sparks += contributionCount * SPARKS.contribution
  sparks += communityContribCount * SPARKS.communityContribution
  sparks += billsPaid * SPARKS.billPaid
  if (hasMandate) sparks += SPARKS.smartSweep
  sparks += voteCount * SPARKS.voteCast
  sparks += proposalsCreated * SPARKS.proposalCreated
  sparks += projectsFundedGiven * SPARKS.projectFunded
  sparks += Math.max(0, streak - 1) * SPARKS.streakBonus

  const { level, next } = levelFor(sparks)
  const sparksIntoLevel = sparks - level.minSparks
  const sparksForLevel = next ? next.minSparks - level.minSparks : 1
  const levelProgress = next ? sparksIntoLevel / sparksForLevel : 1

  const d: Derived = {
    bankConnected: !!user?.bankConnected,
    contributionCount,
    communityContribCount,
    billsPaid,
    overdueCount,
    hasMandate,
    votedAny,
    proposalsCreated,
    projectsFundedGiven,
    streak,
    reliabilityScore,
    rank,
  }

  const badges: EarnedBadge[] = []
  const addBadge = (id: string, earnedAt: string) => {
    const def = BADGES.find((b) => b.id === id)
    if (def) badges.push({ ...def, earnedAt })
  }
  if (contributionCount > 0) addBadge('first-sweep', contributions[0]?.at ?? '')
  if (streak >= 3) addBadge('monthly-keeper', contributions[contributions.length - 1]?.at ?? '')
  if (hasMandate) addBadge('smart-sweep', '')
  if (communityContribCount > 0) addBadge('community-heart', '')
  if (votedAny) addBadge('voice', '')
  if (proposalsCreated > 0) addBadge('proposer', '')
  if (overdueCount === 0 && bills.length > 0) addBadge('all-clear', '')
  if (projectsFundedGiven > 0) addBadge('funder', '')

  return {
    sparks,
    level,
    nextLevel: next,
    sparksIntoLevel,
    sparksForLevel,
    levelProgress,
    rank,
    reliabilityScore,
    streak,
    badges,
    quests: buildQuests(d),
  }
}
