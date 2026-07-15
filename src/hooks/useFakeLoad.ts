import { useEffect, useState } from 'react'

// Simulates a network request. Resolves quickly (<=1500ms) so we never
// show a spinner longer than 2s without a label (per the trust rules).
export function useFakeLoad(ms = 800) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), Math.min(ms, 1500))
    return () => clearTimeout(t)
  }, [ms])
  return loading
}
