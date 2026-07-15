import { ReactNode } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'
import { formatNaira } from '../mockData'

interface ChartWrapperProps {
  type?: 'area' | 'bar'
  data: any[]
  xKey: string
  yKey: string
  color?: string
  height?: number
}

function MoneyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink text-card rounded-btn px-3 py-2 text-xs shadow-soft">
      <p className="font-medium">{label}</p>
      <p className="num">{formatNaira(payload[0].value)}</p>
    </div>
  )
}

export default function ChartWrapper({
  type = 'area',
  data,
  xKey,
  yKey,
  color = '#C1552C',
  height = 240,
}: ChartWrapperProps) {
  const node: ReactNode = type === 'area' ? (
    <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="xenaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#E4DCCB" vertical={false} />
      <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#6b6457' }} tickLine={false} axisLine={{ stroke: '#E4DCCB' }} />
      <YAxis
        tick={{ fontSize: 12, fill: '#6b6457' }}
        tickLine={false}
        axisLine={false}
        tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
        width={48}
      />
      <Tooltip content={<MoneyTooltip />} />
      <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} fill="url(#xenaFill)" />
    </AreaChart>
  ) : (
    <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#E4DCCB" vertical={false} />
      <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#6b6457' }} tickLine={false} axisLine={{ stroke: '#E4DCCB' }} />
      <YAxis
        tick={{ fontSize: 12, fill: '#6b6457' }}
        tickLine={false}
        axisLine={false}
        tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
        width={48}
      />
      <Tooltip content={<MoneyTooltip />} cursor={{ fill: '#E4DCCB', opacity: 0.4 }} />
      <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} />
    </BarChart>
  )

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {node as any}
      </ResponsiveContainer>
    </div>
  )
}
