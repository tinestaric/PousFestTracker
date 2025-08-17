import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import type { AchievementTemplate, GuestAchievement } from '@/lib/supabase'
import type { EditingItem, FormValidation, LoadingState } from './types'

interface AchievementsTabProps {
  achievements: AchievementTemplate[]
  guestAchievements: GuestAchievement[]
  editing: EditingItem
  showAddForm: boolean
  validation: FormValidation
  loading: LoadingState
  onStartAdd: (type: 'achievement') => void
  onStartEdit: (item: AchievementTemplate, type: 'achievement') => void
  onDelete: (id: string, type: 'achievement') => void
  onCancelEdit: () => void
  onSave: () => void
  onUpdateEditingData: (updates: any) => void
}

export default function AchievementsTab({ 
  achievements, 
  guestAchievements, 
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
}: AchievementsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg">Achievement Management</h3>
        <button 
          onClick={() => onStartAdd('achievement')} 
          className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-4 py-2 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Achievement
        </button>
      </div>

      {(showAddForm && editing.type === 'achievement') && (
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
          <h4 className="text-xl font-bold text-white mb-4 drop-shadow-lg">
            {editing.id ? 'Edit Achievement' : 'Add New Achievement'}
          </h4>
          <div className="grid gap-4">
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
              className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
              rows={3}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Emoji (e.g., 🏆)"
                value={editing.data?.logo_url || ''}
                onChange={(e) => onUpdateEditingData({ logo_url: e.target.value })}
                className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
              />
              <div className="text-white/70 text-sm flex items-center">Tip: paste an emoji; images are optional</div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">From Time</label>
                <input
                  type="datetime-local"
                  value={editing.data?.from_time?.slice(0, 16) || ''}
                  onChange={(e) => onUpdateEditingData({ from_time: e.target.value + ':00+00' })}
                  className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:bg-white/20 focus:border-white/50 transition-all duration-300 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">To Time</label>
                <input
                  type="datetime-local"
                  value={editing.data?.to_time?.slice(0, 16) || ''}
                  onChange={(e) => onUpdateEditingData({ to_time: e.target.value + ':00+00' })}
                  className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:bg-white/20 focus:border-white/50 transition-all duration-300 w-full"
                />
              </div>
            </div>
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

      <div className="grid md:grid-cols-2 gap-6">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-bold text-white text-lg">{achievement.title}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => onStartEdit(achievement, 'achievement')}
                  className="p-2 bg-blue-500/40 text-blue-100 rounded-lg hover:bg-blue-500/60 hover:text-white transition-all duration-300 shadow-md"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(achievement.id, 'achievement')}
                  className="p-2 bg-red-500/40 text-red-100 rounded-lg hover:bg-red-500/60 hover:text-white transition-all duration-300 shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-3 py-1 rounded-full mb-3 inline-block font-semibold">
              {achievement.achievement_type}
            </span>
            <p className="text-sm text-white/90 mb-4 leading-relaxed">{achievement.description}</p>
            <div className="text-xs text-white/80 space-y-1">
              <p><strong>From:</strong> {new Date(achievement.from_time).toLocaleString()}</p>
              <p><strong>To:</strong> {new Date(achievement.to_time).toLocaleString()}</p>
              <p className="mt-3 font-semibold text-white bg-white/10 px-3 py-1 rounded-lg inline-block">
                Unlocked by: {guestAchievements.filter(ga => ga.achievement_template_id === achievement.id).length} guests
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 