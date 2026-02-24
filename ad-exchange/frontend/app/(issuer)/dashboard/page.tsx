'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'
import CampaignCard from '@/components/shared/CampaignCard'
import DealCard from '@/components/shared/DealCard'

export default function IssuerDashboard() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const { data: stats } = useQuery({
    queryKey: ['issuer-stats'],
    queryFn: async () => {
      const res = await api.get('/issuer/stats')
      return res.data
    },
  })

  const { data: campaigns } = useQuery({
    queryKey: ['issuer-campaigns'],
    queryFn: async () => {
      const res = await api.get('/issuer/campaigns')
      return res.data
    },
  })

  const { data: recentDeals } = useQuery({
    queryKey: ['issuer-recent-deals'],
    queryFn: async () => {
      const res = await api.get('/issuer/deals?limit=5')
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
          <h1 className="text-4xl font-bold mb-2">Дашборд эмитента</h1>
          <p className="text-gray-600">Добро пожаловать, {user.companyName}</p>
        </div>

        {/* Verification Warning */}
        {!user.isVerified && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⏳ Ваш аккаунт на верификации</h3>
            <p className="text-yellow-700">
              Ожидайте проверки в течение 24-48 часов. После верификации вы сможете создавать кампании.
            </p>
          </div>
        )}

        {/* Stats */}
        {user.isVerified && (
          <>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="card">
                <div className="text-gray-600 text-sm mb-2">Активных кампаний</div>
                <div className="text-3xl font-bold text-primary">
                  {stats?.activeCampaigns || 0}
                </div>
              </div>
              <div className="card">
                <div className="text-gray-600 text-sm mb-2">Блогеров в работе</div>
                <div className="text-3xl font-bold text-primary">
                  {stats?.activeBloggers || 0}
                </div>
              </div>
              <div className="card">
                <div className="text-gray-600 text-sm mb-2">В эскроу</div>
                <div className="text-3xl font-bold text-primary">
                  ₽{stats?.escrowBalance?.toLocaleString() || 0}
                </div>
              </div>
              <div className="card">
                <div className="text-gray-600 text-sm mb-2">Потрачено всего</div>
                <div className="text-3xl font-bold text-primary">
                  ₽{stats?.totalSpent?.toLocaleString() || 0}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Link href="/issuer/campaigns" className="btn-primary inline-block">
              + Создать кампанию
            </Link>

            {/* Active Campaigns */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Активные кампании</h2>
              {campaigns && campaigns.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {campaigns.slice(0, 3).map((campaign: any) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onClick={(id) => {
                        // TODO: Open campaign details
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="card text-center py-8 text-gray-600">
                  Нет активных кампаний
                </div>
              )}
            </div>

            {/* Recent Deals */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Недавние сделки</h2>
              {recentDeals && recentDeals.length > 0 ? (
                <div className="grid gap-4">
                  {recentDeals.map((deal: any) => (
                    <DealCard key={deal.id} deal={deal} userRole="issuer" />
                  ))}
                </div>
              ) : (
                <div className="card text-center py-8 text-gray-600">
                  Нет сделок
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
