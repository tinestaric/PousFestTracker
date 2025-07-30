import { memo } from 'react'
import { Plus, Edit2, Trash2, Smartphone, CheckCircle, XCircle } from 'lucide-react'
import { getEventConfig, getText } from '@/lib/eventConfig'
import type { DeviceConfig, DrinkMenuItem, AchievementTemplate } from '@/lib/supabase'
import type { EditingItem, FormValidation, LoadingState } from './types'
import { FormInput } from './FormInput'

interface DevicesTabProps {
  deviceConfigs: DeviceConfig[]
  drinks: DrinkMenuItem[]
  achievements: AchievementTemplate[]
  editing: EditingItem
  showAddForm: boolean
  validation: FormValidation
  loading: LoadingState
  onStartAdd: (type: 'device') => void
  onStartEdit: (item: DeviceConfig, type: 'device') => void
  onDelete: (id: string, type: 'device') => void
  onCancelEdit: () => void
  onSave: () => void
  onUpdateEditingData: (updates: Record<string, any>) => void
}

const DevicesTab = memo(function DevicesTab({
  deviceConfigs,
  drinks,
  achievements,
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
}: DevicesTabProps) {
  const config = getEventConfig()

  const getValidationError = (field: string) => {
    return validation.errors.find(error => error.field === field)?.message
  }

  const getScanTypeColor = (scanType: string) => {
    return scanType === 'drink' ? 'text-blue-600' : 'text-purple-600'
  }

  const getScanTypeIcon = (scanType: string) => {
    return scanType === 'drink' ? '🍹' : '🏆'
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Smartphone className="w-6 h-6 text-white" />
          <h2 className="text-2xl font-bold text-white">Device Scanners</h2>
        </div>
        <button
          onClick={() => onStartAdd('device')}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || (editing.type === 'device' && !editing.id)) && (
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            {editing.id ? 'Edit Device Configuration' : 'Add New Device Configuration'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Device ID"
              type="text"
              value={editing.data?.device_id || ''}
              onChange={(value) => onUpdateEditingData({ device_id: value })}
              placeholder="e.g., scanner_001"
              error={getValidationError('device_id')}
            />
            
            <FormInput
              label="Device Name"
              type="text"
              value={editing.data?.name || ''}
              onChange={(value) => onUpdateEditingData({ name: value })}
              placeholder="e.g., Main Bar Scanner"
              error={getValidationError('name')}
            />
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Scan Type
              </label>
              <select
                value={editing.data?.scan_type || ''}
                onChange={(e) => onUpdateEditingData({ scan_type: e.target.value })}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                <option value="" className="text-gray-800">Select scan type...</option>
                <option value="drink" className="text-gray-800">Drink</option>
                <option value="achievement" className="text-gray-800">Achievement</option>
              </select>
              {getValidationError('scan_type') && (
                <p className="text-red-300 text-sm mt-1">{getValidationError('scan_type')}</p>
              )}
            </div>

            {editing.data?.scan_type === 'drink' && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Drink to Log
                </label>
                <select
                  value={editing.data?.drink_menu_id || ''}
                  onChange={(e) => onUpdateEditingData({ drink_menu_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                >
                  <option value="" className="text-gray-800">Select drink...</option>
                  {drinks.map(drink => (
                    <option key={drink.id} value={drink.id} className="text-gray-800">
                      {drink.name} ({drink.category})
                    </option>
                  ))}
                </select>
                {getValidationError('drink_menu_id') && (
                  <p className="text-red-300 text-sm mt-1">{getValidationError('drink_menu_id')}</p>
                )}
              </div>
            )}

            {editing.data?.scan_type === 'achievement' && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Achievement to Unlock
                  <span className="text-white/60 text-xs block">
                    Leave empty for time-based achievement unlocking
                  </span>
                </label>
                <select
                  value={editing.data?.achievement_template_id || ''}
                  onChange={(e) => onUpdateEditingData({ achievement_template_id: e.target.value || null })}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                >
                  <option value="" className="text-gray-800">Time-based achievements (respects time windows)</option>
                  {achievements.map(achievement => (
                    <option key={achievement.id} value={achievement.id} className="text-gray-800">
                      {achievement.title} (override time constraints)
                    </option>
                  ))}
                </select>
                {getValidationError('achievement_template_id') && (
                  <p className="text-red-300 text-sm mt-1">{getValidationError('achievement_template_id')}</p>
                )}
              </div>
            )}

            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="device-active"
                checked={editing.data?.active ?? true}
                onChange={(e) => onUpdateEditingData({ active: e.target.checked })}
                className="w-4 h-4 text-white bg-white/20 border-white/30 rounded focus:ring-white/50"
              />
              <label htmlFor="device-active" className="text-white text-sm font-medium">
                Device Active
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onSave}
              disabled={loading.isLoading || !validation.isValid}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
            >
              {loading.isLoading ? 'Saving...' : 'Save Device'}
            </button>
            <button
              onClick={onCancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Devices List */}
      <div className="space-y-4">
        {deviceConfigs.length === 0 ? (
          <div className="text-center py-12">
            <Smartphone className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/70 text-lg">No device configurations yet</p>
            <p className="text-white/50">Add your first scanner device to get started!</p>
          </div>
        ) : (
          deviceConfigs.map((device) => (
            <div
              key={device.id}
              className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getScanTypeIcon(device.scan_type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{device.name}</h3>
                      <p className="text-white/70 text-sm">Device ID: {device.device_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {device.active ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className={`text-sm ${device.active ? 'text-green-400' : 'text-red-400'}`}>
                        {device.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Scan Type:</span>
                      <span className={`ml-2 font-medium ${getScanTypeColor(device.scan_type)}`}>
                        {device.scan_type.charAt(0).toUpperCase() + device.scan_type.slice(1)}
                      </span>
                    </div>
                    
                    {device.scan_type === 'drink' && device.drink_menu && (
                      <div>
                        <span className="text-white/60">Drink:</span>
                        <span className="ml-2 text-white font-medium">
                          {device.drink_menu.name}
                        </span>
                      </div>
                    )}
                    
                    {device.scan_type === 'achievement' && (
                      <div>
                        <span className="text-white/60">Achievement:</span>
                        <span className="ml-2 text-white font-medium">
                          {device.achievement_templates 
                            ? device.achievement_templates.title 
                            : 'Time-based (all available)'
                          }
                        </span>
                        {!device.achievement_templates && (
                          <span className="ml-2 text-white/50 text-xs">
                            (respects time windows)
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <span className="text-white/60">Created:</span>
                      <span className="ml-2 text-white/80">
                        {new Date(device.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onStartEdit(device, 'device')}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit device"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(device.id, 'device')}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors"
                    title="Delete device"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
})

export default DevicesTab
