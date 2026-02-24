'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'blogger' | 'issuer'>('blogger')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Blogger form
  const [bloggerForm, setBloggerForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  })

  // Issuer form
  const [issuerForm, setIssuerForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyType: 'LLC',
  })

  const handleBloggerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (bloggerForm.password !== bloggerForm.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', {
        email: bloggerForm.email,
        password: bloggerForm.password,
        role: 'blogger',
        displayName: bloggerForm.displayName,
      })

      router.push('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при регистрации')
    } finally {
      setLoading(false)
    }
  }

  const handleIssuerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (issuerForm.password !== issuerForm.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', {
        email: issuerForm.email,
        password: issuerForm.password,
        role: 'issuer',
        companyName: issuerForm.companyName,
        companyType: issuerForm.companyType,
      })

      router.push('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="card">
        <h1 className="text-3xl font-bold mb-2">Биржа Рекламы</h1>
        <p className="text-gray-600 mb-8">Регистрация</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('blogger')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'blogger'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Я блогер
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('issuer')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'issuer'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Я эмитент
          </button>
        </div>

        {activeTab === 'blogger' ? (
          <form onSubmit={handleBloggerSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={bloggerForm.email}
                onChange={(e) => setBloggerForm({ ...bloggerForm, email: e.target.value })}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Имя</label>
              <input
                type="text"
                value={bloggerForm.displayName}
                onChange={(e) => setBloggerForm({ ...bloggerForm, displayName: e.target.value })}
                className="input-field"
                placeholder="Ваше имя"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Пароль</label>
              <input
                type="password"
                value={bloggerForm.password}
                onChange={(e) => setBloggerForm({ ...bloggerForm, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Подтверждение пароля</label>
              <input
                type="password"
                value={bloggerForm.confirmPassword}
                onChange={(e) => setBloggerForm({ ...bloggerForm, confirmPassword: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleIssuerSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={issuerForm.email}
                onChange={(e) => setIssuerForm({ ...issuerForm, email: e.target.value })}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Название компании</label>
              <input
                type="text"
                value={issuerForm.companyName}
                onChange={(e) => setIssuerForm({ ...issuerForm, companyName: e.target.value })}
                className="input-field"
                placeholder="ООО Моя компания"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Тип компании</label>
              <select
                value={issuerForm.companyType}
                onChange={(e) => setIssuerForm({ ...issuerForm, companyType: e.target.value })}
                className="input-field"
              >
                <option>LLC</option>
                <option>JSC</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Пароль</label>
              <input
                type="password"
                value={issuerForm.password}
                onChange={(e) => setIssuerForm({ ...issuerForm, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Подтверждение пароля</label>
              <input
                type="password"
                value={issuerForm.confirmPassword}
                onChange={(e) => setIssuerForm({ ...issuerForm, confirmPassword: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-gray-600">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
