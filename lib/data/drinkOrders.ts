import { supabase } from '@/lib/supabase'

export async function getDrinkOrdersWithAlcoholFieldsByGuestId(guestId: string, options?: { ascending?: boolean }) {
	const { ascending = true } = options ?? {}
	return await supabase
		.from('drink_orders')
		.select(`
			quantity,
			ordered_at,
			drink_menu!inner(alcohol_percentage, alcohol_content_ml)
		`)
		.eq('guest_id', guestId)
		.order('ordered_at', { ascending })
}


