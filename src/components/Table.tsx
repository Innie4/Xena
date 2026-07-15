import { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  emptyText?: string
}

export default function Table<T>({ columns, data, rowKey, onRowClick, emptyText }: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="card-base p-6 text-center text-ink/60 text-sm">{emptyText ?? 'No records found.'}</div>
    )
  }
  return (
    <div className="card-base overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-warmgray/50 text-ink/60">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-4 py-2.5 font-medium text-xs uppercase tracking-wide text-left ${
                  c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''
                }`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={`border-t border-warmgray ${onRowClick ? 'cursor-pointer hover:bg-sand/60' : ''}`}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-4 py-3 text-ink/90 ${
                    c.align === 'right' ? 'text-right num' : c.align === 'center' ? 'text-center' : ''
                  }`}
                >
                  {c.render ? c.render(row) : (row as any)[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
