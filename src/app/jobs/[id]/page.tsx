'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { JobHeader } from './_components/JobHeader'
import { ProposalCard, type ProposalData } from './_components/ProposalCard'
import { ProposalForm } from './_components/ProposalForm'
import { JobSidebar } from './_components/JobSidebar'
import { JobTimeline } from './_components/JobTimeline'
import { toast } from '@/lib/toast'

interface Job {
  id: string; title: string; description: string
  title_translated?: Record<string, string>; description_translated?: Record<string, string>
  budget_min?: number; budget_max?: number; city: string; district?: string
  preferred_date?: string; status: string; proposals_count: number; created_at: string
  category: { name_en: string; name_ru: string; name_th: string }
  client: { id: string; full_name: string }
  proposals: ProposalData[]
}

export default function JobPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null)
  const [confirmProposalId, setConfirmProposalId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const load = () => Promise.all([
    fetch(`/api/jobs/${id}`).then(r => r.json()),
    fetch('/api/profile/me').then(r => r.json()),
  ]).then(([jobData, meData]) => {
    if (jobData.success) setJob(jobData.data.job)
    if (meData.success) setCurrentUser(meData.data.user)
  })

  useEffect(() => { load() }, [id])

  const getT = (map?: Record<string, string>, orig?: string) =>
    map ? (map[i18n.language] || map['en'] || orig || '') : (orig || '')

  const acceptProposal = async (proposalId: string) => {
    setConfirmProposalId(proposalId)
  }

  const confirmAccept = async () => {
    if (!confirmProposalId) return
    const res = await fetch(`/api/proposals/${confirmProposalId}/accept`, { method: 'POST' })
    const data = await res.json()
    setConfirmProposalId(null)
    if (data.success) {
      if (data.data?.conversation_id) setConversationId(data.data.conversation_id)
      load()
    }
  }

  const markDone = async () => {
    if (!job) return
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    })
    const data = await res.json()
    if (data.success) {
      setJob(prev => prev ? { ...prev, status: 'done' } : prev)
      toast.success('Job marked as completed!')
    } else {
      toast.error(data.error || 'Failed to update job')
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

      {/* Confirm modal */}
      {confirmProposalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Accept proposal?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Other proposals will be declined and the job will move to In Progress.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmProposalId(null)}
                className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAccept}
                className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors"
              >
                Yes, Accept
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-blue-600 text-sm flex items-center gap-1 mb-4 hover:underline">
          ← {t('common.back')}
        </button>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {/* Job status timeline */}
            <JobTimeline
              status={job.status}
              isOwner={isOwner}
              onMarkDone={markDone}
            />

            <JobHeader
              title={getT(job.title_translated, job.title)}
              description={getT(job.description_translated, job.description)}
              status={job.status} createdAt={job.created_at}
              categoryName={job.category.name_en} />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t('proposals.title')} ({job.proposals.length})
              </h2>
              {job.proposals.length === 0
                ? <p className="text-gray-400 text-sm">{t('proposals.noProposals')}</p>
                : <div className="space-y-4">
                    {job.proposals.map(p => (
                      <ProposalCard key={p.id} proposal={p} isOwner={isOwner}
                        jobStatus={job.status} onAccept={acceptProposal} t={t} />
                    ))}
                  </div>}
              {isOwner && conversationId && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-800">Proposal accepted!</p>
                    <p className="text-xs text-green-600">You can now chat with the professional</p>
                  </div>
                  <Link
                    href={`/chat?id=${conversationId}`}
                    className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    💬 Open chat
                  </Link>
                </div>
              )}
              {isOwner && !conversationId && job.status === 'in_progress' && (() => {
                const accepted = job.proposals.find(p => p.status === 'accepted')
                return accepted ? (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                    <p className="text-sm font-semibold text-blue-800">Job is in progress</p>
                    <Link
                      href="/chat"
                      className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      💬 Go to chat
                    </Link>
                  </div>
                ) : null
              })()}
              {isPro && job.status === 'open' && !hasProposed && (
                <div className="mt-4">
                  <ProposalForm jobId={id as string} onSubmitted={load} />
                </div>
              )}
              {hasProposed && <p className="mt-4 text-sm text-green-600">✓ You have already submitted a proposal</p>}
            </div>
          </div>
          <JobSidebar job={job} client={job.client} />
        </div>
      </div>
    </div>
  )
}
