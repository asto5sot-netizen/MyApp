import { resend, FROM, APP_URL } from './_client'

export async function sendNewProposalEmail(to: string, jobTitle: string, jobId: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM, to,
    subject: `New proposal on "${jobTitle}"`,
    html: `<h2>You received a new proposal</h2><p>A professional has submitted a proposal for your job: <strong>${jobTitle}</strong></p><p><a href="${APP_URL}/jobs/${jobId}">View proposals</a></p>`,
  }).catch((err: Error) => { console.error('[email:new-proposal]', err.message) })
}
