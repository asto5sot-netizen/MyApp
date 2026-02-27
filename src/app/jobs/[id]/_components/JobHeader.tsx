'use client'
import { useTranslation } from 'react-i18next'

interface Props {
  title: string
  description: string
  status: string
  createdAt: string
  categoryName: string
}

export function JobHeader({ title, description, status, createdAt, categoryName }: Props) {
  const { t } = useTranslation()
  const statusClass =
    status === 'open' ? 'bg-green-100 text-green-700' :
    status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
    'bg-gray-100 text-gray-600'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusClass}`}>
          {t(`jobs.status.${status}`)}
        </span>
        <span className="text-sm text-gray-400">{new Date(createdAt).toLocaleDateString()}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-sm text-blue-600 font-medium mb-4">{categoryName}</p>
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
    </div>
  )
}
