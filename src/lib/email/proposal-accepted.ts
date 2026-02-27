import { resend, FROM, APP_URL } from './_client'

export async function sendProposalAcceptedEmail(to: string, jobTitle: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM, to,
    subject: `Your proposal was accepted — ${jobTitle}`,
    html: `<h2>Congratulations! Your proposal was accepted</h2><p>The client has accepted your proposal for: <strong>${jobTitle}</strong></p><p><a href="${APP_URL}/chat">Go to chat</a></p>`,
  }).catch((err: Error) => { console.error('[email:proposal-accepted]', err.message) })
}
