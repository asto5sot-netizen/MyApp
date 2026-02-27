import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
export const FROM = 'ProService <noreply@proservice.th>'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL!
