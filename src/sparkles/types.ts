export type ReminderType = 'scheduled' | 'inactivity' | 'milestone' | 'reengagement'

export interface ReminderCta {
  label: string
  amount: number
  purpose: string
  destination?: string
}

export interface Reminder {
  id: string
  type: ReminderType
  title: string
  body: string
  goalId?: string
  cta?: ReminderCta
  createdAt: string
  status: 'sent' | 'snoozed' | 'dismissed'
}

export interface QuietHours {
  enabled: boolean
  start: string // "22:00"
  end: string // "07:00"
}

export interface SparklesSettings {
  enabled: boolean
  quietHours: QuietHours
  perGoal: Record<string, boolean>
}

export type SnoozePreset = '1h' | '1d' | '1w'

export const SNOOZE_LABELS: Record<SnoozePreset, string> = {
  '1h': '1 hour',
  '1d': '1 day',
  '1w': '1 week',
}
