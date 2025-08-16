import { supabase } from '@/lib/supabase'

export type AdminEntityType = 'guest' | 'achievement' | 'drink' | 'recipe' | 'food' | 'device'

export function getTableName(type: AdminEntityType): string {
	switch (type) {
		case 'guest': return 'guests'
		case 'achievement': return 'achievement_templates'
		case 'recipe': return 'recipes'
		case 'food': return 'food_menu'
		case 'drink': return 'drink_menu'
		case 'device': return 'device_configs'
		default:
			// Exhaustive check for safety in TS
			throw new Error(`Unknown admin entity type: ${String(type)}`)
	}
}

export function buildSavePayload(type: AdminEntityType, data: any): any {
	if (type === 'device') {
		const { drink_menu, achievement_templates, ...deviceData } = data || {}
		return deviceData
	}
	if (type === 'recipe') {
		const { drink_menu, ...recipeData } = data || {}
		return recipeData
	}
	return data
}

export async function deleteById(type: AdminEntityType, id: string) {
	const tableName = getTableName(type)
	return await supabase
		.from(tableName)
		.delete()
		.eq('id', id)
}


