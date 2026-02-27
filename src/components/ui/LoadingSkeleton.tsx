export function LoadingSkeleton({ rows = 3, height = 'h-20' }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`${height} bg-white rounded-2xl animate-pulse border border-gray-100`} />
      ))}
    </div>
  )
}
