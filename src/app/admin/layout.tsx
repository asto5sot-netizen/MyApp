import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminUser } from '@/lib/auth-middleware'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-gray-900 border-r border-gray-800 flex flex-col z-40">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-800">
          <Link href="/" className="block">
            <div className="text-white font-bold text-lg tracking-tight">ProService</div>
            <div className="text-blue-400 text-xs font-medium mt-0.5">Admin Panel</div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <SideLink href="/admin" icon={<IconChart />} label="Dashboard" exact />
          <SideLink href="/admin/users" icon={<IconUsers />} label="Users" />
          <SideLink href="/admin/categories" icon={<IconTag />} label="Categories" />
        </nav>

        {/* Bottom: admin info + logout */}
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="text-gray-400 text-xs truncate">{user.email}</div>
          <div className="text-gray-600 text-xs mt-0.5 capitalize">{user.role}</div>
          <Link
            href="/"
            className="mt-3 block text-xs text-gray-500 hover:text-white transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <main className="ml-60 flex-1 min-h-screen bg-gray-950 text-gray-100">
        {children}
      </main>
    </div>
  )
}

// ── Sidebar link component ────────────────────────────────────────────────────
function SideLink({
  href,
  icon,
  label,
  exact = false,
}: {
  href: string
  icon: React.ReactNode
  label: string
  exact?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors group"
    >
      <span className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0">
        {icon}
      </span>
      {label}
    </Link>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconTag() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}
