'use client'

const STEPS = [
  { key: 'open',        label: 'Open',        desc: 'Accepting proposals' },
  { key: 'in_progress', label: 'In Progress',  desc: 'Work underway' },
  { key: 'done',        label: 'Completed',    desc: 'Job done' },
]

const ORDER = ['open', 'in_progress', 'done']

interface Props {
  status: string
  onMarkDone?: () => void
  isOwner?: boolean
}

export function JobTimeline({ status, onMarkDone, isOwner }: Props) {
  const currentIdx = ORDER.indexOf(status)
  const isCancelled = status === 'cancelled'

  if (isCancelled) return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
        <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs">✕</span>
        Job Cancelled
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const done = currentIdx > i
          const active = currentIdx === i
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done    ? 'bg-green-500 text-white' :
                  active  ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                            'bg-gray-100 text-gray-400'
                }`}>
                  {done ? '✓' : i + 1}
                </div>
                <p className={`text-xs font-medium mt-1 whitespace-nowrap ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {status === 'in_progress' && isOwner && onMarkDone && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">Is the job finished?</p>
          <button
            onClick={onMarkDone}
            className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
          >
            ✓ Mark as Done
          </button>
        </div>
      )}
    </div>
  )
}
