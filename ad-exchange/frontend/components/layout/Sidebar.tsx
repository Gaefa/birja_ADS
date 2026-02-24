'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { getRole, getUser, logout } from '@/lib/auth'
import { useEffect, useState } from 'react'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState<string | null>(null)
  const [user, setUserData] = useState<any>(null)

  useEffect(() => {
    setRole(getRole())
    setUserData(getUser())
  }, [])

  const getBloggerNav = () => [
    { href: '/blogger/dashboard', label: 'Дашборд' },
    { href: '/blogger/profile', label: 'Профиль' },
    { href: '/blogger/campaigns', label: 'Кампании' },
    { href: '/blogger/deals', label: 'Сделки' },
  ]

  const getIssuerNav = () => [
    { href: '/issuer/dashboard', label: 'Дашборд' },
    { href: '/issuer/campaigns', label: 'Кампании' },
    { href: '/issuer/catalog', label: 'Каталог блогеров' },
    { href: '/issuer/settings', label: 'Настройки' },
  ]

  const getAdminNav = () => [
    { href: '/admin/verify', label: 'Верификация' },
    { href: '/admin/disputes', label: 'Споры' },
    { href: '/admin/stats', label: 'Статистика' },
  ]

  const getNavItems = () => {
    if (role === 'blogger') return getBloggerNav()
    if (role === 'issuer') return getIssuerNav()
    if (role === 'admin') return getAdminNav()
    return []
  }

  return (
    <div className="bg-primary text-white w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-blue-400">
        <Link href="/" className="text-2xl font-bold">
          БР
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {getNavItems().map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-400 font-semibold'
                  : 'hover:bg-blue-400'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-blue-400">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-primary font-bold">
            {user?.displayName?.[0] || user?.companyName?.[0] || '?'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {user?.displayName || user?.companyName || 'User'}
            </p>
            <p className="text-xs text-blue-200">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full bg-blue-400 hover:bg-blue-500 text-white py-2 rounded-lg font-semibold transition-colors"
        >
          Выход
        </button>
      </div>
    </div>
  )
}
