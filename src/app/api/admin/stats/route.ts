import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { getAdminUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse } from '@/lib/api-response'

interface DayRow { day: string; count: number }

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return unauthorizedResponse()

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers, clients, pros,
    newToday, newWeek, newMonth,
    totalJobs, openJobs, inProgressJobs, doneJobs, cancelledJobs,
    totalProposals, totalReviews,
    totalConversations, totalMessages,
    pendingVerification,
    recentUsers, recentJobs,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { role: 'client' } }),
    prisma.profile.count({ where: { role: 'pro' } }),
    prisma.profile.count({ where: { created_at: { gte: todayStart } } }),
    prisma.profile.count({ where: { created_at: { gte: weekAgo } } }),
    prisma.profile.count({ where: { created_at: { gte: monthAgo } } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: 'open' } }),
    prisma.job.count({ where: { status: 'in_progress' } }),
    prisma.job.count({ where: { status: 'done' } }),
    prisma.job.count({ where: { status: 'cancelled' } }),
    prisma.proposal.count(),
    prisma.review.count(),
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.proProfile.count({ where: { verification_status: 'pending' } }),
    prisma.profile.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      select: {
        id: true, full_name: true, email: true,
        role: true, created_at: true, city: true,
      },
    }),
    prisma.job.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      select: {
        id: true, title: true, status: true,
        city: true, created_at: true, proposals_count: true,
        budget_min: true, budget_max: true,
      },
    }),
  ])

  const registrationTrend = await prisma.$queryRaw<DayRow[]>`
    SELECT to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
           COUNT(*)::int AS count
    FROM "profiles"
    WHERE created_at >= ${monthAgo}
    GROUP BY to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')
    ORDER BY day ASC
  `

  const days30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })
  const pvValues = await redis.mget(...days30.map(day => `pageviews:${day}`))
  const pvRaw = days30.map((day, i) => ({ day, count: parseInt(pvValues[i] || '0') }))

  return successResponse({
    users: { total: totalUsers, clients, pros, newToday, newWeek, newMonth },
    jobs: { total: totalJobs, open: openJobs, inProgress: inProgressJobs, done: doneJobs, cancelled: cancelledJobs },
    engagement: { proposals: totalProposals, reviews: totalReviews, conversations: totalConversations, messages: totalMessages },
    pendingVerification,
    recentUsers,
    recentJobs: recentJobs.map(j => ({
      ...j,
      budget_min: j.budget_min ? Number(j.budget_min) : null,
      budget_max: j.budget_max ? Number(j.budget_max) : null,
    })),
    registrationTrend,
    pageviews: pvRaw,
  })
}
