// Centralized mock data for the Xena demo.
// Everything the app shows is seeded from here. Edit freely during the demo.

export type BillStatus = 'paid' | 'pending' | 'in_progress' | 'overdue'

export interface Bill {
  id: string
  residentId: string
  type:
    | 'Trash collection'
    | 'Water'
    | 'Electricity'
    | 'Waste pickup'
    | 'Security'
    | 'Gate pickup'
    | 'Gutter clearing'
    | 'Waste packing'
    | 'Sanitation'
  provider: string
  amount: number
  dueDate: string // ISO date
  status: BillStatus
  smartSweepActive: boolean
  smartSweepCollected?: number // amount collected so far by smart sweep
  source?: string // where the bill came from, e.g. "Community vote"
}

export interface Contributor {
  name: string
  amount: number
  anonymous: boolean
}

export type ProjectStatus = 'active' | 'funded' | 'completed'

export interface CommunityProject {
  id: string
  streetId: string
  title: string
  description: string
  category: 'Gate pickup' | 'Gutter clearing' | 'Waste packing' | 'Security' | 'Sanitation'
  raised: number
  goal: number
  daysRemaining: number
  status: ProjectStatus
  contributors: Contributor[]
  worker?: { name: string; skill: string }
  jobStartDate?: string
}

export interface AppNotification {
  id: string
  type: 'sweep' | 'community' | 'bill' | 'system'
  message: string
  timestamp: string // ISO
  read: boolean
}

export interface SmartSweepMandate {
  id: string
  billId: string
  billType: Bill['type']
  cap: number // max amount per collection trigger
  frequency: string // plain-language trigger text
  active: boolean
}

export interface PaymentTiming {
  enabled: boolean
  payPatternDay: number // day of month resident is usually paid
  status: 'on' | 'off'
}

export interface Street {
  id: string
  name: string
  lga: string
  city: 'Uyo' | 'Lagos' | 'Abuja'
}

export interface UserContribution {
  id: string
  amount: number
  at: string // ISO timestamp of the sweep contribution
}

export interface User {
  id: string
  name: string
  firstName: string
  phone: string
  streetId: string
  bankConnected: boolean
  bankName: string
  accountName: string
  contributions?: UserContribution[]
}

export type ProposalCategory =
  | 'Gate pickup'
  | 'Gutter clearing'
  | 'Waste packing'
  | 'Security'
  | 'Sanitation'

export type ProposalStatus = 'open' | 'won' | 'lost'

export interface Proposal {
  id: string
  streetId: string
  title: string
  description: string
  category: ProposalCategory
  estimatedCost: number
  proposerId: string
  proposerName: string
  voters: string[] // invited contact ids
  votes: number // total votes cast so far
  votedBy: string[] // resident ids who have voted
  startedAt: string // ISO
  deadline: string // ISO, 48h after start
  status: ProposalStatus
  winnerBillId?: string
  winnerProjectId?: string
}

export interface Contact {
  id: string
  name: string
  phone: string
  streetId: string
}

export interface VoteOption {
  id: string
  streetId: string
  title: string
  description: string
  votes: number
  votedBy: string[] // resident ids who voted
}

// ---- Operator (Trash Company) data ----
export interface OperatorWeekIncome {
  day: string
  amount: number
}

export interface OperatorStreet {
  id: string
  name: string
  city: string
  households: number
  collected: number
  expected: number
  status: 'paid' | 'partial' | 'unpaid'
  serviceDate: string
}

export interface RouteStop {
  id: string
  streetId: string
  streetName: string
  confirmed: boolean
  bins: number
  note: string
}

// ---- Admin data ----
export type HealthStatus = 'healthy' | 'warning' | 'critical'

export interface AdminStreetRow {
  id: string
  name: string
  city: string
  households: number
  collected: number
  expected: number
  health: HealthStatus
}

