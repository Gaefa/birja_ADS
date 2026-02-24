'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import CampaignCard from '@/components/shared/CampaignCard'
import { Campaign } from '@/types'

export default function BloggerCampaigns() {
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [minBudget, setMinBudget] = useState(0)
  const [maxBudget, setMaxBudget] = useState(1000000)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [pitchText, setPitchText] = useState('')
  const [proposedPrice, setProposedPrice] = useState(0)

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['available-campaigns', selectedPlatform, minBudget, maxBudget],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedPlatform) params.append('platform', selectedPlatform)
      params.append('minBudget', minBudget.toString())
      params.append('maxBudget', maxBudget.toString())

      const res = await api.get(`/campaigns/available?${params}`)
      return res.data
    },
  })

  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(
        `/campaigns/${selectedCampaign?.id}/apply`,
        data
      )
      return res.data
    },
  })

  const handleApply = async () => {
    try {
      await applyMutation.mutateAsync({
        pitchText,
        proposedPrice,
      })
      setShowApplicationModal(false)
      setPitchText('')
      setProposedPrice(0)
    } catch (error) {
      console.error('Error applying to campaign:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Доступные кампании</h1>

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
              <label className="block text-sm font-medium mb-2">От бюджета</label>
              <input
                type="number"
                value={minBudget}
                onChange={(e) => setMinBudget(Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">До бюджета</label>
              <input
                type="number"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        {isLoading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {campaigns.map((campaign: Campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                actionButton={{
                  label: 'Откликнуться',
                  onClick: (id) => {
                    setSelectedCampaign(campaign)
                    setShowApplicationModal(true)
                    setProposedPrice(campaign.budgetPerBlogger)
                  },
                }}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12 text-gray-600">
            Нет доступных кампаний по вашим критериям
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold">Откликнуться на кампанию</h2>
            <p className="text-gray-600">{selectedCampaign.title}</p>

            <div>
              <label className="block text-sm font-medium mb-2">Текст предложения</label>
              <textarea
                value={pitchText}
                onChange={(e) => setPitchText(e.target.value)}
                className="input-field"
                rows={4}
                placeholder="Расскажите, почему вы подходите для этой кампании..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Предложенная цена (₽)</label>
              <input
                type="number"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(Number(e.target.value))}
                className="input-field"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowApplicationModal(false)}
                className="btn-secondary flex-1"
              >
                Отмена
              </button>
              <button
                onClick={handleApply}
                disabled={applyMutation.isPending || !pitchText}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {applyMutation.isPending ? 'Отправка...' : 'Откликнуться'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
