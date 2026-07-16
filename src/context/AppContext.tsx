import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import {
  currentUser,
  bills as seedBills,
  communityProjects as seedProjects,
  notifications as seedNotifications,
  smartSweepMandates as seedMandates,
  paymentTiming as seedTiming,
  voteOptions as seedVotes,
  workerQueue as seedWorkers,
  routeStops as seedRoutes,
  seedProposals,
  seedContacts,
  User,
  Bill,
  CommunityProject,
  AppNotification,
  SmartSweepMandate,
  PaymentTiming,
  VoteOption,
  WorkerVerification,
  RouteStop,
  Contributor,
  Proposal,
  Contact,
  ProposalCategory,
  LinkedAccount,
} from '../mockData'

export interface SweepLogEntry {
  id: string
  billId: string
  amount: number
  timestamp: string
}

interface AppState {
  user: User | null
  loggedIn: boolean
  walletBalance: number
  activeStreetId: string
  bills: Bill[]
  projects: CommunityProject[]
  notifications: AppNotification[]
  sweepMandates: SmartSweepMandate[]
  timing: PaymentTiming
  votes: VoteOption[]
  proposals: Proposal[]
  contacts: Contact[]
  proposeOpen: boolean
  lastWinner: { proposalId: string; billId: string; projectId: string; title: string } | null
  workerQueue: WorkerVerification[]
  routeStops: RouteStop[]
  sweepLog: SweepLogEntry[]
  linkedAccounts: LinkedAccount[]
}

interface AppContextValue extends AppState {
  login: (user: User) => void
  logout: () => void
  setActiveStreet: (id: string) => void
  payBill: (billId: string) => void
  setBillSmartSweep: (billId: string, active: boolean) => void
  setMandatePaused: (mandateId: string, paused: boolean) => void
  cancelMandate: (mandateId: string) => void
  collectSweep: (billId: string, amount: number) => void
  toggleTiming: (enabled: boolean) => void
  contribute: (projectId: string, amount: number, contributor: Contributor) => void
  castVote: (optionId: string) => void
  createProposal: (input: {
    title: string
    description: string
    category: ProposalCategory
    estimatedCost: number
    voters: string[]
  }) => string
  castProposalVote: (proposalId: string) => void
  resolveProposals: () => void
  openPropose: () => void
  closePropose: () => void
  clearLastWinner: () => void
  approveWorker: (id: string) => void
  rejectWorker: (id: string) => void
  pushNotification: (n: Omit<AppNotification, 'id' | 'read'>) => void
  markAllRead: () => void
  updateUser: (patch: Partial<User>) => void
  getStreetName: (id: string) => string
  connectBanks: (bvn: string, accounts: LinkedAccount[]) => void
  disconnectBanks: () => void
  setLinkedAccounts: (accounts: LinkedAccount[]) => void
}

const AppContext = createContext<AppContextValue | null>(null)

const STREET_NAMES: Record<string, string> = {
  'st-abak': 'Abak Road',
  'st-oron': 'Oron Road',
  'st-aka': 'Aka Road',
  'st-wellington': 'Wellington Bassey Way',
  'st-ikot': 'Ikot Ekpene Road',
  'st-adeniran': 'Adeniran Ogunsanya',
  'st-garki': 'Garki District 2',
}

