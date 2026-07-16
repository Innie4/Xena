import { useGame } from '../GameProvider'
import RankPill from './RankPill'
import SparkBar from './SparkBar'
import StreakFlame from './StreakFlame'
import BadgeShelf from './BadgeShelf'
import QuestTrail from './QuestTrail'
import { BADGES } from '../system'
import Card from '../../components/Card'

const ENCOURAGE = [
  'The hearth burns brighter with every sweep you make.',
  'A steady rhythm keeps the whole street warm.',
  'Small sweeps, big fire. You are building something.',
]

export default function GamePanel() {
  const game = useGame()
  const line = ENCOURAGE[Math.min(ENCOURAGE.length - 1, Math.floor(game.level.level / 3))]
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <RankPill rank={game.rank} />
        <StreakFlame streak={game.streak} />
      </div>
      <SparkBar
        level={game.level}
        nextLevel={game.nextLevel}
        sparksIntoLevel={game.sparksIntoLevel}
        sparksForLevel={game.sparksForLevel}
        levelProgress={game.levelProgress}
      />
      <p className="text-sm text-ink/70 italic">{line}</p>
      <hr className="flame-rule" />
      <div>
        <p className="label-text mb-2">Quests</p>
        <QuestTrail quests={game.quests} />
      </div>
      <hr className="flame-rule" />
      <div>
        <p className="label-text mb-2">
          Badges · {game.badges.length}/{BADGES.length}
        </p>
        <BadgeShelf badges={game.badges} all={BADGES} />
      </div>
    </Card>
  )
}
