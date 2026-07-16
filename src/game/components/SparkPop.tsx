import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export default function SparkPop({ sparks }: { sparks: number }) {
  const prev = useRef(sparks)
  const [delta, setDelta] = useState(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    const diff = sparks - prev.current
    prev.current = sparks
    if (diff > 0) {
      setDelta(diff)
      const t = setTimeout(() => setDelta(0), 1400)
      return () => clearTimeout(t)
    }
  }, [sparks])
  if (reduce || delta <= 0) return null
  return (
    <span className="pointer-events-none absolute -top-2 right-3 rounded-full bg-gold/90 px-2 py-0.5 text-[11px] font-bold text-ink shadow-sm animate-[fade-in_0.3s_ease-out]">
      +{delta} sparks
    </span>
  )
}
