import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { EditingItem, AppError, LoadingState, FormValidation } from './types'
import { validateFormData } from './validation'

interface ConfirmAction {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
}

export const useAdminEditing = (onDataChange: () => void) => {
  const [editing, setEditing] = useState<EditingItem>({ id: null, type: null, data: null })
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false })
  const [errors, setErrors] = useState<AppError[]>([])
  const [validation, setValidation] = useState<FormValidation>({ isValid: true, errors: [] })
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  const addError = useCallback((message: string, type: AppError['type'] = 'error', details?: string) => {
    const error: AppError = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now(),
      details
    }
    setErrors(prev => [...prev, error])
  }, [])

  const dismissError = useCallback((id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id))
  }, [])

  const setLoadingState = useCallback((isLoading: boolean, operation?: LoadingState['operation'], message?: string) => {
    setLoading({ isLoading, operation, message })
  }, [])

  const getTableName = (type: EditingItem['type']) => {
    switch (type) {
      case 'guest': return 'guests'
      case 'achievement': return 'achievement_templates'
      case 'recipe': return 'recipes'
      case 'food': return 'food_menu'
      case 'drink': return 'drink_menu'
      default: throw new Error(`Unknown type: ${type}`)
    }
  }

  const getDefaultData = (type: EditingItem['type']) => {
    const defaults = {
      guest: { name: '', tag_uid: '' },
      achievement: { 
        achievement_type: '', 
        title: '', 
        description: '', 
        logo_url: '/icons/default.png',
        from_time: new Date().toISOString().slice(0, 16),
        to_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
      },
      drink: { name: '', description: '', category: 'cocktail', available: true },
      recipe: { 
        drink_menu_id: '', 
        name: '', 
        description: '', 
        ingredients: [''], 
        instructions: [''], 
        video_url: '', 
        prep_time: '', 
        difficulty: 'Easy', 
        serves: 1 
      },
      food: { name: '', description: '', category: 'breakfast', available: true }
    }
    return defaults[type!] || {}
  }

  const startEdit = useCallback((item: any, type: EditingItem['type']) => {
    setEditing({ id: item.id, type, data: { ...item } })
    setShowAddForm(false)
    setValidation({ isValid: true, errors: [] })
  }, [])

  const startAdd = useCallback((type: EditingItem['type']) => {
    const defaultData = getDefaultData(type)
    setEditing({ id: null, type, data: defaultData })
    setShowAddForm(true)
    setValidation({ isValid: true, errors: [] })
  }, [])

  const cancelEdit = useCallback(() => {
    setEditing({ id: null, type: null, data: null })
    setShowAddForm(false)
    setValidation({ isValid: true, errors: [] })
  }, [])

  const updateEditingData = useCallback((updates: any) => {
    setEditing(prev => {
      const newEditing = {
        ...prev,
        data: { ...prev.data, ...updates }
      }
      
      // Validate on each update
      const newValidation = validateFormData(newEditing)
      setValidation(newValidation)
      
      return newEditing
    })
  }, [])

  const handleSave = useCallback(async () => {
    if (!editing.type || !editing.data) {
      addError('No data to save')
      return
    }

    // Validate before saving
    const validation = validateFormData(editing)
    setValidation(validation)
    
    if (!validation.isValid) {
      addError('Please fix the validation errors before saving', 'warning')
      return
    }

    try {
      setLoadingState(true, 'saving', 'Saving data...')
      const tableName = getTableName(editing.type)

      if (editing.id) {
        // Update existing
        const { error } = await supabase
          .from(tableName)
          .update(editing.data)
          .eq('id', editing.id)
        
        if (error) throw error
        addError(`${editing.type} updated successfully`, 'success')
      } else {
        // Create new
        const { error } = await supabase
          .from(tableName)
          .insert([editing.data])
        
        if (error) throw error
        addError(`${editing.type} created successfully`, 'success')
      }

      cancelEdit()
      onDataChange()
    } catch (error: any) {
      console.error('Error saving:', error)
      addError(
        `Failed to save ${editing.type}`,
        'error',
        error.message || 'An unexpected error occurred'
      )
    } finally {
      setLoadingState(false)
    }
  }, [editing, onDataChange, addError, setLoadingState, cancelEdit])

  const confirmDelete = useCallback((id: string, type: EditingItem['type'], itemName?: string) => {
    setConfirmAction({
      isOpen: true,
      title: `Delete ${type}`,
      message: `Are you sure you want to delete ${itemName ? `"${itemName}"` : `this ${type}`}? This action cannot be undone.`,
      onConfirm: () => performDelete(id, type)
    })
  }, [])

  const performDelete = useCallback(async (id: string, type: EditingItem['type']) => {
    try {
      setLoadingState(true, 'deleting', 'Deleting item...')
      const tableName = getTableName(type)
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      addError(`${type} deleted successfully`, 'success')
      onDataChange()
    } catch (error: any) {
      console.error('Error deleting:', error)
      addError(
        `Failed to delete ${type}`,
        'error', 
        error.message || 'An unexpected error occurred'
      )
    } finally {
      setLoadingState(false)
      setConfirmAction({ isOpen: false, title: '', message: '', onConfirm: () => {} })
    }
  }, [onDataChange, addError, setLoadingState])

  const cancelConfirm = useCallback(() => {
    setConfirmAction({ isOpen: false, title: '', message: '', onConfirm: () => {} })
  }, [])

  return {
    // State
    editing,
    showAddForm,
    loading,
    errors,
    validation,
    confirmAction,
    
    // Actions
    startEdit,
    startAdd,
    cancelEdit,
    updateEditingData,
    handleSave,
    handleDelete: confirmDelete,
    confirmDelete: confirmAction.onConfirm,
    cancelConfirm,
    dismissError,
    
    // Utilities
    addError
  }
} 