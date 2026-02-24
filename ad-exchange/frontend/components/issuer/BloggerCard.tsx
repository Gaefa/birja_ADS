'use client'

import { BloggerProfile, SocialPlatform, PLATFORM_LABELS, PLATFORM_ICONS } from '@/types'

interface BloggerCardProps {
  blogger: BloggerProfile
  onClick?: (bloggerId: string) => void
  actionButton?: {
    label: string
    onClick: (bloggerId: string) => void
  }
}

export default function BloggerCard({ blogger, onClick, actionButton }: BloggerCardProps) {
  // Min price: exclude Спецпроект items (priceRub === 0) from the calculation
  const paidItems = blogger.priceList.filter((p) => p.isAvailable && p.priceRub > 0 && !p.isSpecialProject)
  const minPrice = paidItems.length > 0 ? Math.min(...paidItems.map((p) => p.priceRub)) : null
  const hasSpecialProject = blogger.priceList.some((p) => p.isSpecialProject)

  const totalFollowers = blogger.socialAccounts.reduce((sum, acc) => sum + acc.followersCount, 0)

  const uniquePlatforms = [...new Set(blogger.socialAccounts.map((acc) => acc.platform))]

  return (
    <div
      className="card border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(blogger.id)}
    >
      {/* Avatar */}
      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3">
        {blogger.displayName[0]}
      </div>

      {/* Name + niche */}
      <h3 className="text-base font-semibold mb-0.5">{blogger.displayName}</h3>
      {blogger.niche && <p className="text-xs text-gray-500 mb-2">📍 {blogger.niche}</p>}

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-sm">
            {i < Math.round(blogger.rating) ? '⭐' : '☆'}
          </span>
        ))}
        <span className="text-xs text-gray-500 ml-1">{blogger.rating.toFixed(1)}</span>
      </div>

      {/* Platforms + stats */}
      <div className="text-xs text-gray-600 mb-3 space-y-1">
        <p>
          {uniquePlatforms.map((p) => (
            <span key={p} className="mr-1">{PLATFORM_ICONS[p as SocialPlatform]}</span>
          ))}
          {uniquePlatforms.map((p) => PLATFORM_LABELS[p as SocialPlatform]).join(', ')}
        </p>
        <p>👥 {totalFollowers.toLocaleString('ru')} подписчиков</p>
        <p>✅ {blogger.totalDeals} завершено</p>
      </div>

      {/* Price + action */}
      <div className="flex items-center justify-between mt-auto">
        <div>
          {minPrice !== null ? (
            <span className="font-bold text-indigo-600 text-sm">от ₽{minPrice.toLocaleString('ru')}</span>
          ) : hasSpecialProject ? (
            <span className="font-semibold text-indigo-500 text-sm">💼 по запросу</span>
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          )}
        </div>
        {actionButton && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              actionButton.onClick(blogger.id)
            }}
            className="btn-primary text-xs py-1 px-3"
          >
            {actionButton.label}
          </button>
        )}
      </div>
    </div>
  )
}
