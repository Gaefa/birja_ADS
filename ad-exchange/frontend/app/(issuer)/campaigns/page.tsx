'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'
import CampaignCard from '@/components/shared/CampaignCard'

export default function IssuerCampaigns() {
  const user = getUser()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brief: '',
    budgetPerBlogger: 10000,
    currency: 'RUB',
    bloggersNeeded: 5,
    platforms: [] as string[],
    deadline: '',
    isPrivate: false,
  })

  const { data: campaigns, isLoading, refetch } = useQuery({
    queryKey: ['issuer-campaigns'],
    queryFn: async () => {
      const res = await api.get('/issuer/campaigns')
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/campaigns', data)
      return res.data
    },
    onSuccess: () => {
      refetch()
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        brief: '',
        budgetPerBlogger: 10000,
        currency: 'RUB',
        bloggersNeeded: 5,
        platforms: [],
        deadline: '',
        isPrivate: false,
      })
    },
  })

  const handleTogglePlatform = (platform: string) => {
    setFormData({
      ...formData,
      platforms: formData.platforms.includes(platform)
        ? formData.platforms.filter((p) => p !== platform)
        : [...formData.platforms, platform],
    })
  }

  const handleCreateCampaign = async () => {
    try {
      await createMutation.mutateAsync(formData)
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Мои кампании</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + Новая кампания
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {campaigns.map((campaign: any) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onClick={(id) => {
                  // TODO: Open campaign applications
                }}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12 text-gray-600">
            У вас еще нет кампаний
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 space-y-4">
            <h2 className="text-2xl font-bold">Создать новую кампанию</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Название</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Название кампании"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Описание кампании"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Брифинг</label>
              <textarea
                value={formData.brief}
                onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Подробный брифинг для блогеров"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Бюджет на блогера</label>
                <input
                  type="number"
                  value={formData.budgetPerBlogger}
                  onChange={(e) =>
                    setFormData({ ...formData, budgetPerBlogger: Number(e.target.value) })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Валюта</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="input-field"
                >
                  <option>RUB</option>
                  <option>USD</option>
                  <option>USDT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Нужно блогеров</label>
                <input
                  type="number"
                  value={formData.bloggersNeeded}
                  onChange={(e) =>
                    setFormData({ ...formData, bloggersNeeded: Number(e.target.value) })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Дедлайн</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Платформы</label>
              <div className="grid grid-cols-2 gap-2">
                {['instagram', 'tiktok', 'youtube', 'telegram'].map((platform) => (
                  <label key={platform} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes(platform)}
                      onChange={() => handleTogglePlatform(platform)}
                      className="w-4 h-4"
                    />
                    <span className="capitalize">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="isPrivate"
                checked={formData.isPrivate && user?.isPro}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                disabled={!user?.isPro}
                className="w-4 h-4"
              />
              <label htmlFor="isPrivate" className="text-sm flex-1">
                Приватная кампания {!user?.isPro && '(только для Pro)'}
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary flex-1"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateCampaign}
                disabled={
                  createMutation.isPending ||
                  !formData.title ||
                  formData.platforms.length === 0
                }
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
