// Shared achievement awarding utilities for edge functions

type SupabaseClientLike = {
	from: (table: string) => any
}

function parseRule(achievementType: string): (metrics: any) => boolean {
	// Built-in short-hands
	if (achievementType === 'FIRST_SIP') {
		return (m) => m.totalCount >= 1
	}
	if (achievementType === 'TRIPLE_THREAT') {
		return (m) => m.alcoholicCount >= 3
	}

	// Generic patterns
	const totalCountMatch = achievementType.match(/^TOTAL_COUNT_(\d+)$/)
	if (totalCountMatch) {
		const threshold = Number(totalCountMatch[1])
		return (m) => m.totalCount >= threshold
	}

	const alcoholicCountMatch = achievementType.match(/^ALCOHOLIC_COUNT_(\d+)$/)
	if (alcoholicCountMatch) {
		const threshold = Number(alcoholicCountMatch[1])
		return (m) => m.alcoholicCount >= threshold
	}

	const uniqueDrinksMatch = achievementType.match(/^(MENU_EXPLORER|UNIQUE_DRINKS)_(\d+)$/)
	if (uniqueDrinksMatch) {
		const threshold = Number(uniqueDrinksMatch[2])
		return (m) => m.uniqueDrinkCount >= threshold
	}

	const categoryCountMatch = achievementType.match(/^CATEGORY_COUNT_([A-Za-z0-9_-]+)_(\d+)$/)
	if (categoryCountMatch) {
		const category = categoryCountMatch[1]
		const threshold = Number(categoryCountMatch[2])
		return (m) => (m.categoryCounts[category] ?? 0) >= threshold
	}

	// Default: never matches (unknown type)
	return () => false
}

export async function awardDrinkAchievementsForGuest(
	supabaseClient: SupabaseClientLike,
	guestId: string,
	nowIso: string
): Promise<void> {
	// Fetch only templates active in the current window
	const { data: templates } = await supabaseClient
		.from('achievement_templates')
		.select('id, achievement_type, from_time, to_time')
		.lte('from_time', nowIso)
		.gte('to_time', nowIso)

	if (!templates || templates.length === 0) return

	// Load orders joined with drink attributes once
	const { data: orders } = await supabaseClient
		.from('drink_orders')
		.select('quantity, drink_menu_id, drink_menu!inner(alcohol_percentage, category)')
		.eq('guest_id', guestId)
		.eq('status', 'logged')

	const safeOrders = orders ?? []
	const totalCount = safeOrders.reduce((sum: number, r: any) => sum + (r.quantity ?? 0), 0)
	const alcoholicCount = safeOrders
		.filter((r: any) => (r.drink_menu?.alcohol_percentage ?? 0) > 0)
		.reduce((sum: number, r: any) => sum + (r.quantity ?? 0), 0)
	const uniqueDrinkCount = new Set(safeOrders.map((r: any) => r.drink_menu_id)).size
	const categoryCounts: Record<string, number> = {}
	for (const r of safeOrders) {
		const category = r.drink_menu?.category
		if (!category) continue
		categoryCounts[category] = (categoryCounts[category] ?? 0) + (r.quantity ?? 0)
	}

	const metrics = { totalCount, alcoholicCount, uniqueDrinkCount, categoryCounts }

	for (const t of templates) {
		const matches = parseRule(t.achievement_type)(metrics)
		if (!matches) continue
		const { data: existing } = await supabaseClient
			.from('guest_achievements')
			.select('id')
			.eq('guest_id', guestId)
			.eq('achievement_template_id', t.id)
			.single()
		if (!existing) {
			await supabaseClient
				.from('guest_achievements')
				.insert({ guest_id: guestId, achievement_template_id: t.id, unlocked_at: nowIso })
		}
	}
}


