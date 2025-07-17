import { Save, X } from 'lucide-react'
import { FormInput, FormCheckbox } from './FormInput'
import { getFieldError } from './validation'
import type { EditingItem, FormValidation, LoadingState } from './types'
import type { DrinkMenuItem } from '@/lib/supabase'

interface EntityFormProps {
  editing: EditingItem
  validation: FormValidation
  loading: LoadingState
  drinks?: DrinkMenuItem[]
  onSave: () => void
  onCancel: () => void
  onUpdateData: (updates: any) => void
  variant?: 'modal' | 'inline'
}

export default function EntityForm({
  editing,
  validation,
  loading,
  drinks = [],
  onSave,
  onCancel,
  onUpdateData,
  variant = 'inline'
}: EntityFormProps) {
  if (!editing.type || !editing.data) return null

  const isLoading = loading.isLoading && (loading.operation === 'saving' || loading.operation === 'loading')

  const renderGuestForm = () => (
    <div className="grid md:grid-cols-2 gap-4">
      <FormInput
        label="Guest Name"
        placeholder="Enter guest name"
        value={editing.data.name || ''}
        onChange={(e) => onUpdateData({ name: e.target.value })}
        error={getFieldError(validation.errors, 'name')}
        disabled={isLoading}
      />
      <FormInput
        label="NFC Tag UID"
        placeholder="Enter NFC tag UID"
        value={editing.data.tag_uid || ''}
        onChange={(e) => onUpdateData({ tag_uid: e.target.value })}
        error={getFieldError(validation.errors, 'tag_uid')}
        disabled={isLoading}
      />
    </div>
  )

  const renderAchievementForm = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="Achievement Type"
          placeholder="e.g., drink_count, time_based"
          value={editing.data.achievement_type || ''}
          onChange={(e) => onUpdateData({ achievement_type: e.target.value })}
          error={getFieldError(validation.errors, 'achievement_type')}
          disabled={isLoading}
        />
        <FormInput
          label="Title"
          placeholder="Achievement title"
          value={editing.data.title || ''}
          onChange={(e) => onUpdateData({ title: e.target.value })}
          error={getFieldError(validation.errors, 'title')}
          disabled={isLoading}
        />
      </div>
      
      <FormInput
        label="Description"
        variant="textarea"
        placeholder="Achievement description"
        value={editing.data.description || ''}
        onChange={(e) => onUpdateData({ description: e.target.value })}
        error={getFieldError(validation.errors, 'description')}
        rows={3}
        disabled={isLoading}
      />
      
      <FormInput
        label="Logo URL"
        placeholder="URL to achievement icon"
        value={editing.data.logo_url || ''}
        onChange={(e) => onUpdateData({ logo_url: e.target.value })}
        error={getFieldError(validation.errors, 'logo_url')}
        disabled={isLoading}
      />
      
      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="From Time"
          type="datetime-local"
          value={editing.data.from_time || ''}
          onChange={(e) => onUpdateData({ from_time: e.target.value })}
          error={getFieldError(validation.errors, 'from_time')}
          disabled={isLoading}
        />
        <FormInput
          label="To Time"
          type="datetime-local"
          value={editing.data.to_time || ''}
          onChange={(e) => onUpdateData({ to_time: e.target.value })}
          error={getFieldError(validation.errors, 'to_time')}
          disabled={isLoading}
        />
      </div>
    </div>
  )

  const renderDrinkForm = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="Drink Name"
          placeholder="Enter drink name"
          value={editing.data.name || ''}
          onChange={(e) => onUpdateData({ name: e.target.value })}
          error={getFieldError(validation.errors, 'name')}
          disabled={isLoading}
        />
        <FormInput
          label="Category"
          variant="select"
          value={editing.data.category || 'cocktail'}
          onChange={(e) => onUpdateData({ category: e.target.value })}
          error={getFieldError(validation.errors, 'category')}
          disabled={isLoading}
        >
          <option value="cocktail">Cocktail</option>
          <option value="beer">Beer</option>
          <option value="shot">Shot</option>
          <option value="non-alcoholic">Non-Alcoholic</option>
        </FormInput>
      </div>
      
      <FormInput
        label="Description"
        placeholder="Enter drink description"
        value={editing.data.description || ''}
        onChange={(e) => onUpdateData({ description: e.target.value })}
        error={getFieldError(validation.errors, 'description')}
        disabled={isLoading}
      />
      
      <FormCheckbox
        label="Available"
        checked={editing.data.available || false}
        onChange={(checked) => onUpdateData({ available: checked })}
        error={getFieldError(validation.errors, 'available')}
      />
    </div>
  )

  const renderRecipeForm = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="Recipe Name"
          placeholder="Enter recipe name"
          value={editing.data.name || ''}
          onChange={(e) => onUpdateData({ name: e.target.value })}
          error={getFieldError(validation.errors, 'name')}
          disabled={isLoading}
        />
        <FormInput
          label="Associated Drink"
          variant="select"
          value={editing.data.drink_menu_id || ''}
          onChange={(e) => onUpdateData({ drink_menu_id: e.target.value })}
          error={getFieldError(validation.errors, 'drink_menu_id')}
          disabled={isLoading}
        >
          <option value="">Select Drink</option>
          {drinks.map((drink) => (
            <option key={drink.id} value={drink.id}>
              {drink.name}
            </option>
          ))}
        </FormInput>
      </div>
      
      <FormInput
        label="Description"
        variant="textarea"
        placeholder="Recipe description"
        value={editing.data.description || ''}
        onChange={(e) => onUpdateData({ description: e.target.value })}
        error={getFieldError(validation.errors, 'description')}
        rows={2}
        disabled={isLoading}
      />
      
      <div className="grid md:grid-cols-3 gap-4">
        <FormInput
          label="Prep Time"
          placeholder="e.g., 5 min"
          value={editing.data.prep_time || ''}
          onChange={(e) => onUpdateData({ prep_time: e.target.value })}
          error={getFieldError(validation.errors, 'prep_time')}
          disabled={isLoading}
        />
        <FormInput
          label="Difficulty"
          variant="select"
          value={editing.data.difficulty || 'Easy'}
          onChange={(e) => onUpdateData({ difficulty: e.target.value })}
          error={getFieldError(validation.errors, 'difficulty')}
          disabled={isLoading}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </FormInput>
        <FormInput
          label="Serves"
          type="number"
          min="1"
          max="20"
          value={editing.data.serves || 1}
          onChange={(e) => onUpdateData({ serves: parseInt(e.target.value) || 1 })}
          error={getFieldError(validation.errors, 'serves')}
          disabled={isLoading}
        />
      </div>
      
      <FormInput
        label="Video URL (optional)"
        placeholder="YouTube video URL"
        value={editing.data.video_url || ''}
        onChange={(e) => onUpdateData({ video_url: e.target.value })}
        error={getFieldError(validation.errors, 'video_url')}
        disabled={isLoading}
      />
    </div>
  )

  const renderFoodForm = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="Food Name"
          placeholder="Enter food name"
          value={editing.data.name || ''}
          onChange={(e) => onUpdateData({ name: e.target.value })}
          error={getFieldError(validation.errors, 'name')}
          disabled={isLoading}
        />
        <FormInput
          label="Category"
          variant="select"
          value={editing.data.category || 'breakfast'}
          onChange={(e) => onUpdateData({ category: e.target.value })}
          error={getFieldError(validation.errors, 'category')}
          disabled={isLoading}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </FormInput>
      </div>
      
      <FormInput
        label="Description"
        placeholder="Enter food description"
        value={editing.data.description || ''}
        onChange={(e) => onUpdateData({ description: e.target.value })}
        error={getFieldError(validation.errors, 'description')}
        disabled={isLoading}
      />
      
      <FormCheckbox
        label="Available"
        checked={editing.data.available || false}
        onChange={(checked) => onUpdateData({ available: checked })}
        error={getFieldError(validation.errors, 'available')}
      />
    </div>
  )

  const renderFormContent = () => {
    switch (editing.type) {
      case 'guest':
        return renderGuestForm()
      case 'achievement':
        return renderAchievementForm()
      case 'drink':
        return renderDrinkForm()
      case 'recipe':
        return renderRecipeForm()
      case 'food':
        return renderFoodForm()
      default:
        return <div className="text-white">Unknown form type</div>
    }
  }

  const containerClass = variant === 'modal' 
    ? "space-y-4"
    : "bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl space-y-4"

  return (
    <div className={containerClass}>
      {variant === 'inline' && (
        <h4 className="text-xl font-bold text-white mb-4 drop-shadow-lg">
          {editing.id ? `Edit ${editing.type}` : `Add New ${editing.type}`}
        </h4>
      )}
      
      {renderFormContent()}
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={onSave}
          disabled={isLoading || !validation.isValid}
          className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-500 transition-all duration-300 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  )
} 