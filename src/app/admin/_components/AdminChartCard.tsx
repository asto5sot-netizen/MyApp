'use client'

interface Props { title: string; data: { day: string; count: number }[]; color: string }

export function AdminChartCard({ title, data, color }: Props) {
  const max = Math.max(...data.map(d => d.count), 1)
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <span className="text-xs text-gray-500">Total: {total.toLocaleString()}</span>
      </div>
      {total === 0 ? (
        <div className="h-20 flex items-center justify-center text-gray-600 text-sm">No data yet</div>
      ) : (
        <div className="flex items-end gap-0.5 h-20">
          {data.map(d => (
            <div key={d.day} title={`${d.day}: ${d.count}`}
              className="flex-1 rounded-sm min-w-0 transition-all hover:opacity-80 cursor-default"
              style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 0)}%`, backgroundColor: color, opacity: d.count === 0 ? 0.15 : 0.85 }} />
          ))}
        </div>
      )}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <span>{data.at(0)?.day?.slice(5) ?? ''}</span>
        <span>{data.at(-1)?.day?.slice(5) ?? ''}</span>
      </div>
    </div>
  )
}