export interface WorkerVerification {
  id: string
  name: string
  skill: string
  street: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  document: string
  city?: string
  wallet?: string
  payoutAmount?: number
  joinedAt?: string
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

export const streets: Street[] = [
  { id: 'st-abak', name: 'Abak Road', lga: 'Uyo', city: 'Uyo' },
  { id: 'st-oron', name: 'Oron Road', lga: 'Uyo', city: 'Uyo' },
  { id: 'st-aka', name: 'Aka Road', lga: 'Uyo', city: 'Uyo' },
  { id: 'st-wellington', name: 'Wellington Bassey Way', lga: 'Uyo', city: 'Uyo' },
  { id: 'st-ikot', name: 'Ikot Ekpene Road', lga: 'Uyo', city: 'Uyo' },
  { id: 'st-adeniran', name: 'Adeniran Ogunsanya', lga: 'Surulere', city: 'Lagos' },
  { id: 'st-garki', name: 'Garki District 2', lga: 'Abuja Municipal', city: 'Abuja' },
]

export const currentUser: User = {
  id: 'u-iniobong',
  name: 'Iniobong Udofia',
  firstName: 'Iniobong',
  phone: '+234 803 555 0142',
  streetId: 'st-abak',
  bankConnected: true,
  bankName: 'Kuda Microfinance Bank',
  accountName: 'Iniobong Udofia',
  contributions: [
    { id: 'c-1', amount: 1500, at: '2026-01-15T09:12:00Z' },
    { id: 'c-2', amount: 1500, at: '2026-02-16T08:40:00Z' },
    { id: 'c-3', amount: 1500, at: '2026-03-15T10:05:00Z' },
    { id: 'c-4', amount: 1500, at: '2026-04-15T09:30:00Z' },
    { id: 'c-5', amount: 1500, at: '2026-05-16T08:55:00Z' },
    { id: 'c-6', amount: 1500, at: '2026-06-15T09:20:00Z' },
  ],
}

export const bills: Bill[] = [
  {
    id: 'bill-1',
    residentId: 'u-iniobong',
    type: 'Trash collection',
    provider: 'Uyo Waste Co.',
    amount: 1500,
    dueDate: '2026-07-28',
    status: 'in_progress',
    smartSweepActive: true,
    smartSweepCollected: 900,
  },
  {
    id: 'bill-2',
    residentId: 'u-iniobong',
    type: 'Water',
    provider: 'Ibom Water Board',
    amount: 2200,
    dueDate: '2026-07-20',
    status: 'pending',
    smartSweepActive: false,
  },
  {
    id: 'bill-3',
    residentId: 'u-iniobong',
    type: 'Electricity',
    provider: 'IKEDC',
    amount: 6400,
    dueDate: '2026-07-12',
    status: 'overdue',
    smartSweepActive: false,
  },
  {
    id: 'bill-4',
    residentId: 'u-iniobong',
    type: 'Waste pickup',
    provider: 'Abak Road Sanitation Co.',
    amount: 800,
    dueDate: '2026-06-30',
    status: 'paid',
    smartSweepActive: false,
  },
  {
    id: 'bill-5',
    residentId: 'u-iniobong',
    type: 'Security',
    provider: 'Abak Road Vigilante',
    amount: 1500,
    dueDate: '2026-08-01',
    status: 'pending',
    smartSweepActive: false,
  },
]

export const communityProjects: CommunityProject[] = [
  {
    id: 'proj-drain',
    streetId: 'st-abak',
    title: 'Clear the Abak Road gutters',
    description:
      'The gutters by the market junction clog every rainy season. Funds pay a verified crew to clear them and pack the waste for collection.',
    category: 'Gutter clearing',
    raised: 98000,
    goal: 120000,
    daysRemaining: 9,
    status: 'active',
    contributors: [
      { name: 'Aniefiok', amount: 5000, anonymous: false },
      { name: 'Uduak', amount: 3000, anonymous: false },
      { name: 'Ekemini', amount: 7500, anonymous: false },
      { name: 'Mbuotidem', amount: 2000, anonymous: false },
      { name: 'Anonymous', amount: 1500, anonymous: true },
      { name: 'Effiong', amount: 4000, anonymous: false },
    ],
  },
  {
    id: 'proj-light',
    streetId: 'st-abak',
    title: 'Gate waste pickup for Abak Road',
    description:
      'A verified crew collects the waste left by each gate on Abak Road twice a week, so no bin overflows and the street stays clear.',
    category: 'Gate pickup',
    raised: 145000,
    goal: 145000,
    daysRemaining: 0,
    status: 'funded',
    contributors: [
      { name: 'Iniobong', amount: 10000, anonymous: false },
      { name: 'Atim', amount: 8000, anonymous: false },
      { name: 'Oto-obong', amount: 12000, anonymous: false },
      { name: 'Anonymous', amount: 5000, anonymous: true },
    ],
    worker: { name: 'Nseobong Ekanem', skill: 'Waste crew lead' },
    jobStartDate: '2026-07-22',
  },
  {
    id: 'proj-gate',
    streetId: 'st-abak',
    title: 'Waste packing point at the street entrance',
    description:
      'Completed last quarter. A central packing point was set up where collectors pick up the street’s packed waste each week.',
    category: 'Waste packing',
    raised: 230000,
    goal: 230000,
    daysRemaining: 0,
    status: 'completed',
    contributors: [
      { name: 'Idara', amount: 25000, anonymous: false },
      { name: 'Ubong', amount: 30000, anonymous: false },
    ],
  },
]

export const notifications: AppNotification[] = [
  {
    id: 'n-1',
    type: 'sweep',
    message: 'Smart Sweep collected ₦500 toward your trash bill',
    timestamp: '2026-07-15T07:42:00',
    read: false,
  },
  {
    id: 'n-2',
    type: 'community',
    message: "Your street's gutter project is 90% funded",
    timestamp: '2026-07-15T06:10:00',
    read: false,
  },
  {
    id: 'n-3',
    type: 'bill',
    message: 'Your electricity bill is now overdue. ₦6,400 still due',
    timestamp: '2026-07-13T09:00:00',
    read: true,
  },
  {
    id: 'n-4',
    type: 'community',
    message: 'Gate waste pickup fully funded. Crew starts 22 July',
    timestamp: '2026-07-11T18:30:00',
    read: true,
  },
  {
    id: 'n-5',
    type: 'system',
    message: 'Your bank connection was verified via Open Banking',
    timestamp: '2026-07-10T12:05:00',
    read: true,
  },
]

export const smartSweepMandates: SmartSweepMandate[] = [
  {
    id: 'ss-1',
    billId: 'bill-1',
    billType: 'Trash collection',
    cap: 500,
    frequency: 'whenever your balance stays above ₦2,000, up to ₦500 at a time',
    active: true,
  },
]

export const paymentTiming: PaymentTiming = {
  enabled: false,
  payPatternDay: 28,
  status: 'off',
}

export const voteOptions: VoteOption[] = [
  {
    id: 'v-1',
    streetId: 'st-abak',
    title: 'Repaint the faded street name signs',
    description: 'New reflective signs at both ends of Abak Road.',
    votes: 34,
    votedBy: [],
  },
  {
    id: 'v-2',
    streetId: 'st-abak',
    title: 'Weekly community sweep by the market',
    description: 'Pay a small team to sweep the market stretch every Saturday.',
    votes: 41,
    votedBy: [],
  },
  {
    id: 'v-3',
    streetId: 'st-abak',
    title: 'Plant shade trees along the pavement',
    description: 'Twenty mahogany saplings from the nursery on Oron Road.',
    votes: 22,
    votedBy: [],
  },
  {
    id: 'v-4',
    streetId: 'st-abak',
    title: 'Second gate bin for the street',
    description: 'Keep the gate pickup from overflowing on busy market days.',
    votes: 12,
    votedBy: [],
  },
]

// ---- Phone book (contacts residents can invite to vote) ----
export const seedContacts: Contact[] = [
  { id: 'ct-1', name: 'Aniefiok', phone: '+234 803 555 0101', streetId: 'st-abak' },
  { id: 'ct-2', name: 'Uduak', phone: '+234 805 555 0102', streetId: 'st-abak' },
  { id: 'ct-3', name: 'Ekemini', phone: '+234 706 555 0103', streetId: 'st-abak' },
  { id: 'ct-4', name: 'Mbuotidem', phone: '+234 809 555 0104', streetId: 'st-abak' },
  { id: 'ct-5', name: 'Effiong', phone: '+234 813 555 0105', streetId: 'st-abak' },
  { id: 'ct-6', name: 'Atim', phone: '+234 817 555 0106', streetId: 'st-abak' },
  { id: 'ct-7', name: 'Oto-obong', phone: '+234 818 555 0107', streetId: 'st-abak' },
  { id: 'ct-8', name: 'Idara', phone: '+234 802 555 0108', streetId: 'st-abak' },
]

// ---- Community funding proposals ----
// Two rounds are seeded: a past round (deadline already passed) that resolves on
// load into a bill + community project, and one open round still counting down.
const PROP_NOW = Date.now()
const PROP_HOUR = 3600 * 1000
const isoFromNow = (ms: number) => new Date(PROP_NOW + ms).toISOString()

export const seedProposals: Proposal[] = [
  {
    id: 'pr-paint',
    streetId: 'st-abak',
    title: 'Repaint the faded street name signs',
    description: 'New reflective signs at both ends of Abak Road.',
    category: 'Sanitation',
    estimatedCost: 45000,
    proposerId: 'u-aniefiok',
    proposerName: 'Aniefiok',
    voters: ['ct-1', 'ct-2', 'ct-3', 'ct-4', 'ct-5', 'ct-6'],
    votes: 38,
    votedBy: ['u-1', 'u-2', 'u-3'],
    startedAt: isoFromNow(-50 * PROP_HOUR),
    deadline: isoFromNow(-2 * PROP_HOUR),
    status: 'open',
  },
  {
    id: 'pr-sweep',
    streetId: 'st-abak',
    title: 'Weekly community sweep by the market',
    description: 'Pay a small team to sweep the market stretch every Saturday.',
    category: 'Waste packing',
    estimatedCost: 72000,
    proposerId: 'u-uduak',
    proposerName: 'Uduak',
    voters: ['ct-1', 'ct-2', 'ct-3', 'ct-4', 'ct-5', 'ct-6', 'ct-7'],
    votes: 51,
    votedBy: ['u-1', 'u-2', 'u-3', 'u-4', 'u-5'],
    startedAt: isoFromNow(-50 * PROP_HOUR),
    deadline: isoFromNow(-2 * PROP_HOUR),
    status: 'open',
  },
  {
    id: 'pr-trees',
    streetId: 'st-abak',
    title: 'Plant shade trees along the pavement',
    description: 'Twenty mahogany saplings from the nursery on Oron Road.',
    category: 'Gate pickup',
    estimatedCost: 30000,
    proposerId: 'u-ekemini',
    proposerName: 'Ekemini',
    voters: ['ct-1', 'ct-2', 'ct-3', 'ct-4'],
    votes: 19,
    votedBy: ['u-1', 'u-2'],
    startedAt: isoFromNow(-50 * PROP_HOUR),
    deadline: isoFromNow(-2 * PROP_HOUR),
    status: 'open',
  },
  {
    id: 'pr-bin',
    streetId: 'st-abak',
    title: 'Second gate bin for the street',
    description: 'Keep the gate pickup from overflowing on busy market days.',
    category: 'Gutter clearing',
    estimatedCost: 25000,
    proposerId: 'u-iniobong',
    proposerName: 'Iniobong',
    voters: ['ct-1', 'ct-2', 'ct-3', 'ct-4', 'ct-5'],
    votes: 7,
    votedBy: [],
    startedAt: isoFromNow(-2 * PROP_HOUR),
    deadline: isoFromNow(46 * PROP_HOUR),
    status: 'open',
  },
]

// ---- Operator (Trash Company) ----
export const operatorWeekIncome: OperatorWeekIncome[] = [
  { day: 'Mon', amount: 184000 },
  { day: 'Tue', amount: 142000 },
  { day: 'Wed', amount: 210000 },
  { day: 'Thu', amount: 168000 },
  { day: 'Fri', amount: 245000 },
  { day: 'Sat', amount: 98000 },
  { day: 'Sun', amount: 72000 },
]

export const operatorStreets: OperatorStreet[] = [
  { id: 'st-abak', name: 'Abak Road', city: 'Uyo', households: 84, collected: 126000, expected: 126000, status: 'paid', serviceDate: '2026-07-16' },
  { id: 'st-oron', name: 'Oron Road', city: 'Uyo', households: 120, collected: 132000, expected: 180000, status: 'partial', serviceDate: '2026-07-16' },
  { id: 'st-aka', name: 'Aka Road', city: 'Uyo', households: 96, collected: 0, expected: 144000, status: 'unpaid', serviceDate: '2026-07-17' },
  { id: 'st-wellington', name: 'Wellington Bassey Way', city: 'Uyo', households: 140, collected: 210000, expected: 210000, status: 'paid', serviceDate: '2026-07-16' },
  { id: 'st-ikot', name: 'Ikot Ekpene Road', city: 'Uyo', households: 110, collected: 99000, expected: 165000, status: 'partial', serviceDate: '2026-07-17' },
  { id: 'st-adeniran', name: 'Adeniran Ogunsanya', city: 'Lagos', households: 210, collected: 315000, expected: 315000, status: 'paid', serviceDate: '2026-07-18' },
]

export const routeStops: RouteStop[] = [
  { id: 'r-1', streetId: 'st-abak', streetName: 'Abak Road', confirmed: true, bins: 18, note: 'All households paid' },
  { id: 'r-2', streetId: 'st-wellington', streetName: 'Wellington Bassey Way', confirmed: true, bins: 24, note: 'All households paid' },
  { id: 'r-3', streetId: 'st-adeniran', streetName: 'Adeniran Ogunsanya', confirmed: true, bins: 40, note: 'All households paid' },
  { id: 'r-4', streetId: 'st-oron', streetName: 'Oron Road', confirmed: false, bins: 21,     note: '63% collected, service on confirmation' },
  { id: 'r-5', streetId: 'st-ikot', streetName: 'Ikot Ekpene Road', confirmed: false, bins: 19,     note: '60% collected, service on confirmation' },
]

// ---- Admin ----
export const adminStreets: AdminStreetRow[] = [
  { id: 'st-abak', name: 'Abak Road', city: 'Uyo', households: 84, collected: 126000, expected: 126000, health: 'healthy' },
  { id: 'st-wellington', name: 'Wellington Bassey Way', city: 'Uyo', households: 140, collected: 210000, expected: 210000, health: 'healthy' },
  { id: 'st-oron', name: 'Oron Road', city: 'Uyo', households: 120, collected: 132000, expected: 180000, health: 'warning' },
  { id: 'st-ikot', name: 'Ikot Ekpene Road', city: 'Uyo', households: 110, collected: 99000, expected: 165000, health: 'warning' },
  { id: 'st-aka', name: 'Aka Road', city: 'Uyo', households: 96, collected: 0, expected: 144000, health: 'critical' },
  { id: 'st-adeniran', name: 'Adeniran Ogunsanya', city: 'Lagos', households: 210, collected: 315000, expected: 315000, health: 'healthy' },
  { id: 'st-garki', name: 'Garki District 2', city: 'Abuja', households: 175, collected: 0, expected: 262000, health: 'critical' },
]

export const workerQueue: WorkerVerification[] = [
  {
    id: 'w-1',
    name: 'Nseobong Ekanem',
    skill: 'Waste crew lead',
    street: 'Abak Road',
    submittedAt: '2026-07-14T10:20:00',
    status: 'pending',
    document: 'Trade cert + gov ID',
    city: 'Uyo',
    wallet: 'WAL-2291-AK',
    payoutAmount: 14500,
    joinedAt: '2026-03-02T09:00:00',
  },
  {
    id: 'w-2',
    name: 'Effiong Bassey',
    skill: 'Gutter clearing lead',
    street: 'Oron Road',
    submittedAt: '2026-07-14T14:05:00',
    status: 'pending',
    document: 'Local govt recommendation',
    city: 'Uyo',
    // Shares a wallet with w-1: should raise a shared_wallet flag.
    wallet: 'WAL-2291-AK',
    payoutAmount: 18200,
    joinedAt: '2026-02-18T09:00:00',
  },
  {
    id: 'w-3',
    name: 'Atim Okon',
    skill: 'Sanitation supervisor',
    street: 'Aka Road',
    submittedAt: '2026-07-13T09:40:00',
    status: 'pending',
    document: 'Trade cert + gov ID',
    city: 'Uyo',
    wallet: 'WAL-7782-AK',
    // Joined days ago with an outsized payout: should raise new_before_large_payout.
    payoutAmount: 70000,
    joinedAt: '2026-07-01T09:00:00',
  },
]

export const adminSummary = {
  totalFundsMoved: 2405500,
  streetsActive: 7,
  workersVerified: 18,
  projectsFunded: 11,
}

// ---- BVN onboarding (mock Open Banking lookup) ----
export interface LinkedAccount {
  bank: string
  accountNumber: string
  accountName: string
}

export const partnerBanks = [
  'Kuda Microfinance Bank',
  'Opay',
  'PalmPay',
  'Moniepoint',
  'GTBank',
  'Access Bank',
  'UBA',
  'First Bank',
]

export interface BvnLookup {
  phone: string
  accountName: string
  accounts: LinkedAccount[]
}

// Mock: any 11-digit BVN returns a deterministic set of linked accounts and the
// phone number tied to that BVN. No real network call.
export function lookupBVN(bvn: string): BvnLookup {
  const digits = (bvn.replace(/\D/g, '') + '00000000000').slice(0, 11)
  const makeAcct = (seed: number) =>
    (parseInt(digits.slice(1) || '1000000000', 10) + seed * 10007).toString().replace(/\D/g, '').padStart(10, '0').slice(-10)

  const accounts: LinkedAccount[] = [
    { bank: 'Kuda Microfinance Bank', accountNumber: makeAcct(1), accountName: 'Iniobong Udofia' },
    { bank: 'GTBank', accountNumber: makeAcct(2), accountName: 'Iniobong Udofia' },
    { bank: 'Opay', accountNumber: makeAcct(3), accountName: 'I. Udofia' },
  ]

  // Phone number connected to the BVN (mock, derived from the BVN digits)
  const local = ('080' + digits.slice(0, 7)).slice(-10)
  const phone = '+234 ' + local.slice(0, 3) + ' ' + local.slice(3, 6) + ' ' + local.slice(6)

  return { phone, accountName: 'Iniobong Udofia', accounts }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function formatNaira(amount: number): string {
  return '₦' + Math.round(amount).toLocaleString('en-NG')
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  const now = new Date('2026-07-15T08:00:00').getTime()
  const diff = Math.max(0, now - then)
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}
