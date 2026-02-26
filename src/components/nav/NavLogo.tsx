'use client'

import { memo } from 'react'
import Link from 'next/link'

export const NavLogo = memo(function NavLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <span className="text-2xl font-bold text-blue-600">ProService</span>
      <span className="text-xs text-gray-500 hidden sm:block">Thailand</span>
    </Link>
  )
})
