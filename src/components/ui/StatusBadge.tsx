type Status = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'pending' | 'accepted' | 'rejected'

const STATUS_STYLES: Record<Status, string> = {
  open: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const style = STATUS_STYLES[status as Status] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${style}`}>
      {label}
    </span>
  )
}
