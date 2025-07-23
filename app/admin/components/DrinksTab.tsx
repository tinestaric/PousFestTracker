import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import type { DrinkMenuItem, DrinkOrder } from '@/lib/supabase'
import type { EditingItem, FormValidation, LoadingState } from './types'
import { getEventConfig } from '@/lib/eventConfig'

interface DrinksTabProps {
  drinks: DrinkMenuItem[]
  drinkOrders: DrinkOrder[]
  editing: EditingItem
  showAddForm: boolean
  validation: FormValidation
  loading: LoadingState
  onStartAdd: (type: 'drink') => void
  onStartEdit: (item: DrinkMenuItem, type: 'drink') => void
  onDelete: (id: string, type: 'drink') => void
  onCancelEdit: () => void
  onSave: () => void
  onUpdateEditingData: (updates: any) => void
}

export default function DrinksTab({ 
  drinks, 
  drinkOrders, 
  editing, 
  showAddForm, 
  validation,
  loading,
  onStartAdd, 
  onStartEdit, 
  onDelete, 
  onCancelEdit, 
  onSave, 
  onUpdateEditingData 
}: DrinksTabProps) {
  const config = getEventConfig()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg">Drink Menu Management</h3>
        <button 
          onClick={() => onStartAdd('drink')} 
          className={`bg-gradient-to-r ${config.ui.primaryButton} text-white px-4 py-2 rounded-xl font-semibold hover:bg-gradient-to-r hover:${config.ui.primaryButtonHover} transition-all duration-300 flex items-center gap-2 shadow-lg`}
        >
          <Plus className="w-4 h-4" />
          Add Drink
        </button>
      </div>

      {(showAddForm && editing.type === 'drink') && (
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
          <h4 className="text-xl font-bold text-white mb-4 drop-shadow-lg">
            {editing.id ? 'Edit Drink' : 'Add New Drink'}
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Drink Name"
              value={editing.data?.name || ''}
              onChange={(e) => onUpdateEditingData({ name: e.target.value })}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            />
            <input
              type="text"
              placeholder="Description"
              value={editing.data?.description || ''}
              onChange={(e) => onUpdateEditingData({ description: e.target.value })}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            />
            <select
              value={editing.data?.category || 'cocktail'}
              onChange={(e) => onUpdateEditingData({ category: e.target.value })}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            >
              <option value="cocktail" className="text-gray-800">Cocktail</option>
              <option value="beer" className="text-gray-800">Beer</option>
              <option value="shot" className="text-gray-800">Shot</option>
              <option value="non-alcoholic" className="text-gray-800">Non-Alcoholic</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              checked={editing.data?.available || false}
              onChange={(e) => onUpdateEditingData({ available: e.target.checked })}
              className="rounded"
            />
            <label className="text-white">Available</label>
          </div>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={onSave} 
              className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-500 transition-all duration-300 flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button 
              onClick={onCancelEdit} 
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drinks.map((drink) => (
          <div key={drink.id} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white text-lg">{drink.name}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => onStartEdit(drink, 'drink')}
                  className="p-2 bg-blue-500/40 text-blue-100 rounded-lg hover:bg-blue-500/60 hover:text-white transition-all duration-300 shadow-md"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(drink.id, 'drink')}
                  className="p-2 bg-red-500/40 text-red-100 rounded-lg hover:bg-red-500/60 hover:text-white transition-all duration-300 shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {drink.description && (
              <p className="text-sm text-white/80 mb-2">{drink.description}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs bg-gradient-to-r from-purple-400 to-pink-400 text-purple-900 px-3 py-1 rounded-full font-semibold capitalize">
                {drink.category}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                drink.available
                  ? 'bg-green-400/20 text-green-300 border border-green-400/30'
                  : 'bg-red-400/20 text-red-300 border border-red-400/30'
              }`}>
                {drink.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="mt-3 text-sm text-white bg-white/10 px-3 py-1 rounded-lg inline-block">
              Orders: {drinkOrders.filter(order => order.drink_menu_id === drink.id).reduce((sum, order) => sum + order.quantity, 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 