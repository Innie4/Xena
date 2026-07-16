interface AvatarStackProps {
  names: string[]
  max?: number
  size?: number
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const palette = ['#C1552C', '#3F4B2B', '#D9A441', '#9C3B2E']

export default function AvatarStack({ names, max = 4, size = 28 }: AvatarStackProps) {
  const shown = names.slice(0, max)
  const extra = names.length - shown.length

  return (
    <div className="flex items-center">
      {shown.map((n, i) => (
        <div
          key={i}
          className="rounded-full border-2 border-card flex items-center justify-center text-card font-medium first:ml-0 -ml-1.5"
          style={{
            width: size,
            height: size,
            backgroundColor: palette[i % palette.length],
            fontSize: Math.round(size * 0.36),
          }}
          title={n}
        >
          {initials(n)}
        </div>
      ))}
      {extra > 0 && (
        <div
          className="rounded-full border-2 border-card bg-warmgray flex items-center justify-center text-ink/70 font-medium -ml-1.5"
          style={{ width: size, height: size, fontSize: Math.round(size * 0.32) }}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}
