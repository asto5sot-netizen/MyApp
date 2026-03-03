'use client'

import { useTranslation } from 'react-i18next'

const STEP_KEYS = ['open', 'in_progress', 'done'] as const
const ORDER = [...STEP_KEYS]

interface Props {
  status: string
  onMarkDone?: () => void
  isOwner?: boolean
}

export function JobTimeline({ status, onMarkDone, isOwner }: Props) {
  const { t } = useTranslation()
  const currentIdx = ORDER.indexOf(status as typeof ORDER[number])
  const isCancelled = status === 'cancelled'

  if (isCancelled) return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
        <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs">✕</span>
        {t('jobs.timeline.cancelled')}
      </div>
    </div>
  )

  const statusLabels: Record<string, string> = {
    open: t('jobs.status.open'),
    in_progress: t('jobs.status.in_progress'),
    done: t('jobs.status.done'),
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center">
        {STEP_KEYS.map((stepKey, i) => {
          const done = currentIdx > i
          const active = currentIdx === i
          return (
            <div key={stepKey} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done    ? 'bg-green-500 text-white' :
                  active  ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                            'bg-gray-100 text-gray-400'
                }`}>
                  {done ? '✓' : i + 1}
                </div>
                <p className={`text-xs font-medium mt-1 whitespace-nowrap ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                  {statusLabels[stepKey]}
                </p>
              </div>
              {i < STEP_KEYS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {status === 'in_progress' && isOwner && onMarkDone && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">{t('jobs.timeline.isFinished')}</p>
          <button
            onClick={onMarkDone}
            className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
          >
            ✓ {t('jobs.timeline.markDone')}
          </button>
        </div>
      )}
    </div>
  )
}
