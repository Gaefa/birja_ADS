interface StatusBadgeProps {
  status: string
  type?: 'deal' | 'campaign' | 'verification'
}

const statusMap: Record<string, { label: string; color: string }> = {
  // Deal statuses
  pending: { label: 'В ожидании', color: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: 'Принято', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Отклонено', color: 'bg-red-100 text-red-800' },
  completed: { label: 'Завершено', color: 'bg-green-100 text-green-800' },
  disputed: { label: 'В споре', color: 'bg-red-100 text-red-800' },

  // Campaign statuses
  draft: { label: 'Черновик', color: 'bg-gray-100 text-gray-800' },
  active: { label: 'Активна', color: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'Отменена', color: 'bg-red-100 text-red-800' },

  // Verification statuses
  pending_verification: { label: 'На проверке', color: 'bg-yellow-100 text-yellow-800' },
  verified: { label: 'Верифицирован', color: 'bg-green-100 text-green-800' },
  rejected_verification: { label: 'Отклонено', color: 'bg-red-100 text-red-800' },
}

export default function StatusBadge({ status, type = 'deal' }: StatusBadgeProps) {
  const config = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }

  return (
    <span className={`badge ${config.color}`}>
      {config.label}
    </span>
  )
}
