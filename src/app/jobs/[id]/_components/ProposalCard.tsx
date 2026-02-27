'use client'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

interface ProProfile { rating: number; reviews_count: number; verification_status: string }
interface Pro { id: string; full_name: string; pro_profile: ProProfile }
export interface ProposalData {
  id: string; message: string; price: number; price_type: string
  estimated_days?: number; status: string
  pro: Pro
}

interface Props {
  proposal: ProposalData
  isOwner: boolean
  jobStatus: string
  onAccept: (id: string) => void
  t: (key: string) => string
}

export function ProposalCard({ proposal, isOwner, jobStatus, onAccept, t }: Props) {
  return (
    <div className={`border rounded-xl p-4 ${proposal.status === 'accepted' ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <Link href={`/pro/${proposal.pro.id}`} className="flex items-center gap-3 hover:opacity-80">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {proposal.pro.full_name[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{proposal.pro.full_name}</p>
            <p className="text-xs text-gray-500">
              ⭐ {proposal.pro.pro_profile.rating.toFixed(1)} · {proposal.pro.pro_profile.reviews_count} reviews
              {proposal.pro.pro_profile.verification_status === 'verified' && ' · ✓ Verified'}
            </p>
          </div>
        </Link>
        <div className="text-right">
          <p className="font-bold text-gray-900">฿{proposal.price.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{proposal.price_type}</p>
        </div>
      </div>
      <p className="text-sm text-gray-700 mb-3">{proposal.message}</p>
      {proposal.estimated_days && (
        <p className="text-xs text-gray-500 mb-3">⏱ {proposal.estimated_days} {t('common.days')}</p>
      )}
      <div className="flex items-center gap-2">
        {isOwner && proposal.status === 'pending' && jobStatus === 'open' && (
          <button onClick={() => onAccept(proposal.id)}
            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            {t('proposals.accept')}
          </button>
        )}
        {proposal.status === 'accepted' && (
          <span className="text-green-700 text-sm font-medium">✓ Accepted</span>
        )}
      </div>
    </div>
  )
}
