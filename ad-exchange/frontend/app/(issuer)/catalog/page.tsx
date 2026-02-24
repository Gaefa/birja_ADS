'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import BloggerCard from '@/components/issuer/BloggerCard'
import { BloggerProfile, PriceListItem, SocialPlatform, PLATFORM_LABELS, PLATFORM_ICONS } from '@/types'

const DEFAULT_COMMISSION = 0.10 // fallback; real value comes from /admin/commissions

export default function IssuerCatalog() {
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [minFollowers, setMinFollowers] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000000)
  const [selectedBlogger, setSelectedBlogger] = useState<BloggerProfile | null>(null)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerData, setOfferData] = useState({
    budget: 0,
    deadline: '',
    tz: '',
    socialPlatform: '' as SocialPlatform | '',
    formatName: '',
    currency: 'RUB',
  })

  // ─── Bloggers ──────────────────────────────────────────────────────────────

  const { data: bloggers, isLoading } = useQuery({
    queryKey: ['blogger-catalog', selectedPlatform, minFollowers, maxPrice],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedPlatform) params.append('platform', selectedPlatform)
      params.append('minFollowers', minFollowers.toString())
      params.append('maxPrice', maxPrice.toString())
      const res = await api.get(`/bloggers?${params}`)
      return res.data as BloggerProfile[]
    },
  })

  // ─── Send offer ────────────────────────────────────────────────────────────

  const sendOfferMutation = useMutation({
    mutationFn: async (data: typeof offerData) => {
      const res = await api.post(`/deals`, {
        bloggerId: Number(selectedBlogger?.id),
        title: `Оффер: ${offerData.formatName || 'размещение'}`,
        tz: data.tz,
        socialPlatform: data.socialPlatform || undefined,
        formatName: data.formatName || undefined,
        amount: data.budget,
        currency: data.currency,
      })
      return res.data
    },
  })

  const handleSendOffer = async () => {
    if (!offerData.deadline || !offerData.budget) return
    try {
      await sendOfferMutation.mutateAsync(offerData)
      setShowOfferModal(false)
      resetOfferForm()
    } catch (error) {
      console.error('Error sending offer:', error)
    }
  }

  const resetOfferForm = () => {
    setOfferData({
      budget: 0, deadline: '', tz: '',
      socialPlatform: '', formatName: '', currency: 'RUB',
    })
  }

  // ─── Format filtering by selected platform ────────────────────────────────

  const getFilteredFormats = (): PriceListItem[] => {
    if (!selectedBlogger) return []
    const plat = offerData.socialPlatform
    return selectedBlogger.priceList.filter(
      (p) => p.isAvailable && (!plat || !p.platform || p.platform === plat || p.isSpecialProject)
    )
  }

  const handlePlatformChange = (plat: SocialPlatform | '') => {
    setOfferData({ ...offerData, socialPlatform: plat, formatName: '', budget: 0 })
  }

  const handleFormatSelect = (formatName: string) => {
    const fmt = selectedBlogger?.priceList.find((p) => p.formatName === formatName)
    setOfferData({
      ...offerData,
      formatName,
      budget: fmt && !fmt.isSpecialProject ? fmt.priceRub : offerData.budget,
    })
  }

  // ─── Commission calculation ───────────────────────────────────────────────

  const selectedFormat = selectedBlogger?.priceList.find(
    (p) => p.formatName === offerData.formatName
  )
  const isSpecialProject = selectedFormat?.isSpecialProject ?? false
  const commRate = DEFAULT_COMMISSION
  const commission = Math.round(offerData.budget * commRate)
  const total = offerData.budget + commission

  // ─── Available social platforms for blogger ───────────────────────────────

  const bloggerPlatforms = selectedBlogger?.socialAccounts.map((s) => s.platform) ?? []

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
                {(Object.keys(PLATFORM_LABELS) as SocialPlatform[]).map((p) => (
                  <option key={p} value={p}>{PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Мин. подписчиков</label>
              <input
                type="number"
                value={minFollowers}
                onChange={(e) => setMinFollowers(Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Макс. цена (₽)</label>
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
                onClick={() => setSelectedBlogger(blogger)}
                actionButton={{
                  label: 'Предложить',
                  onClick: () => {
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

      {/* ── Offer Modal ─────────────────────────────────────────────────────── */}
      {showOfferModal && selectedBlogger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">🤝 Предложить сделку</h2>
                <p className="text-sm text-gray-500 mt-0.5">→ {selectedBlogger.displayName}</p>
              </div>
              <button onClick={() => { setShowOfferModal(false); resetOfferForm() }}
                className="text-2xl text-gray-400 hover:text-gray-600">×</button>
            </div>

            {/* Step 1: Social platform */}
            <div>
              <label className="block text-sm font-medium mb-2">
                1️⃣ Канал / соцсеть блогера
              </label>
              <select
                value={offerData.socialPlatform}
                onChange={(e) => handlePlatformChange(e.target.value as SocialPlatform | '')}
                className="input-field"
              >
                <option value="">— выберите платформу —</option>
                {bloggerPlatforms.map((p) => {
                  const acc = selectedBlogger.socialAccounts.find((s) => s.platform === p)
                  return (
                    <option key={p} value={p}>
                      {PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}
                      {acc ? ` (${(acc.followersCount / 1000).toFixed(0)}K подп.)` : ''}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Step 2: Format (filtered by platform) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                2️⃣ Формат размещения
              </label>
              <select
                value={offerData.formatName}
                onChange={(e) => handleFormatSelect(e.target.value)}
                className="input-field"
                disabled={!offerData.socialPlatform && bloggerPlatforms.length > 0}
              >
                <option value="">
                  {offerData.socialPlatform
                    ? '— выберите формат —'
                    : '— сначала выберите платформу —'}
                </option>
                {getFilteredFormats().map((fmt) => (
                  <option key={fmt.id} value={fmt.formatName}>
                    {fmt.isSpecialProject ? '💼 ' : ''}
                    {fmt.formatName}
                    {fmt.isSpecialProject || fmt.priceRub === 0
                      ? ' — по запросу'
                      : ` — ₽${fmt.priceRub.toLocaleString('ru')}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">
                3️⃣ Сумма блогеру (₽) *
              </label>
              <input
                type="number"
                value={offerData.budget || ''}
                onChange={(e) => setOfferData({ ...offerData, budget: Number(e.target.value) })}
                placeholder="Введите сумму"
                className="input-field"
              />
              {isSpecialProject && (
                <div className="mt-2 p-2 bg-indigo-50 rounded text-sm text-indigo-700">
                  💼 <strong>Спецпроект:</strong> Введите согласованную с блогером сумму.
                </div>
              )}
            </div>

            {/* Commission preview */}
            {offerData.budget > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Гонорар автора:</span>
                  <span className="font-semibold text-green-600">₽{offerData.budget.toLocaleString('ru')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Комиссия платформы ({Math.round(commRate * 100)}%):</span>
                  <span className="text-gray-600">+₽{commission.toLocaleString('ru')}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-200 pt-1 mt-1">
                  <span>Итого к оплате:</span>
                  <span className="text-indigo-600">₽{total.toLocaleString('ru')}</span>
                </div>
              </div>
            )}

            {/* Deadline + TZ */}
            <div>
              <label className="block text-sm font-medium mb-2">Дедлайн *</label>
              <input
                type="date"
                value={offerData.deadline}
                onChange={(e) => setOfferData({ ...offerData, deadline: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">📋 Техническое задание (ТЗ)</label>
              <textarea
                value={offerData.tz}
                onChange={(e) => setOfferData({ ...offerData, tz: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Опишите подробно: что нужно сделать, что упомянуть, ссылки, требования..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => { setShowOfferModal(false); resetOfferForm() }} className="btn-secondary flex-1">
                Отмена
              </button>
              <button
                onClick={handleSendOffer}
                disabled={sendOfferMutation.isPending || !offerData.deadline || !offerData.budget}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {sendOfferMutation.isPending ? 'Отправка...' : 'Отправить предложение'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Blogger Details Modal ──────────────────────────────────────────── */}
      {selectedBlogger && !showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedBlogger.displayName}</h2>
                <p className="text-gray-600">{selectedBlogger.niche}</p>
              </div>
              <button onClick={() => setSelectedBlogger(null)} className="text-2xl text-gray-400 hover:text-gray-600">
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
                      {PLATFORM_ICONS[social.platform]} {PLATFORM_LABELS[social.platform]} — @{social.username}
                    </p>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p>👥 {social.followersCount.toLocaleString('ru')} подписчиков</p>
                      {social.avgViews && <p>📊 {social.avgViews.toLocaleString('ru')} ср. просмотров</p>}
                      {social.engagementRate && <p>🔥 {social.engagementRate}% ER</p>}
                      {social.isVerified && <p className="text-green-600">✓ Верифицирован</p>}
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
                      <th className="text-left py-2 px-2">Платформа</th>
                      <th className="text-right py-2 px-2">Цена</th>
                      <th className="text-right py-2 px-2">Дней</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBlogger.priceList.filter((p) => p.isAvailable).map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-2 px-2 font-medium">
                          {item.isSpecialProject && '💼 '}{item.formatName}
                        </td>
                        <td className="py-2 px-2 text-gray-500">
                          {item.platform
                            ? `${PLATFORM_ICONS[item.platform as SocialPlatform]} ${PLATFORM_LABELS[item.platform as SocialPlatform]}`
                            : '—'}
                        </td>
                        <td className="py-2 px-2 text-right font-bold">
                          {item.isSpecialProject || item.priceRub === 0
                            ? <span className="text-indigo-600">по запросу</span>
                            : `₽${item.priceRub.toLocaleString('ru')}`}
                        </td>
                        <td className="py-2 px-2 text-right">{item.durationDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button onClick={() => setShowOfferModal(true)} className="btn-primary w-full">
              Предложить сделку
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
