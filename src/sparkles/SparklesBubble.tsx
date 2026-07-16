import { motion } from 'framer-motion'
import { useSparkles } from './SparklesProvider'
import { SparklesIcon } from '../components/icons'

export default function SparklesBubble() {
  const { unread, setOpenPanel, clearUnread } = useSparkles()

  return (
    <motion.button
      type="button"
      aria-label="Open Sparkles assistant"
      onClick={() => {
        clearUnread()
        setOpenPanel(true)
      }}
      className="fixed z-40 right-5 bottom-20 lg:bottom-6 lg:right-6 h-14 w-14 rounded-full flex items-center justify-center text-card shadow-soft"
      style={{
        background: 'linear-gradient(135deg, #D9A441 0%, #C1552C 100%)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      animate={unread ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={unread ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
      whileTap={{ scale: 0.94 }}
    >
      <SparklesIcon size={24} className="text-card" />
      {unread && (
        <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-gold ring-2 ring-card" />
      )}
    </motion.button>
  )
}
