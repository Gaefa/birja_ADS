'use client'

import { Deal } from '@/types'
import StatusBadge from './StatusBadge'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface DealCardProps {
  deal: Deal
  onAccept?: (dealId: string) => void
  onDecline?: (dealId: string) => void
  userRole?: 'blogger' | 'issuer'
}

export default function DealCard({
  deal,
  onAccept,
  onDecline,
  userRole,
}: DealCardProps) {
  return (
    <div className="card border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{deal.campaignTitle}</h3>
          <p className="text-sm text-gray-600">
            {userRole === 'blogger' ? deal.issuerName : deal.bloggerName}
          </p>
        </div>
        <StatusBadge status={deal.status} type="deal" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Бюджет</p>
          <p className="font-semibold">
            {deal.budget} {deal.currency}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Предложенная цена</p>
          <p className="font-semibold">
            {deal.proposedPrice ? `${deal.proposedPrice} ${deal.currency}` : '–'}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Статус</p>
          <p className="font-semibold">{deal.status}</p>
        </div>
        <div>
          <p className="text-gray-600">Дедлайн</p>
          <p className="font-semibold">
            {format(new Date(deal.deadline), 'dd MMM yyyy', { locale: ru })}
          </p>
        </div>
      </div>

      {deal.pitchText && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Текст предложения</p>
          <p className="text-sm">{deal.pitchText}</p>
        </div>
      )}

      {deal.status === 'pending' && (
        <div className="flex gap-2">
          {onAccept && (
            <button
              onClick={() => onAccept(deal.id)}
              className="btn-primary flex-1"
            >
              Принять
            </button>
          )}
          {onDecline && (
            <button
              onClick={() => onDecline(deal.id)}
              className="btn-danger flex-1"
            >
              Отклонить
            </button>
          )}
        </div>
      )}
    </div>
  )
}
