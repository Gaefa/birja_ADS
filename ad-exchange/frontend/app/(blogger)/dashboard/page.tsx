'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'
import DealCard from '@/components/shared/DealCard'
import CampaignCard from '@/components/shared/CampaignCard'

export default function BloggerDashboard() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const { data: stats } = useQuery({
    queryKey: ['blogger-stats'],
    queryFn: async () => {
      const res = await api.get('/blogger/stats')
      return res.data
    },
  })

  const { data: pendingDeals } = useQuery({
    queryKey: ['pending-deals'],
    queryFn: async () => {
      const res = await api.get('/deals/pending')
      return res.data
    },
  })

  const { data: activeDeal } = useQuery({
    queryKey: ['active-deals'],
    queryFn: async () => {
      const res = await api.get('/deals/active')
      return res.data
    },
  })

  const { data: campaigns } = useQuery({
    queryKey: ['available-campaigns'],
    queryFn: async () => {
      const res = await api.get('/campaigns/available?limit=3')
      return res.data
    },
  })

  const acceptDealMutation = useMutation({
    mutationFn: async (dealId: string) => {
      const res = await api.post(`/deals/${dealId}/accept`)
      return res.data
    },
  })

  const declineDealMutation = useMutation({
    mutationFn: async (dealId: string) => {
      const res = await api.post(`/deals/${dealId}/decline`)
      return res.data
    },
  })

  if (!user) {
    return <div className="p-8">Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Привет, {user.displayName}! 👋</h1>
          <p className="text-gray-600">Добро пожаловать на вашу дашборд</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-gray-600 text-sm mb-2">Активных сделок</div>
            <div className="text-3xl font-bold text-primary">
              {stats?.activeDealCount || 0}
            </div>
          </div>
          <div className="card">
            <div className="text-gray-600 text-sm mb-2">Заработано в месяц</div>
            <div className="text-3xl font-bold text-primary">
              ₽{stats?.monthlyEarnings?.toLocaleString() || 0}
            </div>
          </div>
          <div className="card">
            <div className="text-gray-600 text-sm mb-2">Рейтинг</div>
            <div className="text-3xl font-bold text-primary">
              {stats?.rating?.toFixed(1) || '0.0'}⭐
            </div>
          </div>
          <div className="card">
            <div className="text-gray-600 text-sm mb-2">Всего сделок</div>
            <div className="text-3xl font-bold text-primary">
              {stats?.totalDeals || 0}
            </div>
          </div>
        </div>

        {/* Incoming Offers */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Входящие предложения</h2>
          {pendingDeals && pendingDeals.length > 0 ? (
            <div className="grid gap-4">
              {pendingDeals.map((deal: any) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  userRole="blogger"
                  onAccept={() => acceptDealMutation.mutate(deal.id)}
                  onDecline={() => declineDealMutation.mutate(deal.id)}
                />
              ))}
            </div>
          ) : (
            <div className="card text-center py-8 text-gray-600">
              Нет входящих предложений
            </div>
          )}
        </div>

        {/* Active Deals */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Активные сделки</h2>
          {activeDeal && activeDeal.length > 0 ? (
            <div className="grid gap-4">
              {activeDeal.map((deal: any) => (
                <DealCard key={deal.id} deal={deal} userRole="blogger" />
              ))}
            </div>
          ) : (
            <div className="card text-center py-8 text-gray-600">
              Нет активных сделок
            </div>
          )}
        </div>

        {/* Available Campaigns */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Доступные кампании</h2>
          {campaigns && campaigns.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {campaigns.map((campaign: any) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  actionButton={{
                    label: 'Откликнуться',
                    onClick: (id) => {
                      // TODO: Open application modal
                    },
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="card text-center py-8 text-gray-600">
              Нет доступных кампаний
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
