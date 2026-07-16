import { motion, AnimatePresence } from 'framer-motion'
import { useSparkles } from './SparklesProvider'
import { useContribution } from '../contributions'
import { SparklesIcon, CloseIcon } from '../components/icons'
import { SNOOZE_LABELS, SnoozePreset } from './types'

export default function ReminderToast({ walletBalance }: { walletBalance: number }) {
  const { toast, dismiss, snooze } = useSparkles()
  const { requestContribution } = useContribution()

  const onPrimary = () => {
    if (!toast) return
    const id = toast.id
    if (toast.cta) {
      const { amount, purpose, destination } = toast.cta
      requestContribution({
        amount,
        purpose,
        destination,
        balanceAfter: walletBalance - amount,
      })
        .catch(() => {})
        .finally(() => dismiss(id))
    } else {
      dismiss(id)
    }
  }

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          className="fixed z-40 right-5 bottom-36 lg:bottom-24 lg:right-6 w-[260px]"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.28 }}
        >
          <div className="rounded-card p-3.5 bg-olive text-card shadow-soft border border-olive-dark">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gold">
              <SparklesIcon size={13} /> Sparkles
            </div>
            <p className="text-sm mt-1.5 text-card">{toast.body}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {toast.cta && (
                <button
                  onClick={onPrimary}
                  className="flex-1 min-w-[88px] py-1.5 rounded-btn text-xs font-semibold bg-gold text-ink"
                >
                  {toast.cta.label}
                </button>
              )}
              <button
                onClick={() => dismiss(toast.id)}
                className="px-3 py-1.5 rounded-btn text-xs bg-card/15 text-card hover:bg-card/25"
              >
                Later
              </button>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-card/15">
              <div className="flex gap-1">
                {(Object.keys(SNOOZE_LABELS) as SnoozePreset[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => snooze(toast.id, p)}
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-card/10 text-card/80 hover:bg-card/20"
                  >
                    {SNOOZE_LABELS[p]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Stop reminding me"
                className="text-card/60 hover:text-card"
              >
                <CloseIcon size={14} />
              </button>
            </div>
            <p className="text-[10px] text-card/50 mt-2">Snooze or stop anytime from the Sparkles panel.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
