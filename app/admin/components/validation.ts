import type { ValidationError, FormValidation, EditingItem } from './types'

export function validateGuestData(data: any): FormValidation {
  const errors: ValidationError[] = []

  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Guest name is required' })
  } else if (data.name.length < 2) {
    errors.push({ field: 'name', message: 'Guest name must be at least 2 characters' })
  }

  if (!data.tag_uid || data.tag_uid.trim() === '') {
    errors.push({ field: 'tag_uid', message: 'NFC Tag UID is required' })
  } else if (data.tag_uid.length < 4) {
    errors.push({ field: 'tag_uid', message: 'Tag UID must be at least 4 characters' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateAchievementData(data: any): FormValidation {
  const errors: ValidationError[] = []

  if (!data.achievement_type || data.achievement_type.trim() === '') {
    errors.push({ field: 'achievement_type', message: 'Achievement type is required' })
  }

  if (!data.title || data.title.trim() === '') {
    errors.push({ field: 'title', message: 'Title is required' })
  } else if (data.title.length < 3) {
    errors.push({ field: 'title', message: 'Title must be at least 3 characters' })
  }

  if (!data.description || data.description.trim() === '') {
    errors.push({ field: 'description', message: 'Description is required' })
  }

  if (data.from_time && data.to_time) {
    const fromTime = new Date(data.from_time)
    const toTime = new Date(data.to_time)
    if (fromTime >= toTime) {
      errors.push({ field: 'to_time', message: 'End time must be after start time' })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateDrinkData(data: any): FormValidation {
  const errors: ValidationError[] = []

  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Drink name is required' })
  } else if (data.name.length < 2) {
    errors.push({ field: 'name', message: 'Drink name must be at least 2 characters' })
  }

  if (!data.category || data.category.trim() === '') {
    errors.push({ field: 'category', message: 'Category is required' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateRecipeData(data: any): FormValidation {
  const errors: ValidationError[] = []

  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Recipe name is required' })
  }

  if (!data.drink_menu_id || data.drink_menu_id.trim() === '') {
    errors.push({ field: 'drink_menu_id', message: 'Associated drink is required' })
  }

  if (data.serves && (data.serves < 1 || data.serves > 20)) {
    errors.push({ field: 'serves', message: 'Serves must be between 1 and 20' })
  }

  if (data.video_url && data.video_url.trim() !== '') {
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    if (!urlPattern.test(data.video_url)) {
      errors.push({ field: 'video_url', message: 'Please enter a valid URL' })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateFoodData(data: any): FormValidation {
  const errors: ValidationError[] = []

  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Food name is required' })
  } else if (data.name.length < 2) {
    errors.push({ field: 'name', message: 'Food name must be at least 2 characters' })
  }

  if (!data.category || data.category.trim() === '') {
    errors.push({ field: 'category', message: 'Category is required' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateFormData(editing: EditingItem): FormValidation {
  if (!editing.type || !editing.data) {
    return { isValid: false, errors: [{ field: 'general', message: 'No data to validate' }] }
  }

  switch (editing.type) {
    case 'guest':
      return validateGuestData(editing.data)
    case 'achievement':
      return validateAchievementData(editing.data)
    case 'drink':
      return validateDrinkData(editing.data)
    case 'recipe':
      return validateRecipeData(editing.data)
    case 'food':
      return validateFoodData(editing.data)
    default:
      return { isValid: false, errors: [{ field: 'general', message: 'Unknown data type' }] }
  }
}

export function getFieldError(errors: ValidationError[], fieldName: string): string | undefined {
  const error = errors.find(e => e.field === fieldName)
  return error?.message
} 