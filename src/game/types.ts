export interface GameRank {
  id: string
  label: string
  blurb: string
}

export interface GameLevel {
  level: number
  title: string
  minSparks: number
  blurb: string
}

export type BadgeCategory = 'milestone' | 'community' | 'streak'

export interface BadgeDef {
  id: string
  label: string
  blurb: string
  category: BadgeCategory
  glyph: string
}

export interface EarnedBadge extends BadgeDef {
  earnedAt: string
}

export interface QuestStep {
  id: string
  label: string
  done: boolean
}

export interface QuestDef {
  id: string
  title: string
  blurb: string
  steps: QuestStep[]
}

export interface GameState {
  sparks: number
  level: GameLevel
  nextLevel: GameLevel | null
  sparksIntoLevel: number
  sparksForLevel: number
  levelProgress: number
  rank: GameRank
  reliabilityScore: number
  streak: number
  badges: EarnedBadge[]
  quests: QuestDef[]
}
