'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/hooks/useLang'
import { toast } from '@/lib/toast'

interface User { id: string; full_name: string; avatar_url?: string }
interface Message {
  id: string; content: string; content_translated?: Record<string, string>
  original_language: string; sender_id: string; is_read: boolean; created_at: string
  sender: User; message_type: string; attachment_url?: string
}
interface Conversation {
  id: string; job: { id: string; title: string; status: string }
  client: User; pro: User; last_message_at: string
  messages: Message[]
}

function ChatContent() {
  const { t } = useTranslation()
  const lang = useLang()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentUser, setCurrentUser] = useState<User & { id: string } | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<string | null>(searchParams.get('id'))
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/profile/me').then(r => r.json()),
      fetch('/api/conversations').then(r => r.json()),
    ]).then(([meData, convData]) => {
      if (!meData.success) { router.push('/auth/login'); return }
      setCurrentUser(meData.data.user)
      if (convData.success) setConversations(convData.data.conversations)
    })
  }, [router])

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConv) return
    fetch(`/api/conversations/${activeConv}/messages`)
      .then(r => r.json())
      .then(d => { if (d.success) setMessages(d.data.messages) })
  }, [activeConv])

  // Supabase Realtime subscription for new messages
  useEffect(() => {
    if (!activeConv) return

    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${activeConv}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConv}`,
        },
        (payload) => {
          const msg = payload.new as Message
          // Avoid duplicate if we just sent it
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getTranslated = (msg: Message) => {
    if (showOriginal[msg.id]) return msg.content
    return msg.content_translated?.[lang] || msg.content_translated?.['en'] || msg.content
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConv) return
    setSending(true)
    try {
      const res = await fetch(`/api/conversations/${activeConv}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      })
      const data = await res.json()
      if (data.success) {
        // Realtime will add it to messages list, but also add optimistically
        setMessages(prev => {
          if (prev.some(m => m.id === data.data.message.id)) return prev
          return [...prev, data.data.message]
        })
        setNewMessage('')
      } else {
        toast.error(data.error || 'Failed to send message')
      }
    } finally { setSending(false) }
  }

  const activeConversation = conversations.find(c => c.id === activeConv)
  const otherUser = activeConversation
    ? (currentUser?.id === activeConversation.client.id ? activeConversation.pro : activeConversation.client)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-72 border-r border-gray-100 flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">{t('chat.title')}</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">{t('chat.noConversations')}</div>
                ) : (
                  conversations.map(conv => {
                    const other = currentUser?.id === conv.client.id ? conv.pro : conv.client
                    const lastMsg = conv.messages[0]
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConv(conv.id)}
                        className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          activeConv === conv.id ? 'bg-blue-50 border-blue-100' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                            {other.full_name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{other.full_name}</p>
                            <p className="text-xs text-gray-400 truncate">{conv.job.title}</p>
                            {lastMsg && <p className="text-xs text-gray-500 mt-0.5 truncate">{lastMsg.content}</p>}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
              {activeConversation && otherUser ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {otherUser.full_name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{otherUser.full_name}</p>
                      <p className="text-xs text-gray-500">{activeConversation.job.title}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map(msg => {
                      const isMe = msg.sender_id === currentUser?.id
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`rounded-2xl px-4 py-2.5 ${
                              isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'
                            }`}>
                              <p className="text-sm">{getTranslated(msg)}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1 px-1">
                              <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {msg.original_language !== lang && (
                                <button
                                  onClick={() => setShowOriginal(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                  className="text-xs text-blue-500 hover:underline"
                                >
                                  {showOriginal[msg.id] ? 'Show translated' : t('chat.showOriginal')}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder={t('chat.placeholder')}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {t('chat.send')}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-sm">{t('chat.selectConversation')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <ChatContent />
    </Suspense>
  )
}
