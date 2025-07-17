import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import type { Recipe, DrinkMenuItem } from '@/lib/supabase'
import type { EditingItem, FormValidation, LoadingState } from './types'

interface RecipesTabProps {
  recipes: Recipe[]
  drinks: DrinkMenuItem[]
  editing: EditingItem
  showAddForm: boolean
  validation: FormValidation
  loading: LoadingState
  onStartAdd: (type: 'recipe') => void
  onStartEdit: (item: Recipe, type: 'recipe') => void
  onDelete: (id: string, type: 'recipe') => void
  onCancelEdit: () => void
  onSave: () => void
  onUpdateEditingData: (updates: any) => void
}

export default function RecipesTab({ 
  recipes, 
  drinks, 
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
}: RecipesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg">Recipe Management</h3>
        <button 
          onClick={() => onStartAdd('recipe')} 
          className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-4 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-500 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Recipe
        </button>
      </div>

      {(showAddForm && editing.type === 'recipe') && (
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
          <h4 className="text-xl font-bold text-white mb-4 drop-shadow-lg">
            {editing.id ? 'Edit Recipe' : 'Add New Recipe'}
          </h4>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Recipe Name"
                value={editing.data?.name || ''}
                onChange={(e) => onUpdateEditingData({ name: e.target.value })}
                className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
              />
              <select
                value={editing.data?.drink_menu_id || ''}
                onChange={(e) => onUpdateEditingData({ drink_menu_id: e.target.value })}
                className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:bg-white/20 focus:border-white/50 transition-all duration-300"
              >
                <option value="" className="text-gray-800">Select Drink</option>
                {drinks.map((drink) => (
                  <option key={drink.id} value={drink.id} className="text-gray-800">
                    {drink.name}
                  </option>
                ))}
              </select>
            </div>
            
            <textarea
              placeholder="Recipe Description"
              value={editing.data?.description || ''}
              onChange={(e) => onUpdateEditingData({ description: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
              rows={2}
            />

            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Prep Time (e.g., 5 min)"
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

            <input
              type="text"
              placeholder="YouTube Video URL (optional)"
              value={editing.data?.video_url || ''}
              onChange={(e) => onUpdateEditingData({ video_url: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            />
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
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white text-lg">{recipe.name}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => onStartEdit(recipe, 'recipe')}
                  className="p-2 bg-blue-500/40 text-blue-100 rounded-lg hover:bg-blue-500/60 hover:text-white transition-all duration-300 shadow-md"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(recipe.id, 'recipe')}
                  className="p-2 bg-red-500/40 text-red-100 rounded-lg hover:bg-red-500/60 hover:text-white transition-all duration-300 shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {recipe.description && (
              <p className="text-sm text-white/80 mb-2">{recipe.description}</p>
            )}
            <div className="text-xs text-white/80 space-y-1">
              <p><strong>Linked to:</strong> {recipe.drink_menu?.name || 'Unknown Drink'}</p>
              <p><strong>Prep time:</strong> {recipe.prep_time || 'N/A'}</p>
              <p><strong>Difficulty:</strong> {recipe.difficulty || 'N/A'}</p>
              <p><strong>Serves:</strong> {recipe.serves}</p>
              <p><strong>Ingredients:</strong> {recipe.ingredients?.length || 0}</p>
              <p><strong>Steps:</strong> {recipe.instructions?.length || 0}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 