import type { User } from './profile'

export interface Message {
  id: string
  content: string
  content_translated?: Record<string, string>
  original_language: string
  sender_id: string
  is_read: boolean
  created_at: string
  sender: User
  message_type: string
  attachment_url?: string
}

export interface Conversation {
  id: string
  job: { id: string; title: string; status: string }
  client: User
  pro: User
  last_message_at: string
  messages?: Message[]
}
