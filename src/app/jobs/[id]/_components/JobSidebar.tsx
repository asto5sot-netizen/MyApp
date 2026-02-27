'use client'

interface JobDetails {
  budget_min?: number; budget_max?: number
  city: string; district?: string; preferred_date?: string; proposals_count: number
}
interface Client { full_name: string }

interface Props {
  job: JobDetails
  client: Client
}

export function JobSidebar({ job, client }: Props) {
  return (
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
            {client.full_name[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{client.full_name}</p>
            <p className="text-xs text-gray-500">Client</p>
          </div>
        </div>
      </div>
    </div>
  )
}
