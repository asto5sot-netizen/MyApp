'use client'

interface SocialLink { key: string; label: string; icon: string; href: string; display: string; color: string }

interface Props {
  phone?: string
  socialLinks: SocialLink[]
}

export function ProContactsCard({ phone, socialLinks }: Props) {
  if (!phone && socialLinks.length === 0) return null
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-900 mb-3">📞 Contacts</h3>
      <div className="space-y-2">
        {phone && (
          <a href={`tel:${phone}`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700 font-medium">
            <span>📱</span><span>{phone}</span>
          </a>
        )}
        {socialLinks.map(link => (
          <a key={link.key} href={link.href} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors text-sm font-medium ${link.color}`}>
            <span>{link.icon}</span>
            <span className="flex-1">{link.label}</span>
            <span className="text-xs opacity-70 truncate max-w-[100px]">{link.display}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
