import { Download, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import type { Guest } from '@/lib/supabase'
import type { EditingItem, FormValidation, LoadingState } from './types'

interface GuestsTabProps {
  guests: Guest[]
  editing: EditingItem
  showAddForm: boolean
  validation: FormValidation
  loading: LoadingState
  onStartAdd: (type: 'guest') => void
  onStartEdit: (item: Guest, type: 'guest') => void
  onCancelEdit: () => void
  onSave: () => void
  onDelete: (id: string, type: 'guest') => void
  onUpdateEditingData: (updates: any) => void
}

export default function GuestsTab({ 
  guests, 
  editing, 
  showAddForm, 
  validation,
  loading,
  onStartAdd, 
  onStartEdit, 
  onCancelEdit, 
  onSave, 
  onDelete, 
  onUpdateEditingData 
}: GuestsTabProps) {

  const exportGuestData = () => {
    const csvContent = [
      ['Name', 'Tag UID', 'Created At'],
      ...guests.map(guest => [guest.name, guest.tag_uid, guest.created_at])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guests.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg">Guest Management</h3>
        <div className="flex gap-3">
          <button 
            onClick={exportGuestData} 
            className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={() => onStartAdd('guest')} 
            className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Guest
          </button>
        </div>
      </div>

      {(showAddForm && editing.type === 'guest') && (
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
          <h4 className="text-xl font-bold text-white mb-4 drop-shadow-lg">
            {editing.id ? 'Edit Guest' : 'Add New Guest'}
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Guest Name"
              value={editing.data?.name || ''}
              onChange={(e) => onUpdateEditingData({ name: e.target.value })}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
            />
            <input
              type="text"
              placeholder="NFC Tag UID"
              value={editing.data?.tag_uid || ''}
              onChange={(e) => onUpdateEditingData({ tag_uid: e.target.value })}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
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

      <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/30">
                <th className="text-left py-3 text-white font-bold">Name</th>
                <th className="text-left py-3 text-white font-bold">Tag UID</th>
                <th className="text-left py-3 text-white font-bold">Created</th>
                <th className="text-left py-3 text-white font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="border-b border-white/20 hover:bg-white/10 transition-all duration-300">
                  <td className="py-3 text-white font-medium">{guest.name}</td>
                  <td className="py-3 font-mono text-sm text-white/80">{guest.tag_uid}</td>
                  <td className="py-3 text-sm text-white/80">
                    {new Date(guest.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onStartEdit(guest, 'guest')}
                        className="p-2 bg-blue-500/40 text-blue-100 rounded-lg hover:bg-blue-500/60 hover:text-white transition-all duration-300 shadow-md"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(guest.id, 'guest')}
                        className="p-2 bg-red-500/40 text-red-100 rounded-lg hover:bg-red-500/60 hover:text-white transition-all duration-300 shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 