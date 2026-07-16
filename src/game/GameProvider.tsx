import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { useApp } from '../context/AppContext'
import { deriveGame, LEVELS } from './system'
import type { GameState } from './types'
import LevelUpModal from './components/LevelUpModal'

interface GameContextValue extends GameState {
  leveledTo: number | null
  dismissLevelUp: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const app = useApp()
  const game = useMemo(
    () =>
      deriveGame({
        user: app.user,
        bills: app.bills,
        projects: app.projects,
        proposals: app.proposals,
        sweepMandates: app.sweepMandates,
        votes: app.votes,
      }),
    [app.user, app.bills, app.projects, app.proposals, app.sweepMandates, app.votes],
  )

  const prevLevel = useRef(game.level.level)
  const [leveledTo, setLeveledTo] = useState<number | null>(null)
  useEffect(() => {
    if (game.level.level > prevLevel.current) setLeveledTo(game.level.level)
    prevLevel.current = game.level.level
  }, [game.level.level])

  const value = useMemo<GameContextValue>(
    () => ({ ...game, leveledTo, dismissLevelUp: () => setLeveledTo(null) }),
    [game, leveledTo],
  )

  return (
    <GameContext.Provider value={value}>
      {children}
      {leveledTo !== null && (
        <LevelUpModal
          level={LEVELS.find((l) => l.level === leveledTo) ?? LEVELS[0]}
          onClose={() => setLeveledTo(null)}
        />
      )}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