let idCounter = 1000
const nextId = (prefix: string) => `${prefix}-${idCounter++}`

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: currentUser,
    loggedIn: true,
    walletBalance: 28450,
    activeStreetId: currentUser.streetId,
    bills: seedBills,
    projects: seedProjects,
    notifications: seedNotifications,
    sweepMandates: seedMandates,
    timing: seedTiming,
    votes: seedVotes,
    proposals: seedProposals,
    contacts: seedContacts,
    proposeOpen: false,
    lastWinner: null,
    workerQueue: seedWorkers,
    routeStops: seedRoutes,
    sweepLog: [],
    linkedAccounts: currentUser.linkedAccounts ?? [],
  })

  const login = useCallback((user: User) => {
    setState((s) => ({ ...s, user, loggedIn: true }))
  }, [])

  const logout = useCallback(() => {
    setState((s) => ({ ...s, loggedIn: false }))
  }, [])

  const setActiveStreet = useCallback((id: string) => {
    setState((s) => ({ ...s, activeStreetId: id }))
  }, [])

  const payBill = useCallback((billId: string) => {
    setState((s) => {
      const bill = s.bills.find((b) => b.id === billId)
      if (!bill || bill.status === 'paid') return s
      const newBalance = Math.max(0, s.walletBalance - bill.amount)
      return {
        ...s,
        walletBalance: newBalance,
        bills: s.bills.map((b) =>
          b.id === billId ? { ...b, status: 'paid', smartSweepActive: false } : b,
        ),
      }
    })
  }, [])

  const setBillSmartSweep = useCallback((billId: string, active: boolean) => {
    setState((s) => ({
      ...s,
      bills: s.bills.map((b) =>
        b.id === billId
          ? {
              ...b,
              smartSweepActive: active,
              status: active ? 'in_progress' : b.status === 'in_progress' ? 'pending' : b.status,
              smartSweepCollected: active ? (b.smartSweepCollected ?? 0) : b.smartSweepCollected,
            }
          : b,
      ),
      sweepMandates: active
        ? [
            ...s.sweepMandates,
            {
              id: nextId('ss'),
              billId,
              billType: s.bills.find((b) => b.id === billId)?.type ?? 'Trash collection',
              cap: 500,
              frequency: 'whenever your balance stays above ₦2,000, up to ₦500 at a time',
              active: true,
            },
          ]
        : s.sweepMandates.filter((m) => m.billId !== billId),
    }))
  }, [])

  const setMandatePaused = useCallback((mandateId: string, paused: boolean) => {
    setState((s) => ({
      ...s,
      sweepMandates: s.sweepMandates.map((m) =>
        m.id === mandateId ? { ...m, active: !paused } : m,
      ),
      bills: s.bills.map((b) =>
        s.sweepMandates.find((m) => m.id === mandateId && m.billId === b.id)
          ? { ...b, smartSweepActive: !paused }
          : b,
      ),
    }))
  }, [])

  const cancelMandate = useCallback((mandateId: string) => {
    setState((s) => {
      const mandate = s.sweepMandates.find((m) => m.id === mandateId)
      return {
        ...s,
        sweepMandates: s.sweepMandates.filter((m) => m.id !== mandateId),
        bills: s.bills.map((b) =>
          mandate && b.id === mandate.billId
            ? { ...b, smartSweepActive: false, status: b.status === 'in_progress' ? 'pending' : b.status }
            : b,
        ),
      }
    })
  }, [])

  const collectSweep = useCallback((billId: string, amount: number) => {
    setState((s) => {
      const bill = s.bills.find((b) => b.id === billId)
      if (!bill) return s
      const collected = Math.min(bill.amount, (bill.smartSweepCollected ?? 0) + amount)
      const remaining = bill.amount - collected
      const newNotifications = [
        {
          id: nextId('n'),
          type: 'sweep' as const,
          message: `Smart Sweep collected ${'₦' + amount.toLocaleString('en-NG')} toward your ${bill.type.toLowerCase()} bill`,
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...s.notifications,
      ]
      return {
        ...s,
        walletBalance: Math.max(0, s.walletBalance - amount),
        bills: s.bills.map((b) =>
          b.id === billId
            ? {
                ...b,
                smartSweepCollected: collected,
                status: remaining <= 0 ? ('paid' as const) : b.status,
              }
            : b,
        ),
        sweepLog: [
          { id: nextId('sl'), billId, amount, timestamp: new Date().toISOString() },
          ...s.sweepLog,
        ],
        notifications: newNotifications,
      }
    })
  }, [])

  const toggleTiming = useCallback((enabled: boolean) => {
    setState((s) => ({ ...s, timing: { ...s.timing, enabled, status: enabled ? 'on' : 'off' } }))
  }, [])

  const contribute = useCallback((projectId: string, amount: number, contributor: Contributor) => {
    setState((s) => {
      const projects = s.projects.map((p) => {
        if (p.id !== projectId) return p
        const raised = p.raised + amount
        const reachedGoal = raised >= p.goal
        return {
          ...p,
          raised,
          status: reachedGoal ? ('funded' as const) : p.status,
          contributors: [...p.contributors, contributor],
        }
      })
      return {
        ...s,
        walletBalance: Math.max(0, s.walletBalance - amount),
        projects,
      }
    })
  }, [])

  const castVote = useCallback((optionId: string) => {
    setState((s) => ({
      ...s,
      votes: s.votes.map((v) =>
        v.id === optionId && !v.votedBy.includes(s.user?.id ?? '')
          ? { ...v, votes: v.votes + 1, votedBy: [...v.votedBy, s.user?.id ?? ''] }
          : v,
      ),
    }))
  }, [])

  const createProposal = useCallback(
    (input: {
      title: string
      description: string
      category: ProposalCategory
      estimatedCost: number
      voters: string[]
    }) => {
      const id = nextId('pr')
      const now = Date.now()
      const proposal: Proposal = {
        id,
        streetId: state.user?.streetId ?? state.activeStreetId,
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        estimatedCost: input.estimatedCost,
        proposerId: state.user?.id ?? 'me',
        proposerName: state.user?.firstName ?? 'You',
        voters: input.voters,
        votes: 0,
        votedBy: [],
        startedAt: new Date(now).toISOString(),
        deadline: new Date(now + 48 * 3600 * 1000).toISOString(),
        status: 'open',
      }
      setState((s) => ({ ...s, proposals: [proposal, ...s.proposals] }))
      return id
    },
    [state.user, state.activeStreetId],
  )

  const castProposalVote = useCallback((proposalId: string) => {
    setState((s) => ({
      ...s,
      proposals: s.proposals.map((p) =>
        p.id === proposalId && p.status === 'open' && !p.votedBy.includes(s.user?.id ?? '')
          ? { ...p, votes: p.votes + 1, votedBy: [...p.votedBy, s.user?.id ?? ''] }
          : p,
      ),
    }))
  }, [])

  const resolveProposals = useCallback(() => {
    setState((s) => {
      const now = Date.now()
      const open = s.proposals.filter(
        (p) => p.status === 'open' && new Date(p.deadline).getTime() <= now,
      )
      if (open.length === 0) return s

      // Group by deadline: each 48h window is one voting round.
      const groups = new Map<string, Proposal[]>()
      for (const p of open) {
        const arr = groups.get(p.deadline) ?? []
        arr.push(p)
        groups.set(p.deadline, arr)
      }

      const updates: Record<string, Proposal> = {}
      const newBills: Bill[] = []
      const newProjects: CommunityProject[] = []
      const newNotifications: AppNotification[] = []
      let winnerInfo = s.lastWinner

      for (const group of groups.values()) {
        const leader = group.reduce((a, b) => (b.votes > a.votes ? b : a))
        for (const p of group) {
          if (p.id === leader.id) {
            const billId = `bill-${p.id}`
            const projectId = `proj-${p.id}`
            if (!p.winnerBillId) {
              const due = new Date(new Date(p.deadline).getTime() + 14 * 86400000)
                .toISOString()
                .slice(0, 10)
              newBills.push({
                id: billId,
                residentId: s.user?.id ?? 'me',
                type: p.category,
                provider: `Community vote · ${STREET_NAMES[p.streetId] ?? p.streetId}`,
                amount: p.estimatedCost,
                dueDate: due,
                status: 'pending',
                smartSweepActive: false,
                source: 'Community vote',
              })
              newProjects.push({
                id: projectId,
                streetId: p.streetId,
                title: p.title,
                description: p.description,
                category: p.category,
                raised: 0,
                goal: p.estimatedCost,
                daysRemaining: 14,
                status: 'active',
                contributors: [],
              })
              newNotifications.push({
                id: nextId('n'),
                type: 'community',
                message: `“${p.title}” won the street vote. It’s now a bill and a community project.`,
                timestamp: new Date().toISOString(),
                read: false,
              })
              winnerInfo = { proposalId: p.id, billId, projectId, title: p.title }
            }
            updates[p.id] = {
              ...p,
              status: 'won',
              winnerBillId: billId,
              winnerProjectId: projectId,
            }
          } else {
            updates[p.id] = { ...p, status: 'lost' }
          }
        }
      }

      return {
        ...s,
        proposals: s.proposals.map((p) => updates[p.id] ?? p),
        bills: [...newBills, ...s.bills],
        projects: [...newProjects, ...s.projects],
        notifications: [...newNotifications, ...s.notifications],
        lastWinner: winnerInfo,
      }
    })
  }, [])

  const openPropose = useCallback(() => {
    setState((s) => ({ ...s, proposeOpen: true }))
  }, [])

  const closePropose = useCallback(() => {
    setState((s) => ({ ...s, proposeOpen: false }))
  }, [])

  const clearLastWinner = useCallback(() => {
    setState((s) => ({ ...s, lastWinner: null }))
  }, [])

  const approveWorker = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      workerQueue: s.workerQueue.map((w) => (w.id === id ? { ...w, status: 'approved' } : w)),
    }))
  }, [])

  const rejectWorker = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      workerQueue: s.workerQueue.map((w) => (w.id === id ? { ...w, status: 'rejected' } : w)),
    }))
  }, [])

  const pushNotification = useCallback((n: Omit<AppNotification, 'id' | 'read'>) => {
    setState((s) => ({
      ...s,
      notifications: [{ ...n, id: nextId('n'), read: false }, ...s.notifications],
    }))
  }, [])

  const markAllRead = useCallback(() => {
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }))
  }, [])

  const getStreetName = useCallback((id: string) => STREET_NAMES[id] ?? id, [])

  const updateUser = useCallback((patch: Partial<User>) => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, ...patch } } : s))
  }, [])

  const setLinkedAccounts = useCallback((accounts: LinkedAccount[]) => {
    setState((s) => ({
      ...s,
      linkedAccounts: accounts,
      user: s.user ? { ...s.user, linkedAccounts: accounts } : s.user,
    }))
  }, [])

  const connectBanks = useCallback((bvn: string, accounts: LinkedAccount[]) => {
    setState((s) => ({
      ...s,
      linkedAccounts: accounts,
      user: s.user
        ? {
            ...s.user,
            bvn,
            linkedAccounts: accounts,
            bankConnected: accounts.length > 0,
            bankName: accounts[0]?.bank ?? s.user.bankName,
            accountName: accounts[0]?.accountName ?? s.user.accountName,
          }
        : s.user,
    }))
  }, [])

  const disconnectBanks = useCallback(() => {
    setState((s) => ({
      ...s,
      linkedAccounts: [],
      user: s.user
        ? { ...s.user, bvn: undefined, linkedAccounts: [], bankConnected: false, bankName: '', accountName: '' }
        : s.user,
    }))
  }, [])

  useEffect(() => {
    resolveProposals()
  }, [resolveProposals])

  const value: AppContextValue = {
    ...state,
    login,
    logout,
    setActiveStreet,
    payBill,
    setBillSmartSweep,
    setMandatePaused,
    cancelMandate,
    collectSweep,
    toggleTiming,
    contribute,
    castVote,
    createProposal,
    castProposalVote,
    resolveProposals,
    openPropose,
    closePropose,
    clearLastWinner,
    approveWorker,
    rejectWorker,
    pushNotification,
    markAllRead,
    updateUser,
    getStreetName,
    connectBanks,
    disconnectBanks,
    setLinkedAccounts,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
