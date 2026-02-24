'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import PriceListEditor from '@/components/blogger/PriceListEditor'
import { PriceListItem, SocialAccount } from '@/types'

export default function BloggerProfile() {
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'pricing' | 'portfolio'>(
    'basic'
  )

  const { data: profile, isLoading } = useQuery({
    queryKey: ['blogger-profile'],
    queryFn: async () => {
      const res = await api.get('/blogger/profile')
      return res.data
    },
  })

  const [basicForm, setBasicForm] = useState({
    displayName: '',
    bio: '',
    niche: '',
    geoCountry: '',
    telegramContact: '',
  })

  const [newSocial, setNewSocial] = useState({
    platform: 'instagram' as SocialAccount['platform'],
    username: '',
    url: '',
    followersCount: 0,
    avgViews: 0,
    engagementRate: 0,
  })

  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
  const [priceList, setPriceList] = useState<PriceListItem[]>([])

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put('/blogger/profile', data)
      return res.data
    },
  })

  const updatePriceListMutation = useMutation({
    mutationFn: async (prices: PriceListItem[]) => {
      const res = await api.put('/blogger/price-list', { items: prices })
      return res.data
    },
  })

  const addSocialMutation = useMutation({
    mutationFn: async (social: any) => {
      const res = await api.post('/blogger/social-accounts', social)
      return res.data
    },
  })

  const handleAddSocial = async () => {
    if (!newSocial.username) return
    try {
      const result = await addSocialMutation.mutateAsync(newSocial)
      setSocialAccounts([...socialAccounts, result])
      setNewSocial({
        platform: 'instagram',
        username: '',
        url: '',
        followersCount: 0,
        avgViews: 0,
        engagementRate: 0,
      })
    } catch (error) {
      console.error('Error adding social account:', error)
    }
  }

  const handleRemoveSocial = async (socialId: string) => {
    try {
      await api.delete(`/blogger/social-accounts/${socialId}`)
      setSocialAccounts(socialAccounts.filter((s) => s.id !== socialId))
    } catch (error) {
      console.error('Error removing social account:', error)
    }
  }

  if (isLoading) {
    return <div className="p-8">Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Мой профиль</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {[
            { id: 'basic', label: 'Основное' },
            { id: 'social', label: 'Соцсети' },
            { id: 'pricing', label: 'Прайс-лист' },
            { id: 'portfolio', label: 'Портфолио' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'basic' && (
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Имя</label>
              <input
                type="text"
                value={basicForm.displayName}
                onChange={(e) => setBasicForm({ ...basicForm, displayName: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Биография</label>
              <textarea
                value={basicForm.bio}
                onChange={(e) => setBasicForm({ ...basicForm, bio: e.target.value })}
                className="input-field"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Тематика</label>
              <select
                value={basicForm.niche}
                onChange={(e) => setBasicForm({ ...basicForm, niche: e.target.value })}
                className="input-field"
              >
                <option>Финансы</option>
                <option>Крипто</option>
                <option>Инвестиции</option>
                <option>Технологии</option>
                <option>Другое</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Страна</label>
              <input
                type="text"
                value={basicForm.geoCountry}
                onChange={(e) => setBasicForm({ ...basicForm, geoCountry: e.target.value })}
                className="input-field"
                placeholder="RU"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telegram контакт</label>
              <input
                type="text"
                value={basicForm.telegramContact}
                onChange={(e) => setBasicForm({ ...basicForm, telegramContact: e.target.value })}
                className="input-field"
                placeholder="@username"
              />
            </div>

            <button
              onClick={() =>
                updateProfileMutation.mutate({
                  ...basicForm,
                })
              }
              className="btn-primary"
            >
              Сохранить
            </button>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Добавить соцсеть</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <select
                  value={newSocial.platform}
                  onChange={(e) =>
                    setNewSocial({
                      ...newSocial,
                      platform: e.target.value as SocialAccount['platform'],
                    })
                  }
                  className="input-field"
                >
                  <option>instagram</option>
                  <option>tiktok</option>
                  <option>youtube</option>
                  <option>telegram</option>
                  <option>twitch</option>
                </select>
                <input
                  type="text"
                  value={newSocial.username}
                  onChange={(e) => setNewSocial({ ...newSocial, username: e.target.value })}
                  placeholder="username"
                  className="input-field"
                />
                <input
                  type="url"
                  value={newSocial.url}
                  onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                  placeholder="URL профиля"
                  className="input-field col-span-2"
                />
                <input
                  type="number"
                  value={newSocial.followersCount}
                  onChange={(e) =>
                    setNewSocial({ ...newSocial, followersCount: Number(e.target.value) })
                  }
                  placeholder="Подписчики"
                  className="input-field"
                />
                <input
                  type="number"
                  value={newSocial.avgViews}
                  onChange={(e) =>
                    setNewSocial({ ...newSocial, avgViews: Number(e.target.value) })
                  }
                  placeholder="Средние просмотры"
                  className="input-field"
                />
              </div>
              <button
                onClick={handleAddSocial}
                disabled={addSocialMutation.isPending}
                className="btn-primary"
              >
                Добавить
              </button>
            </div>

            <div className="space-y-2">
              {socialAccounts.map((social) => (
                <div key={social.id} className="card border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {social.platform} - @{social.username}
                      </p>
                      <p className="text-sm text-gray-600">
                        👥 {social.followersCount.toLocaleString()} подписчиков
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveSocial(social.id)}
                      className="btn-danger text-sm py-1 px-3"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="card">
            <PriceListEditor
              items={priceList}
              onUpdate={(items) => {
                setPriceList(items)
                updatePriceListMutation.mutate(items)
              }}
              isLoading={updatePriceListMutation.isPending}
            />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="card">
            <h3 className="font-semibold mb-4">Портфолио</h3>
            <p className="text-gray-600">Функция портфолио будет добавлена</p>
          </div>
        )}
      </div>
    </div>
  )
}
