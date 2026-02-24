'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminDisputes() {
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [showResolutionModal, setShowResolutionModal] = useState(false)
  const [resolutionData, setResolutionData] = useState({
    resolveFor: 'issuer' as 'issuer' | 'blogger',
    text: '',
  })

  const { data: disputes, isLoading, refetch } = useQuery({
    queryKey: ['disputes'],
    queryFn: async () => {
      const res = await api.get('/admin/disputes')
      return res.data
    },
  })

  const resolveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(
        `/admin/disputes/${selectedDispute.id}/resolve`,
        data
      )
      return res.data
    },
    onSuccess: () => {
      refetch()
      setShowResolutionModal(false)
      setSelectedDispute(null)
      setResolutionData({
        resolveFor: 'issuer',
        text: '',
      })
    },
  })

  const handleResolve = async () => {
    try {
      await resolveMutation.mutateAsync(resolutionData)
    } catch (error) {
      console.error('Error resolving dispute:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Споры</h1>

        {isLoading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : disputes && disputes.length > 0 ? (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">Сделка</th>
                  <th className="text-left py-3 px-4 font-semibold">Открыл</th>
                  <th className="text-left py-3 px-4 font-semibold">Причина</th>
                  <th className="text-left py-3 px-4 font-semibold">Статус</th>
                  <th className="text-left py-3 px-4 font-semibold">Дата</th>
                  <th className="text-right py-3 px-4 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute: any) => (
                  <tr key={dispute.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {dispute.dealId?.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4 capitalize">{dispute.openedBy}</td>
                    <td className="py-3 px-4">{dispute.reason}</td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        status={dispute.status}
                        type="verification"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(dispute.createdAt), 'dd MMM yyyy', {
                        locale: ru,
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {dispute.status === 'open' && (
                        <button
                          onClick={() => {
                            setSelectedDispute(dispute)
                            setShowResolutionModal(true)
                          }}
                          className="btn-primary text-sm py-1 px-3"
                        >
                          Решить
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card text-center py-12 text-gray-600">
            Нет открытых споров
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold">Разрешить спор</h2>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Причина спора</p>
              <p className="font-medium">{selectedDispute.reason}</p>
            </div>

            {selectedDispute.description && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Описание</p>
                <p className="text-sm">{selectedDispute.description}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Решить в пользу
              </label>
              <select
                value={resolutionData.resolveFor}
                onChange={(e) =>
                  setResolutionData({
                    ...resolutionData,
                    resolveFor: e.target.value as 'issuer' | 'blogger',
                  })
                }
                className="input-field"
              >
                <option value="issuer">Эмитента</option>
                <option value="blogger">Блогера</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Текст решения
              </label>
              <textarea
                value={resolutionData.text}
                onChange={(e) =>
                  setResolutionData({
                    ...resolutionData,
                    text: e.target.value,
                  })
                }
                className="input-field"
                rows={3}
                placeholder="Объяснение решения"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowResolutionModal(false)}
                className="btn-secondary flex-1"
              >
                Отмена
              </button>
              <button
                onClick={handleResolve}
                disabled={resolveMutation.isPending || !resolutionData.text}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {resolveMutation.isPending ? 'Решение...' : 'Разрешить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
