import { BillStatus } from '../mockData'

type TagTone = 'paid' | 'pending' | 'in_progress' | 'overdue' | 'neutral' | 'success' | 'danger'

const toneMap: Record<TagTone, string> = {
  paid: 'bg-olive/10 text-olive border-olive/30',
  pending: 'bg-gold/15 text-[#8a6516] border-gold/40',
  in_progress: 'bg-terracotta/10 text-terracotta border-terracotta/30',
  overdue: 'bg-brick/10 text-brick border-brick/30',
  neutral: 'bg-warmgray/60 text-ink/70 border-warmgray',
  success: 'bg-gold/20 text-[#8a6516] border-gold/50',
  danger: 'bg-brick/10 text-brick border-brick/30',
}

const labelMap: Record<TagTone, string> = {
  paid: 'Paid',
  pending: 'Pending',
  in_progress: 'In progress',
  overdue: 'Overdue',
  neutral: '-',
  success: 'Funded',
  danger: 'Unpaid',
}

export default function StatusTag({ status, label }: { status: TagTone; label?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneMap[status]}`}
    >
      {label ?? labelMap[status]}
    </span>
  )
}

export function billStatusTag(status: BillStatus) {
  return <StatusTag status={status} />
}
