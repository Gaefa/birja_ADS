'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getRole } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'

export default function IssuerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const role = getRole()
    if (role !== 'ISSUER') {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}
