'use client'

const colorMap: Record<string, string> = {
  blue: 'border-blue-800 bg-blue-950',
  green: 'border-green-800 bg-green-950',
  purple: 'border-purple-800 bg-purple-950',
  amber: 'border-amber-800 bg-amber-950',
  teal: 'border-teal-800 bg-teal-950',
  gray: 'border-gray-800 bg-gray-900',
}

interface Props { label: string; value: number; sub: string; color: string; icon: string }

export function AdminMetricCard({ label, value, sub, color, icon }: Props) {
  return (
    <div className={`border rounded-xl p-5 ${colorMap[color] || colorMap.gray}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</div>
          <div className="text-3xl font-bold text-white mt-1">{value.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">{sub}</div>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}
