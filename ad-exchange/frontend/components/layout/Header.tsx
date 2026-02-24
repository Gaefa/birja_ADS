'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { isLoggedIn } from '@/lib/auth'

export default function Header() {
  const router = useRouter()
  const loggedIn = isLoggedIn()

  return (
    <header className="bg-white shadow-sm">
      <div className="container py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          Биржа Рекламы
        </Link>
        
        <nav className="flex gap-4">
          {!loggedIn ? (
            <>
              <Link href="/login" className="btn-outline">
                Войти
              </Link>
              <Link href="/register" className="btn-primary">
                Зарегистрироваться
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                localStorage.removeItem('access_token')
                localStorage.removeItem('user')
                router.push('/')
              }}
              className="btn-secondary"
            >
              Выход
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
