'use client'

import { useState } from 'react'
import { PriceListItem, SocialPlatform, PLATFORM_LABELS, PLATFORM_ICONS } from '@/types'

interface PriceListEditorProps {
  items: PriceListItem[]
  onUpdate: (items: PriceListItem[]) => void
  isLoading?: boolean
}

const EMPTY_ITEM = {
  formatName: '',
  description: '',
  priceRub: 0,
  durationDays: 1,
  platform: '' as SocialPlatform | '',
  isSpecialProject: false,
}

export default function PriceListEditor({ items, onUpdate, isLoading }: PriceListEditorProps) {
  const [newItem, setNewItem] = useState({ ...EMPTY_ITEM })

  const handleAddItem = () => {
    if (!newItem.formatName) return

    const item: PriceListItem = {
      id: Date.now().toString(),
      formatName: newItem.formatName,
      description: newItem.description,
      priceRub: newItem.isSpecialProject ? 0 : newItem.priceRub,
      durationDays: newItem.durationDays,
      isAvailable: true,
      platform: (newItem.platform as SocialPlatform) || null,
      isSpecialProject: newItem.isSpecialProject,
    }

    onUpdate([...items, item])
    setNewItem({ ...EMPTY_ITEM })
  }

  const handleDeleteItem = (id: string) => {
    onUpdate(items.filter((item) => item.id !== id))
  }

  const handleToggleAvailability = (id: string) => {
    onUpdate(items.map((item) =>
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    ))
  }

  const formatPrice = (item: PriceListItem) => {
    if (item.isSpecialProject || item.priceRub === 0) {
      return <span className="text-indigo-600 font-semibold">по запросу</span>
    }
    return <span className="font-semibold text-primary">₽{item.priceRub.toLocaleString('ru')}</span>
  }

  const platformLabel = (platform?: SocialPlatform | null) => {
    if (!platform) return null
    return (
      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
        {PLATFORM_ICONS[platform]} {PLATFORM_LABELS[platform]}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add new item form */}
      <div className="card border border-gray-200">
        <h3 className="font-semibold mb-4">Добавить формат размещения</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={newItem.formatName}
            onChange={(e) => setNewItem({ ...newItem, formatName: e.target.value })}
            placeholder="Название формата *"
            className="input-field col-span-2"
          />
          <input
            type="text"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            placeholder="Описание"
            className="input-field col-span-2"
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Платформа</label>
            <select
              value={newItem.platform}
              onChange={(e) => setNewItem({ ...newItem, platform: e.target.value as SocialPlatform | '' })}
              className="input-field"
            >
              <option value="">Любая / Универсальная</option>
              {(Object.keys(PLATFORM_LABELS) as SocialPlatform[]).map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Дней</label>
            <input
              type="number"
              value={newItem.durationDays}
              onChange={(e) => setNewItem({ ...newItem, durationDays: Number(e.target.value) })}
              className="input-field"
              min="1"
            />
          </div>
          <div className={newItem.isSpecialProject ? 'opacity-50 pointer-events-none' : ''}>
            <label className="block text-xs text-gray-500 mb-1">Цена в ₽</label>
            <input
              type="number"
              value={newItem.isSpecialProject ? 0 : newItem.priceRub}
              onChange={(e) => setNewItem({ ...newItem, priceRub: Number(e.target.value) })}
              placeholder="0 = по запросу"
              className="input-field"
              disabled={newItem.isSpecialProject}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newItem.isSpecialProject}
                onChange={(e) => setNewItem({ ...newItem, isSpecialProject: e.target.checked, priceRub: 0 })}
                className="w-4 h-4 accent-indigo-600"
              />
              <span className="text-sm">
                💼 <strong>Спецпроект</strong>{' '}
                <span className="text-xs text-gray-500">(цена по запросу)</span>
              </span>
            </label>
          </div>
        </div>
        {newItem.isSpecialProject && (
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-700">
            💼 <strong>Спецпроект:</strong> Цена будет согласовываться с каждым эмитентом индивидуально. В прайсе отображается «по запросу».
          </div>
        )}
        <button
          onClick={handleAddItem}
          disabled={isLoading || !newItem.formatName}
          className="btn-primary disabled:opacity-50"
        >
          Добавить формат
        </button>
      </div>

      {/* Existing items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`card border p-4 ${item.isAvailable ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-semibold">{item.formatName}</h4>
                  {item.isSpecialProject && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      💼 Спецпроект
                    </span>
                  )}
                  {platformLabel(item.platform)}
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                <div className="flex gap-4 text-sm items-center flex-wrap">
                  {formatPrice(item)}
                  <span className="text-gray-600">{item.durationDays} дн.</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isAvailable}
                      onChange={() => handleToggleAvailability(item.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-600">Активно</span>
                  </label>
                </div>
              </div>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="btn-danger text-sm py-1 px-3 flex-shrink-0"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Прайс-лист пуст. Добавьте форматы размещения выше.
          </div>
        )}
      </div>
    </div>
  )
}
