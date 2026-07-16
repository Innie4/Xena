import type { GameRank } from '../types'

const EMBLEM: Record<string, string> = {
  newcomer: 'N',
  neighbour: 'Nb',
  cornerstone: 'Cs',
  elder: 'E',
  legend: 'L',
}

export default function RankPill({
  rank,
  light = false,
}: {
  rank: GameRank
  light?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        light ? 'bg-card/15 text-card' : 'bg-olive/10 text-olive'
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
          light ? 'bg-card/25' : 'bg-olive/20'
        }`}
      >
        {EMBLEM[rank.id] ?? '·'}
      </span>
      {rank.label}
    </span>
  )
}
