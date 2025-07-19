import { Save, X, Trash2 } from 'lucide-react'
import type { EditingItem, FormValidation, LoadingState } from './types'
import type { DrinkMenuItem } from '@/lib/supabase'

interface EditModalProps {
  editing: EditingItem
  drinks?: DrinkMenuItem[]
  validation: FormValidation
  loading: LoadingState
  onSave: () => void
  onCancel: () => void
  onUpdateEditingData: (updates: any) => void
}

export default function EditModal({ editing, drinks = [], validation, loading, onSave, onCancel, onUpdateEditingData }: EditModalProps) {
  if (!editing.id || !editing.type) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 max-w-md w-full m-4 shadow-2xl max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Edit {editing.type}</h3>
        
        {editing.type === 'guest' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Guest Name"
              value={editing.data?.name || ''}
              onChange={(e) => onUpdateEditingData({ name: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            />
            <input
              type="text"
              placeholder="NFC Tag UID"
              value={editing.data?.tag_uid || ''}
              onChange={(e) => onUpdateEditingData({ tag_uid: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            />
            <select
              value={editing.data?.gender || 'male'}
              onChange={(e) => onUpdateEditingData({ gender: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            >
              <option value="male" className="text-gray-800">Male (Dobrodošel)</option>
              <option value="female" className="text-gray-800">Female (Dobrodošla)</option>
            </select>
          </div>
        )}

        {editing.type === 'achievement' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Achievement Type"
                value={editing.data?.achievement_type || ''}
                onChange={(e) => onUpdateEditingData({ achievement_type: e.target.value })}
                className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
              />
              <input
                type="text"
                placeholder="Title"
                value={editing.data?.title || ''}
                onChange={(e) => onUpdateEditingData({ title: e.target.value })}
                className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
              />
            </div>
            <textarea
              placeholder="Description"
              value={editing.data?.description || ''}
              onChange={(e) => onUpdateEditingData({ description: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
              rows={3}
            />
            <input
              type="text"
              placeholder="Logo URL"
              value={editing.data?.logo_url || ''}
              onChange={(e) => onUpdateEditingData({ logo_url: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            />
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">From Time</label>
                <input
                  type="datetime-local"
                  value={editing.data?.from_time?.slice(0, 16) || ''}
                  onChange={(e) => onUpdateEditingData({ from_time: e.target.value + ':00+00' })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">To Time</label>
                <input
                  type="datetime-local"
                  value={editing.data?.to_time?.slice(0, 16) || ''}
                  onChange={(e) => onUpdateEditingData({ to_time: e.target.value + ':00+00' })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        )}

        {editing.type === 'drink' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Drink Name"
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
              value={editing.data?.category || 'cocktail'}
              onChange={(e) => onUpdateEditingData({ category: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            >
              <option value="cocktail" className="text-gray-800">Cocktail</option>
              <option value="beer" className="text-gray-800">Beer</option>
              <option value="shot" className="text-gray-800">Shot</option>
              <option value="non-alcoholic" className="text-gray-800">Non-Alcoholic</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.data?.available || false}
                onChange={(e) => onUpdateEditingData({ available: e.target.checked })}
                className="rounded"
              />
              <label className="text-white">Available</label>
            </div>
          </div>
        )}

        {editing.type === 'food' && (
          <div className="space-y-4">
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.data?.available || false}
                onChange={(e) => onUpdateEditingData({ available: e.target.checked })}
                className="rounded"
              />
              <label className="text-white">Available</label>
            </div>
          </div>
        )}

        {editing.type === 'recipe' && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <input
              type="text"
              placeholder="Recipe Name"
              value={editing.data?.name || ''}
              onChange={(e) => onUpdateEditingData({ name: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            />
            <select
              value={editing.data?.drink_menu_id || ''}
              onChange={(e) => onUpdateEditingData({ drink_menu_id: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            >
              <option value="" className="text-gray-800">Select Drink</option>
              {drinks.map((drink) => (
                <option key={drink.id} value={drink.id} className="text-gray-800">
                  {drink.name}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Description"
              value={editing.data?.description || ''}
              onChange={(e) => onUpdateEditingData({ description: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
              rows={2}
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Prep Time"
                value={editing.data?.prep_time || ''}
                onChange={(e) => onUpdateEditingData({ prep_time: e.target.value })}
                className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
              />
              <select
                value={editing.data?.difficulty || 'Easy'}
                onChange={(e) => onUpdateEditingData({ difficulty: e.target.value })}
                className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:bg-white/20 focus:border-white/50 transition-all duration-300"
              >
                <option value="Easy" className="text-gray-800">Easy</option>
                <option value="Medium" className="text-gray-800">Medium</option>
                <option value="Hard" className="text-gray-800">Hard</option>
              </select>
              <input
                type="number"
                placeholder="Serves"
                value={editing.data?.serves || 1}
                onChange={(e) => onUpdateEditingData({ serves: parseInt(e.target.value) || 1 })}
                className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                min="1"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button 
            onClick={onSave} 
            className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-500 transition-all duration-300 flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button 
            onClick={onCancel} 
            className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
} 