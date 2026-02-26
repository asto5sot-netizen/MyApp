import { redis } from './redis'

export async function rateLimit(
  key: string,
  limit: number,
  windowSecs: number,
  { failClosed = false } = {}
): Promise<{ success: boolean; remaining: number }> {
  try {
    const current = await redis.incr(key)
    if (current === 1) {
      await redis.expire(key, windowSecs)
    }
    const remaining = Math.max(0, limit - current)
    return { success: current <= limit, remaining }
  } catch {
    // failClosed=true for security-critical endpoints (auth, OTP):
    // deny the request when Redis is unavailable to prevent bypass.
    // failClosed=false for non-critical endpoints: allow through.
    if (failClosed) return { success: false, remaining: 0 }
    return { success: true, remaining: limit }
  }
}

export async function authRateLimit(ip: string): Promise<boolean> {
  const key = `rate_limit:auth:${ip}`
  const { success } = await rateLimit(key, 10, 900, { failClosed: true })
  return success
}

export async function loginFailRateLimit(email: string): Promise<boolean> {
  const key = `rate_limit:login_fail:${email}`
  const { success } = await rateLimit(key, 5, 900, { failClosed: true })
  return success
}

export async function resetLoginFailCount(email: string): Promise<void> {
  const key = `rate_limit:login_fail:${email}`
  await redis.del(key).catch(() => {})
}

export async function jobCreateRateLimit(userId: string): Promise<boolean> {
  const key = `rate_limit:job_create:${userId}`
  // 10 jobs per hour per user
  const { success } = await rateLimit(key, 10, 3600, { failClosed: false })
  return success
}

export async function messageRateLimit(userId: string): Promise<boolean> {
  const key = `rate_limit:message:${userId}`
  // 60 messages per minute per user
  const { success } = await rateLimit(key, 60, 60, { failClosed: false })
  return success
}
