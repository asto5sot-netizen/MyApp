'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

interface Proposal {
  id: string
  job: { id: string; title: string }
  price: number
  status: string
}

interface Props {
  proposals: Proposal[]
}

export function ProposalList({ proposals }: Props) {
  const { t } = useTranslation()

  if (proposals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 text-center text-gray-400 text-sm">
        No proposals yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {proposals.slice(0, 6).map(p => (
        <Link key={p.id} href={`/jobs/${p.job.id}`}>
          <div className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-sm transition-shadow">
            <p className="text-sm font-medium text-gray-900 truncate">{p.job.title}</p>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                p.status === 'accepted' ? 'bg-green-100 text-green-700' :
                p.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {t(`proposals.status.${p.status}`)}
              </span>
              <span className="text-xs text-gray-500">฿{Number(p.price).toLocaleString()}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
