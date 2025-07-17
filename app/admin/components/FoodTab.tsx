import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import type { FoodMenuItem, FoodOrder } from '@/lib/supabase'
import type { EditingItem, FormValidation, LoadingState } from './types'

interface FoodTabProps {
  foodMenu: FoodMenuItem[]
  foodOrders: FoodOrder[]
  editing: EditingItem
  showAddForm: boolean
  validation: FormValidation
  loading: LoadingState
  onStartAdd: (type: 'food') => void
  onStartEdit: (item: FoodMenuItem, type: 'food') => void
  onDelete: (id: string, type: 'food') => void
  onCancelEdit: () => void
  onSave: () => void
  onUpdateEditingData: (updates: any) => void
}

export default function FoodTab({ 
  foodMenu, 
  foodOrders, 
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
}: FoodTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg">Food Menu Management</h3>
        <button 
          onClick={() => onStartAdd('food')} 
          className="bg-gradient-to-r from-orange-500 to-red-400 text-white px-4 py-2 rounded-xl font-semibold hover:from-orange-600 hover:to-red-500 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Food Option
        </button>
      </div>

      {(showAddForm && editing.type === 'food') && (
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
          <h4 className="text-xl font-bold text-white mb-4 drop-shadow-lg">
            {editing.id ? 'Edit Food Option' : 'Add New Food Option'}
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Food Name"
              value={editing.data?.name || ''}
              onChange={(e) => onUpdateEditingData({ name: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            />
            <input
              type="text"
              placeholder="Description"
              value={editing.data?.description || ''}
              onChange={(e) => onUpdateEditingData({ description: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            />
            <select
              value={editing.data?.category || 'breakfast'}
              onChange={(e) => onUpdateEditingData({ category: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            >
              <option value="breakfast" className="text-gray-800">Breakfast</option>
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Food Menu Items */}
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
          <h4 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Food Menu Items</h4>
          <div className="space-y-3">
            {foodMenu.map((food) => (
              <div key={food.id} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-white">{food.name}</h5>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onStartEdit(food, 'food')}
                      className="p-2 bg-blue-500/40 text-blue-100 rounded-lg hover:bg-blue-500/60 hover:text-white transition-all duration-300 shadow-md"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(food.id, 'food')}
                      className="p-2 bg-red-500/40 text-red-100 rounded-lg hover:bg-red-500/60 hover:text-white transition-all duration-300 shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {food.description && (
                  <p className="text-sm text-white/80 mb-2">{food.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gradient-to-r from-orange-400 to-red-400 text-orange-900 px-3 py-1 rounded-full font-semibold capitalize">
                    {food.category}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    food.available
                      ? 'bg-green-400/20 text-green-300 border border-green-400/30'
                      : 'bg-red-400/20 text-red-300 border border-red-400/30'
                  }`}>
                    {food.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="mt-3 text-sm text-white bg-white/10 px-3 py-1 rounded-lg inline-block">
                  Orders: {foodOrders.filter(order => order.food_menu_id === food.id).length}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Food Orders Summary */}
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
          <h4 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Food Orders Summary</h4>
          <div className="space-y-3">
            {foodMenu.map((food) => {
              const orderCount = foodOrders.filter(order => order.food_menu_id === food.id).length
              return (
                <div key={food.id} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-white">{food.name}</h5>
                    <span className="text-2xl font-bold text-white bg-gradient-to-r from-orange-400 to-red-400 text-transparent bg-clip-text">
                      {orderCount}
                    </span>
                  </div>
                  <p className="text-sm text-white/80">orders</p>
                </div>
              )
            })}
            <div className="bg-gradient-to-r from-orange-400/20 to-red-400/20 backdrop-blur-sm border border-orange-300/30 rounded-xl p-4 mt-6">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-white">Total Food Orders</h5>
                <span className="text-3xl font-bold text-white">
                  {foodOrders.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 