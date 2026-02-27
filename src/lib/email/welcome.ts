import { resend, FROM, APP_URL } from './_client'

export async function sendWelcomeEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM, to,
    subject: 'Welcome to ProService Thailand!',
    html: `<h2>Welcome, ${name}!</h2><p>Your account on ProService Thailand is ready.</p><p><a href="${APP_URL}">Go to ProService</a></p>`,
  }).catch((err: Error) => { console.error('[email:welcome]', err.message) })
}
