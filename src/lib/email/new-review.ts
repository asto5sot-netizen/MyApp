import { resend, FROM, APP_URL } from './_client'

export async function sendNewReviewEmail(to: string, rating: number, jobTitle: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM, to,
    subject: `New review — ${rating}★ for "${jobTitle}"`,
    html: `<h2>You received a new review</h2><p>Rating: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</p><p>Job: <strong>${jobTitle}</strong></p><p><a href="${APP_URL}/dashboard/pro">View your reviews</a></p>`,
  }).catch((err: Error) => { console.error('[email:new-review]', err.message) })
}
