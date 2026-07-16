import { useGame } from '../GameProvider'
import RankPill from './RankPill'
import StreakFlame from './StreakFlame'
import SparkBar from './SparkBar'

export default function GameStrip() {
  const game = useGame()
  return (
    <div className="card-base p-3 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
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
    </div>
  )
}
