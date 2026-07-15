import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md'
}

export default function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
          <motion.div
            className={`relative bg-card rounded-card shadow-soft w-full ${
              size === 'sm' ? 'max-w-sm' : 'max-w-md'
            } p-5`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            {title && <h3 className="font-serif text-xl mb-3 text-ink">{title}</h3>}
            <div className="text-ink/80">{children}</div>
            {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface SuccessModalProps {
  open: boolean
  onClose: () => void
  title?: string
  message: string
  detail?: string
  buttonLabel?: string
}

export function SuccessModal({
  open,
  onClose,
  title = 'Done',
  message,
  detail,
  buttonLabel = 'Okay',
}: SuccessModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <Button size="sm" onClick={onClose}>
          {buttonLabel}
        </Button>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D9A441" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="font-serif text-lg text-ink">{title}</h3>
        <p className="mt-1 text-sm text-ink/70">{message}</p>
        {detail && <p className="mt-2 num text-base text-terracotta">{detail}</p>}
      </div>
    </Modal>
  )
}
