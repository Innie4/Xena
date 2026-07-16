import { motion, AnimatePresence } from 'framer-motion'
import { formatNaira } from '../mockData'

interface EmberBurstProps {
  amount: number // the amount to show, e.g. 500
  triggerKey: string | number // change this to re-trigger the animation, same pattern as `key={swept}` today
}

export default function EmberBurst({ amount, triggerKey }: EmberBurstProps) {
  return (
    <AnimatePresence>
      <motion.div
        key={triggerKey}
        initial={{ opacity: 0, y: 8, scale: 0.8 }}
        animate={{ opacity: 1, y: -4, scale: 1 }}
        exit={{ opacity: 0 }}
        className="absolute right-4 bottom-3 text-gold num text-sm"
      >
        +{formatNaira(amount)}
      </motion.div>
    </AnimatePresence>
  )
}
