'use client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  jobId: string
  onSubmitted: () => void
}

export function ProposalForm({ jobId, onSubmitted }: Props) {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ message: '', price: '', price_type: 'fixed', estimated_days: '' })
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true); setErr('')
    try {
      const res = await fetch(`/api/jobs/${jobId}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: form.message,
          price: parseFloat(form.price),
          price_type: form.price_type,
          estimated_days: form.estimated_days ? parseInt(form.estimated_days) : undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) { setErr(data.error); return }
      setShow(false)
      onSubmitted()
    } catch { setErr(t('common.error')) }
    finally { setSending(false) }
  }

  if (!show) return (
    <button onClick={() => setShow(true)}
      className="w-full border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors">
      {t('proposals.send')}
    </button>
  )

  return (
    <form onSubmit={send} className="border border-gray-200 rounded-xl p-4 mt-4 space-y-3">
      <h3 className="font-semibold text-gray-900">{t('proposals.send')}</h3>
      {err && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{err}</div>}
      <textarea required rows={3} value={form.message}
        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        placeholder={t('proposals.message')} />
      <div className="grid grid-cols-2 gap-3">
        <input type="number" required min="1" value={form.price}
          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder={t('proposals.price')} />
        <select value={form.price_type} onChange={e => setForm(f => ({ ...f, price_type: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
          <option value="fixed">{t('proposals.fixed')}</option>
          <option value="per_hour">{t('proposals.per_hour')}</option>
          <option value="negotiable">{t('proposals.negotiable')}</option>
        </select>
      </div>
      <input type="number" min="1" value={form.estimated_days}
        onChange={e => setForm(f => ({ ...f, estimated_days: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        placeholder={t('proposals.estimatedDays')} />
      <div className="flex gap-2">
        <button type="submit" disabled={sending}
          className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
          {sending ? t('common.loading') : t('proposals.send')}
        </button>
        <button type="button" onClick={() => setShow(false)}
          className="px-4 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}
