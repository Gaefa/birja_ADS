'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminVerify() {
  const { data: pendingIssuers, isLoading, refetch } = useQuery({
    queryKey: ['pending-issuers'],
    queryFn: async () => {
      const res = await api.get('/admin/pending-issuers')
      return res.data
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['verification-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/verification-stats')
      return res.data
    },
  })

  const approveMutation = useMutation({
    mutationFn: async (issuerId: string) => {
      const res = await api.post(`/admin/verify-issuer/${issuerId}`)
      return res.data
    },
    onSuccess: () => {
      refetch()
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (issuerId: string) => {
      const res = await api.post(`/admin/reject-issuer/${issuerId}`)
      return res.data
    },
    onSuccess: () => {
      refetch()
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Верификация эмитентов</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <div className="text-gray-600 text-sm mb-2">На верификации</div>
            <div className="text-3xl font-bold text-primary">
              {stats?.pendingCount || 0}
            </div>
          </div>
          <div className="card">
            <div className="text-gray-600 text-sm mb-2">Верифицировано сегодня</div>
            <div className="text-3xl font-bold text-primary">
              {stats?.verifiedToday || 0}
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : pendingIssuers && pendingIssuers.length > 0 ? (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">Название</th>
                  <th className="text-left py-3 px-4 font-semibold">Тип</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Зарегистрирован</th>
                  <th className="text-right py-3 px-4 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {pendingIssuers.map((issuer: any) => (
                  <tr key={issuer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{issuer.companyName}</td>
                    <td className="py-3 px-4">{issuer.companyType}</td>
                    <td className="py-3 px-4">{issuer.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(issuer.createdAt), 'dd MMM yyyy', {
                        locale: ru,
                      })}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => approveMutation.mutate(issuer.id)}
                        disabled={approveMutation.isPending}
                        className="btn-primary text-sm py-1 px-3"
                      >
                        Верифицировать
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(issuer.id)}
                        disabled={rejectMutation.isPending}
                        className="btn-danger text-sm py-1 px-3"
                      >
                        Отклонить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card text-center py-12 text-gray-600">
            Нет эмитентов на проверке
          </div>
        )}
      </div>
    </div>
  )
}
