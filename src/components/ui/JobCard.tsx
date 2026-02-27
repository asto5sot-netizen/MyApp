import Link from 'next/link'
import { StatusBadge } from './StatusBadge'

interface JobCardProps {
  id: string
  title: string
  categoryName: string
  city: string
  status?: string
  statusLabel?: string
  budgetMin?: number | null
  budgetMax?: number | null
  proposalsCount?: number
}

export function JobCard({ id, title, categoryName, city, status, statusLabel, budgetMin, budgetMax, proposalsCount }: JobCardProps) {
  return (
    <Link href={`/jobs/${id}`}>
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{title}</p>
            <p className="text-xs text-gray-500 mt-1">{categoryName} · {city}</p>
          </div>
          <div className="ml-3 flex-shrink-0 text-right space-y-1">
            {status && statusLabel && <StatusBadge status={status} label={statusLabel} />}
            {proposalsCount != null && proposalsCount > 0 && (
              <p className="text-xs text-blue-600 font-medium">{proposalsCount} proposals</p>
            )}
            {(budgetMin || budgetMax) && (
              <p className="text-xs font-semibold text-gray-700">
                {budgetMin && budgetMax ? `฿${budgetMin}–${budgetMax}` : budgetMin ? `from ฿${budgetMin}` : `up to ฿${budgetMax}`}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
