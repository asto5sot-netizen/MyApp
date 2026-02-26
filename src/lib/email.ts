import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'ProService <noreply@proservice.th>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendWelcomeEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to ProService Thailand!',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your account on ProService Thailand is ready.</p>
      <p><a href="${APP_URL}">Go to ProService</a></p>
    `,
  }).catch(console.error)
}

export async function sendNewProposalEmail(to: string, jobTitle: string, jobId: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New proposal on "${jobTitle}"`,
    html: `
      <h2>You received a new proposal</h2>
      <p>A professional has submitted a proposal for your job: <strong>${jobTitle}</strong></p>
      <p><a href="${APP_URL}/jobs/${jobId}">View proposals</a></p>
    `,
  }).catch(console.error)
}

export async function sendProposalAcceptedEmail(to: string, jobTitle: string, jobId: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your proposal was accepted — ${jobTitle}`,
    html: `
      <h2>Congratulations! Your proposal was accepted</h2>
      <p>The client has accepted your proposal for: <strong>${jobTitle}</strong></p>
      <p><a href="${APP_URL}/chat">Go to chat</a></p>
    `,
  }).catch(console.error)
}

export async function sendNewMessageEmail(to: string, senderName: string, conversationId: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New message from ${senderName}`,
    html: `
      <h2>You have a new message</h2>
      <p><strong>${senderName}</strong> sent you a message on ProService.</p>
      <p><a href="${APP_URL}/chat?id=${conversationId}">Open chat</a></p>
    `,
  }).catch(console.error)
}

export async function sendNewReviewEmail(to: string, rating: number, jobTitle: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New review — ${rating}★ for "${jobTitle}"`,
    html: `
      <h2>You received a new review</h2>
      <p>Rating: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</p>
      <p>Job: <strong>${jobTitle}</strong></p>
      <p><a href="${APP_URL}/dashboard/pro">View your reviews</a></p>
    `,
  }).catch(console.error)
}
