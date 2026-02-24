'use client'

import { BloggerProfile } from '@/types'

interface BloggerCardProps {
  blogger: BloggerProfile
  onClick?: (bloggerId: string) => void
  actionButton?: {
    label: string
    onClick: (bloggerId: string) => void
  }
}

export default function BloggerCard({
  blogger,
  onClick,
  actionButton,
}: BloggerCardProps) {
  const minPrice = blogger.priceList.length > 0
    ? Math.min(...blogger.priceList.map((p) => p.priceRub))
    : 0

  const socialPlatforms = blogger.socialAccounts.map((acc) => acc.platform).join(', ')
  const totalFollowers = blogger.socialAccounts.reduce((sum, acc) => sum + acc.followersCount, 0)

  return (
    <div
      className="card border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(blogger.id)}
    >
      {/* Avatar placeholder */}
      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
        {blogger.displayName[0]}
      </div>

      <h3 className="text-lg font-semibold mb-1">{blogger.displayName}</h3>
      
      {blogger.niche && (
        <p className="text-sm text-gray-600 mb-2">📍 {blogger.niche}</p>
      )}

      <div className="flex gap-2 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-lg ${
              i < Math.round(blogger.rating) ? '⭐' : '☆'
            }`}
          >
            {i < Math.round(blogger.rating) ? '⭐' : '☆'}
          </span>
        ))}
        <span className="text-sm text-gray-600 ml-auto">
          {blogger.rating.toFixed(1)}
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-4 space-y-1">
        <p>📱 {socialPlatforms}</p>
        <p>👥 {totalFollowers.toLocaleString()} подписчиков</p>
        <p>📊 {blogger.totalDeals} завершено</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-bold text-primary">
          от ₽{minPrice}
        </span>
        {actionButton && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              actionButton.onClick(blogger.id)
            }}
            className="btn-primary text-sm py-1 px-3"
          >
            {actionButton.label}
          </button>
        )}
      </div>
    </div>
  )
}
