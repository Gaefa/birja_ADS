'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { isLoggedIn, getRole } from '@/lib/auth'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    if (isLoggedIn()) {
      const role = getRole()
      if (role === 'BLOGGER') {
        router.push('/blogger/dashboard')
      } else if (role === 'ISSUER') {
        router.push('/issuer/dashboard')
      } else if (role === 'ADMIN') {
        router.push('/admin/verify')
      }
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="container text-center">
            <h1 className="text-5xl font-bold mb-4">Биржа рекламы для финансового рынка</h1>
            <p className="text-xl text-blue-100 mb-8">
              Надежная платформа, где верифицированные эмитенты подключаются к проверенным блогерам
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register" className="btn-primary">
                Начать работу
              </Link>
              <Link href="/login" className="btn-outline border-white text-white hover:bg-white hover:text-primary">
                Войти
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают нас</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-2">Эскроу-защита</h3>
                <p className="text-gray-600">
                  Средства блокируются на счете до завершения работы. Безопасность гарантирована.
                </p>
              </div>
              <div className="card text-center">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-xl font-semibold mb-2">Верифицированные эмитенты</h3>
                <p className="text-gray-600">
                  Все эмитенты проходят проверку. Работайте только с надежными партнерами.
                </p>
              </div>
              <div className="card text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-2">Все платформы</h3>
                <p className="text-gray-600">
                  Instagram, TikTok, YouTube, Telegram, Twitch - все в одном месте.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-gray-600">Активных блогеров</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100+</div>
                <p className="text-gray-600">Верифицированных эмитентов</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">₽50M+</div>
                <p className="text-gray-600">Объем сделок</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA for Bloggers */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="container">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Для блогеров</h2>
                <p className="text-gray-700 mb-4">
                  Зарабатывайте на своей аудитории. Находите безопасные сделки с проверенными эмитентами.
                </p>
              </div>
              <Link href="/register" className="btn-primary">
                Зарегистрироваться как блогер
              </Link>
            </div>
          </div>
        </section>

        {/* CTA for Issuers */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Для эмитентов</h2>
                <p className="text-gray-700 mb-4">
                  Запустите успешные кампании. Найдите идеальных блогеров в считанные минуты.
                </p>
              </div>
              <Link href="/register" className="btn-primary">
                Зарегистрироваться как эмитент
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
