'use client'

import { useState } from 'react'
import { PriceListItem } from '@/types'

interface PriceListEditorProps {
  items: PriceListItem[]
  onUpdate: (items: PriceListItem[]) => void
  isLoading?: boolean
}

export default function PriceListEditor({
  items,
  onUpdate,
  isLoading,
}: PriceListEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({
    formatName: '',
    description: '',
    priceRub: 0,
    durationDays: 1,
  })

  const handleAddItem = () => {
    if (!newItem.formatName || !newItem.description) return

    const item: PriceListItem = {
      id: Date.now().toString(),
      ...newItem,
      isAvailable: true,
    }

    onUpdate([...items, item])
    setNewItem({
      formatName: '',
      description: '',
      priceRub: 0,
      durationDays: 1,
    })
  }

  const handleDeleteItem = (id: string) => {
    onUpdate(items.filter((item) => item.id !== id))
  }

  const handleToggleAvailability = (id: string) => {
    onUpdate(
      items.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    )
  }

  return (
    <div className="space-y-4">
      <div className="card border border-gray-200">
        <h3 className="font-semibold mb-4">Добавить новый формат</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={newItem.formatName}
            onChange={(e) => setNewItem({ ...newItem, formatName: e.target.value })}
            placeholder="Название формата"
            className="input-field"
          />
          <input
            type="text"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            placeholder="Описание"
            className="input-field"
          />
          <input
            type="number"
            value={newItem.priceRub}
            onChange={(e) => setNewItem({ ...newItem, priceRub: Number(e.target.value) })}
            placeholder="Цена в ₽"
            className="input-field"
          />
          <input
            type="number"
            value={newItem.durationDays}
            onChange={(e) => setNewItem({ ...newItem, durationDays: Number(e.target.value) })}
            placeholder="Дней"
            className="input-field"
            min="1"
          />
        </div>
        <button
          onClick={handleAddItem}
          disabled={isLoading}
          className="btn-primary"
        >
          Добавить
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="card border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{item.formatName}</h4>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="font-semibold text-primary">₽{item.priceRub}</span>
                  <span className="text-gray-600">{item.durationDays} дней</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isAvailable}
                      onChange={() => handleToggleAvailability(item.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-600">Доступно</span>
                  </label>
                </div>
              </div>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="btn-danger text-sm py-1 px-3"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
