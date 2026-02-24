'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import BloggerCard from '@/components/issuer/BloggerCard'
import { BloggerProfile } from '@/types'

export default function IssuerCatalog() {
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [minFollowers, setMinFollowers] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000000)
  const [selectedBlogger, setSelectedBlogger] = useState<BloggerProfile | null>(null)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerData, setOfferData] = useState({
    budget: 50000,
    deadline: '',
    description: '',
  })

  const { data: bloggers, isLoading } = useQuery({
    queryKey: ['blogger-catalog', selectedPlatform, minFollowers, maxPrice],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedPlatform) params.append('platform', selectedPlatform)
      params.append('minFollowers', minFollowers.toString())
      params.append('maxPrice', maxPrice.toString())

      const res = await api.get(`/bloggers?${params}`)
      return res.data
    },
  })

  const sendOfferMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(`/deals/offer/${selectedBlogger?.id}`, data)
      return res.data
    },
  })

  const handleSendOffer = async () => {
    try {
      await sendOfferMutation.mutateAsync(offerData)
      setShowOfferModal(false)
      setOfferData({
        budget: 50000,
        deadline: '',
        description: '',
      })
    } catch (error) {
      console.error('Error sending offer:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Каталог блогеров</h1>

        {/* Filters */}
        <div className="card border border-gray-200">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Платформа</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="input-field"
              >
                <option value="">Все платформы</option>
                <option>instagram</option>
                <option>tiktok</option>
                <option>youtube</option>
                <option>telegram</option>
                <option>twitch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Минимум подписчиков</label>
              <input
                type="number"
                value={minFollowers}
                onChange={(e) => setMinFollowers(Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Максимальная цена</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Bloggers Grid */}
        {isLoading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : bloggers && bloggers.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {bloggers.map((blogger: BloggerProfile) => (
              <BloggerCard
                key={blogger.id}
                blogger={blogger}
                onClick={(id) => {
                  setSelectedBlogger(blogger)
                }}
                actionButton={{
                  label: 'Предложить',
                  onClick: (id) => {
                    setSelectedBlogger(blogger)
                    setShowOfferModal(true)
                  },
                }}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12 text-gray-600">
            Нет блогеров по вашим критериям
          </div>
        )}
      </div>

      {/* Offer Modal */}
      {showOfferModal && selectedBlogger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold">Предложить сделку</h2>
            <p className="text-gray-600">{selectedBlogger.displayName}</p>

            <div>
              <label className="block text-sm font-medium mb-2">Бюджет (₽)</label>
              <input
                type="number"
                value={offerData.budget}
                onChange={(e) =>
                  setOfferData({ ...offerData, budget: Number(e.target.value) })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Дедлайн</label>
              <input
                type="date"
                value={offerData.deadline}
                onChange={(e) =>
                  setOfferData({ ...offerData, deadline: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Описание</label>
              <textarea
                value={offerData.description}
                onChange={(e) =>
                  setOfferData({ ...offerData, description: e.target.value })
                }
                className="input-field"
                rows={3}
                placeholder="Описание проекта для блогера"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowOfferModal(false)}
                className="btn-secondary flex-1"
              >
                Отмена
              </button>
              <button
                onClick={handleSendOffer}
                disabled={sendOfferMutation.isPending || !offerData.deadline}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {sendOfferMutation.isPending ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blogger Details Modal */}
      {selectedBlogger && !showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 space-y-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedBlogger.displayName}</h2>
                <p className="text-gray-600">{selectedBlogger.niche}</p>
              </div>
              <button
                onClick={() => setSelectedBlogger(null)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {selectedBlogger.bio && (
              <div>
                <h3 className="font-semibold mb-2">О себе</h3>
                <p className="text-gray-700">{selectedBlogger.bio}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Соцсети</h3>
              <div className="space-y-2">
                {selectedBlogger.socialAccounts.map((social) => (
                  <div key={social.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {social.platform} - @{social.username}
                    </p>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p>👥 {social.followersCount.toLocaleString()} подписчиков</p>
                      {social.avgViews && (
                        <p>📊 {social.avgViews.toLocaleString()} средних просмотров</p>
                      )}
                      {social.engagementRate && <p>🔥 {social.engagementRate}% engagement</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Прайс-лист</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2">Формат</th>
                      <th className="text-left py-2 px-2">Описание</th>
                      <th className="text-right py-2 px-2">Цена</th>
                      <th className="text-right py-2 px-2">Дней</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBlogger.priceList.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-2 px-2 font-medium">{item.formatName}</td>
                        <td className="py-2 px-2">{item.description}</td>
                        <td className="py-2 px-2 text-right font-bold">₽{item.priceRub}</td>
                        <td className="py-2 px-2 text-right">{item.durationDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={() => setShowOfferModal(true)}
              className="btn-primary w-full"
            >
              Предложить сделку
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
