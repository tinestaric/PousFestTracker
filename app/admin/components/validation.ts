import type { ValidationError, FormValidation, EditingItem } from './types'

// Helper function to safely check if a string value is empty after trimming
function isEmptyString(value: any): boolean {
  return !value || typeof value !== 'string' || value.trim() === ''
}

// Helper function to safely get string length
function getStringLength(value: any): number {
  return (value && typeof value === 'string') ? value.length : 0
}

export function validateGuestData(data: any): FormValidation {
  const errors: ValidationError[] = []

  if (isEmptyString(data.name)) {
    errors.push({ field: 'name', message: 'Guest name is required' })
  } else if (getStringLength(data.name) < 2) {
    errors.push({ field: 'name', message: 'Guest name must be at least 2 characters' })
  }

  if (isEmptyString(data.tag_uid)) {
    errors.push({ field: 'tag_uid', message: 'NFC Tag UID is required' })
  } else if (getStringLength(data.tag_uid) < 4) {
    errors.push({ field: 'tag_uid', message: 'Tag UID must be at least 4 characters' })
  }

  if (!data.gender || !['male', 'female'].includes(data.gender)) {
    errors.push({ field: 'gender', message: 'Valid gender selection is required' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateAchievementData(data: any): FormValidation {
  const errors: ValidationError[] = []

  if (isEmptyString(data.achievement_type)) {
    errors.push({ field: 'achievement_type', message: 'Achievement type is required' })
  }

  if (isEmptyString(data.title)) {
    errors.push({ field: 'title', message: 'Title is required' })
  } else if (getStringLength(data.title) < 3) {
    errors.push({ field: 'title', message: 'Title must be at least 3 characters' })
  }

  if (isEmptyString(data.description)) {
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

  if (isEmptyString(data.name)) {
    errors.push({ field: 'name', message: 'Drink name is required' })
  } else if (getStringLength(data.name) < 2) {
    errors.push({ field: 'name', message: 'Drink name must be at least 2 characters' })
  }

  if (isEmptyString(data.category)) {
    errors.push({ field: 'category', message: 'Category is required' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateRecipeData(data: any): FormValidation {
  const errors: ValidationError[] = []

  if (isEmptyString(data.name)) {
    errors.push({ field: 'name', message: 'Recipe name is required' })
  }

  if (isEmptyString(data.drink_menu_id)) {
    errors.push({ field: 'drink_menu_id', message: 'Associated drink is required' })
  }

  if (data.serves && (data.serves < 1 || data.serves > 20)) {
    errors.push({ field: 'serves', message: 'Serves must be between 1 and 20' })
  }

  if (data.video_url && typeof data.video_url === 'string' && data.video_url.trim() !== '') {
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

  if (isEmptyString(data.name)) {
    errors.push({ field: 'name', message: 'Food name is required' })
  } else if (getStringLength(data.name) < 2) {
    errors.push({ field: 'name', message: 'Food name must be at least 2 characters' })
  }

  if (isEmptyString(data.category)) {
    errors.push({ field: 'category', message: 'Category is required' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateDeviceData(data: any): FormValidation {
  const errors: ValidationError[] = []

  if (isEmptyString(data.device_id)) {
    errors.push({ field: 'device_id', message: 'Device ID is required' })
  } else if (getStringLength(data.device_id) < 3) {
    errors.push({ field: 'device_id', message: 'Device ID must be at least 3 characters' })
  }

  if (isEmptyString(data.name)) {
    errors.push({ field: 'name', message: 'Device name is required' })
  } else if (getStringLength(data.name) < 3) {
    errors.push({ field: 'name', message: 'Device name must be at least 3 characters' })
  }

  if (!data.scan_type || !['drink', 'achievement'].includes(data.scan_type)) {
    errors.push({ field: 'scan_type', message: 'Valid scan type is required' })
  }

  if (data.scan_type === 'drink' && isEmptyString(data.drink_menu_id)) {
    errors.push({ field: 'drink_menu_id', message: 'Drink selection is required for drink scanners' })
  }

  // For achievement scanners, achievement_template_id is optional
  // If null/empty, scanner will use time-based achievement unlocking
  // If set, scanner will unlock that specific achievement regardless of time

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
    case 'device':
      return validateDeviceData(editing.data)
    default:
      return { isValid: false, errors: [{ field: 'general', message: 'Unknown data type' }] }
  }
}

export function getFieldError(errors: ValidationError[], fieldName: string): string | undefined {
  const error = errors.find(e => e.field === fieldName)
  return error?.message
} 