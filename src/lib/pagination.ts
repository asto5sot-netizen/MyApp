/**
 * Extracts pagination params from URL search params.
 * Replaces the common 3-line pattern in GET endpoints.
 *
 * Usage:
 *   const { page, limit, skip } = getPaginationParams(searchParams)
 *   const { page, limit, skip } = getPaginationParams(searchParams, 50) // custom default limit
 */
export function getPaginationParams(
  searchParams: URLSearchParams,
  defaultLimit = 20
) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(parseInt(searchParams.get('limit') || String(defaultLimit)), 100)
  return { page, limit, skip: (page - 1) * limit }
}
