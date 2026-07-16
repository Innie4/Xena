import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { GameLevel } from '../types'

export default function LevelUpModal({
  level,
  onClose,
}: {
  level: GameLevel
  onClose: () => void
}) {
  const reduce = useReducedMotion()
  useEffect(() => {
    const t = setTimeout(onClose, 3200)
    return () => clearTimeout(t)
  }, [onClose, level.level])
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={reduce ? false : { scale: 0.8, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-full max-w-xs rounded-card bg-gradient-to-br from-terracotta to-gold p-6 text-center text-card shadow-soft"
        >
          <p className="text-xs uppercase tracking-widest text-card/80">Level up</p>
          <p className="font-display text-3xl font-extrabold mt-1">Level {level.level}</p>
          <p className="font-serif text-xl mt-1">{level.title}</p>
          <p className="text-sm text-card/90 mt-3">{level.blurb}</p>
          <button
            onClick={onClose}
            className="mt-5 rounded-btn bg-card/20 px-4 py-2 text-sm font-medium hover:bg-card/30"
          >
            Nice
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
