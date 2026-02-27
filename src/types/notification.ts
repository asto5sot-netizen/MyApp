export type NotificationType =
  | 'new_proposal'
  | 'new_message'
  | 'job_accepted'
  | 'new_review'
  | 'email_verified'
  | 'proposal_accepted'

export interface Notification {
  id: string
  title: string
  body: string
  type: NotificationType
  is_read: boolean
  created_at: string
}
