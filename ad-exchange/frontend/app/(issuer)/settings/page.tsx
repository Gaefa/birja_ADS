'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'

export default function IssuerSettings() {
  const user = getUser()
  const [formData, setFormData] = useState({
    companyName: '',
    companyType: '',
    website: '',
    description: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        companyName: user.companyName || '',
        companyType: user.companyType || '',
        website: '',
        description: '',
      })
    }
  }, [user])

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put('/issuer/profile', data)
      return res.data
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateMutation.mutateAsync(formData)
    } catch (error) {
      console.error('Error updating settings:', error)
    }
  }

  if (!user) {
    return <div className="p-8">Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Настройки</h1>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Название компании</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Тип компании</label>
              <select
                value={formData.companyType}
                onChange={(e) =>
                  setFormData({ ...formData, companyType: e.target.value })
                }
                className="input-field"
              >
                <option>LLC</option>
                <option>JSC</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Сайт компании</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="input-field"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input-field"
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-primary"
            >
              {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        </div>

        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-4">Статус подписки</h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              Текущий план:{' '}
              <span className="font-bold">
                {user.isPro ? 'Pro' : 'Base'}
              </span>
            </p>
            <p className="text-gray-600">
              Верифицирован:{' '}
              <span className={user.isVerified ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {user.isVerified ? 'Да' : 'На проверке'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
