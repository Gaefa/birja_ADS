'use client'

import { Campaign } from '@/types'
import StatusBadge from './StatusBadge'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface CampaignCardProps {
  campaign: Campaign
  onClick?: (campaignId: string) => void
  actionButton?: {
    label: string
    onClick: (campaignId: string) => void
  }
}

export default function CampaignCard({
  campaign,
  onClick,
  actionButton,
}: CampaignCardProps) {
  return (
    <div
      className="card border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(campaign.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{campaign.title}</h3>
          <p className="text-sm text-gray-600">
            {campaign.isPrivate ? '🔒 Приватная' : ''} от {campaign.issuerName}
          </p>
        </div>
        <StatusBadge status={campaign.status} type="campaign" />
      </div>

      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
        {campaign.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Бюджет на блогера</p>
          <p className="font-semibold">
            {campaign.budgetPerBlogger} {campaign.currency}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Нужно блогеров</p>
          <p className="font-semibold">{campaign.bloggersNeeded}</p>
        </div>
        <div>
          <p className="text-gray-600">Платформы</p>
          <p className="font-semibold text-xs">
            {campaign.platforms.join(', ')}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Дедлайн</p>
          <p className="font-semibold">
            {format(new Date(campaign.deadline), 'dd MMM', { locale: ru })}
          </p>
        </div>
      </div>

      {actionButton && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            actionButton.onClick(campaign.id)
          }}
          className="btn-primary w-full"
        >
          {actionButton.label}
        </button>
      )}
    </div>
  )
}
