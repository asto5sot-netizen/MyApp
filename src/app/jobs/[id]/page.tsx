'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface User { id: string; full_name: string; avatar_url?: string; preferred_language: string }
interface ProProfile { rating: number; reviews_count: number; completed_jobs: number; city: string; verification_status: string; hourly_rate?: number }
interface Proposal {
  id: string; message: string; message_translated?: Record<string, string>; price: number;
  price_type: string; estimated_days?: number; status: string; created_at: string
  pro: User & { pro_profile: ProProfile }
}
interface Job {
  id: string; title: string; description: string; title_translated?: Record<string, string>
  description_translated?: Record<string, string>; original_language: string
  budget_min?: number; budget_max?: number; city: string; district?: string
  location_address?: string; preferred_date?: string; status: string
  proposals_count: number; created_at: string
  category: { name_en: string; name_ru: string; name_th: string }
  client: User
  proposals: Proposal[]
}

export default function JobPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null)
  const [proposalForm, setProposalForm] = useState({ message: '', price: '', price_type: 'fixed', estimated_days: '' })
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')
  const [showProposalForm, setShowProposalForm] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/jobs/${id}`).then(r => r.json()),
      fetch('/api/profile/me').then(r => r.json()),
    ]).then(([jobData, meData]) => {
      if (jobData.success) setJob(jobData.data.job)
      if (meData.success) setCurrentUser(meData.data.user)
    })
  }, [id])

  const getTranslated = (map?: Record<string, string>, original?: string) => {
    if (!map) return original || ''
    return map[i18n.language] || map['en'] || original || ''
  }

  const sendProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setErr('')
    try {
      const res = await fetch(`/api/jobs/${id}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: proposalForm.message,
          price: parseFloat(proposalForm.price),
          price_type: proposalForm.price_type,
          estimated_days: proposalForm.estimated_days ? parseInt(proposalForm.estimated_days) : undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) { setErr(data.error); return }
      setShowProposalForm(false)
      // Refresh
      const updated = await fetch(`/api/jobs/${id}`).then(r => r.json())
      if (updated.success) setJob(updated.data.job)
    } catch { setErr(t('common.error')) }
    finally { setSending(false) }
  }

  const acceptProposal = async (proposalId: string) => {
    if (!confirm('Accept this proposal?')) return
    const res = await fetch(`/api/proposals/${proposalId}/accept`, { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      const updated = await fetch(`/api/jobs/${id}`).then(r => r.json())
      if (updated.success) setJob(updated.data.job)
    }
  }

  if (!job) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    </div>
  )

  const isOwner = currentUser?.id === job.client.id
  const isPro = currentUser?.role === 'pro'
  const hasProposed = job.proposals.some(p => p.pro.id === currentUser?.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-blue-600 text-sm flex items-center gap-1 mb-4 hover:underline">
          ← {t('common.back')}
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  job.status === 'open' ? 'bg-green-100 text-green-700' :
                  job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {t(`jobs.status.${job.status}`)}
                </span>
                <span className="text-sm text-gray-400">{new Date(job.created_at).toLocaleDateString()}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {getTranslated(job.title_translated as Record<string, string>, job.title)}
              </h1>
              <p className="text-sm text-blue-600 font-medium mb-4">{job.category.name_en}</p>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {getTranslated(job.description_translated as Record<string, string>, job.description)}
              </p>
            </div>

            {/* Proposals */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t('proposals.title')} ({job.proposals.length})
              </h2>
              {job.proposals.length === 0 ? (
                <p className="text-gray-400 text-sm">{t('proposals.noProposals')}</p>
              ) : (
                <div className="space-y-4">
                  {job.proposals.map(proposal => (
                    <div key={proposal.id} className={`border rounded-xl p-4 ${
                      proposal.status === 'accepted' ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
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
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">฿{proposal.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{proposal.price_type}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        {getTranslated(proposal.message_translated as Record<string, string>, proposal.message)}
                      </p>
                      {proposal.estimated_days && (
                        <p className="text-xs text-gray-500 mb-3">⏱ {proposal.estimated_days} {t('common.days')}</p>
                      )}
                      <div className="flex items-center gap-2">
                        {isOwner && proposal.status === 'pending' && job.status === 'open' && (
                          <button
                            onClick={() => acceptProposal(proposal.id)}
                            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            {t('proposals.accept')}
                          </button>
                        )}
                        {proposal.status === 'accepted' && (
                          <span className="text-green-700 text-sm font-medium">✓ Accepted</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Send proposal form for pros */}
              {isPro && job.status === 'open' && !hasProposed && (
                <div className="mt-4">
                  {!showProposalForm ? (
                    <button
                      onClick={() => setShowProposalForm(true)}
                      className="w-full border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      {t('proposals.send')}
                    </button>
                  ) : (
                    <form onSubmit={sendProposal} className="border border-gray-200 rounded-xl p-4 mt-4 space-y-3">
                      <h3 className="font-semibold text-gray-900">{t('proposals.send')}</h3>
                      {err && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{err}</div>}
                      <textarea
                        required rows={3}
                        value={proposalForm.message}
                        onChange={e => setProposalForm(f => ({ ...f, message: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder={t('proposals.message')}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number" required min="1"
                          value={proposalForm.price}
                          onChange={e => setProposalForm(f => ({ ...f, price: e.target.value }))}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder={t('proposals.price')}
                        />
                        <select
                          value={proposalForm.price_type}
                          onChange={e => setProposalForm(f => ({ ...f, price_type: e.target.value }))}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="fixed">{t('proposals.fixed')}</option>
                          <option value="per_hour">{t('proposals.per_hour')}</option>
                          <option value="negotiable">{t('proposals.negotiable')}</option>
                        </select>
                      </div>
                      <input
                        type="number" min="1"
                        value={proposalForm.estimated_days}
                        onChange={e => setProposalForm(f => ({ ...f, estimated_days: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder={t('proposals.estimatedDays')}
                      />
                      <div className="flex gap-2">
                        <button type="submit" disabled={sending} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
                          {sending ? t('common.loading') : t('proposals.send')}
                        </button>
                        <button type="button" onClick={() => setShowProposalForm(false)} className="px-4 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                          {t('common.cancel')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
              {hasProposed && <p className="mt-4 text-sm text-green-600">✓ You have already submitted a proposal</p>}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Job Details</h3>
              <div className="space-y-2 text-sm">
                {(job.budget_min || job.budget_max) && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-medium text-gray-900">
                      {job.budget_min && `฿${job.budget_min.toLocaleString()}`}
                      {job.budget_min && job.budget_max && ' — '}
                      {job.budget_max && `฿${job.budget_max.toLocaleString()}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">City</span>
                  <span className="font-medium text-gray-900">{job.city}</span>
                </div>
                {job.district && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">District</span>
                    <span className="font-medium text-gray-900">{job.district}</span>
                  </div>
                )}
                {job.preferred_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-900">{new Date(job.preferred_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Proposals</span>
                  <span className="font-medium text-gray-900">{job.proposals_count}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Posted by</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                  {job.client.full_name[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{job.client.full_name}</p>
                  <p className="text-xs text-gray-500">Client</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
