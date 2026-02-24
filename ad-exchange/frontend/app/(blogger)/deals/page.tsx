'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import DealCard from '@/components/shared/DealCard'

export default function BloggerDeals() {
  const { data: deals, isLoading } = useQuery({
    queryKey: ['blogger-all-deals'],
    queryFn: async () => {
      const res = await api.get('/deals')
      return res.data
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Мои сделки</h1>

        {isLoading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : deals && deals.length > 0 ? (
          <div className="grid gap-4">
            {deals.map((deal: any) => (
              <DealCard key={deal.id} deal={deal} userRole="blogger" />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12 text-gray-600">
            У вас еще нет сделок
          </div>
        )}
      </div>
    </div>
  )
}
