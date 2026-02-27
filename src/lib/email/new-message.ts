import { resend, FROM, APP_URL } from './_client'

export async function sendNewMessageEmail(to: string, senderName: string, conversationId: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM, to,
    subject: `New message from ${senderName}`,
    html: `<h2>You have a new message</h2><p><strong>${senderName}</strong> sent you a message on ProService.</p><p><a href="${APP_URL}/chat?id=${conversationId}">Open chat</a></p>`,
  }).catch((err: Error) => { console.error('[email:new-message]', err.message) })
}
