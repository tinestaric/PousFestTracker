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

export async function buildAchievementsViewForGuest(
	supabaseClient: SupabaseClientLike,
	guestId: string,
	nowIso: string,
	partyTimezone?: string
) {
	// Load templates and guest state
	const [{ data: templates }, { data: guestAchievements }, { data: orders }] = await Promise.all([
		supabaseClient
			.from('achievement_templates')
			.select('id, achievement_type, title, description, logo_url, from_time, to_time')
			.order('from_time', { ascending: true }),
		supabaseClient
			.from('guest_achievements')
			.select('id, achievement_template_id, unlocked_at')
			.eq('guest_id', guestId),
		supabaseClient
			.from('drink_orders')
			.select('quantity, drink_menu_id, drink_menu!inner(alcohol_percentage, category)')
			.eq('guest_id', guestId)
			.eq('status', 'logged')
	])

	const safeTemplates = templates ?? []
	const safeGuestAchievements = guestAchievements ?? []
	const safeOrders = orders ?? []

	// Metrics
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

	// Helper to extract target for progress based on type
	function getTargetForType(achievementType: string): { current: number; target: number } | null {
		let m
		if ((m = achievementType.match(/^TOTAL_COUNT_(\d+)$/))) return { current: totalCount, target: Number(m[1]) }
		if ((m = achievementType.match(/^ALCOHOLIC_COUNT_(\d+)$/))) return { current: alcoholicCount, target: Number(m[1]) }
		if ((m = achievementType.match(/^(MENU_EXPLORER|UNIQUE_DRINKS)_(\d+)$/))) return { current: uniqueDrinkCount, target: Number(m[2]) }
		if ((m = achievementType.match(/^CATEGORY_COUNT_([A-Za-z0-9_-]+)_(\d+)$/))) {
			const slug = m[1]; const target = Number(m[2]);
			return { current: categoryCounts[slug] ?? 0, target }
		}
		// Back-compat aliases: treat as patterns if present
		if (achievementType === 'FIRST_SIP') return { current: totalCount, target: 1 }
		if (achievementType === 'TRIPLE_THREAT') return { current: alcoholicCount, target: 3 }
		return null
	}

	// Normalize now according to party timezone if provided
	const nowDate = new Date(nowIso)
	const now = nowDate.toISOString()
	const earnedSet = new Set(safeGuestAchievements.map((ga: any) => ga.achievement_template_id))

	const earned = [] as any[]
	const inProgress = [] as any[]
	const upcoming = [] as any[]

	for (const t of safeTemplates) {
		const unlocked = safeGuestAchievements.find((ga: any) => ga.achievement_template_id === t.id)
		if (unlocked) {
			earned.push({
				id: t.id,
				type: t.achievement_type,
				title: t.title,
				description: t.description,
				emoji: t.logo_url,
				unlocked_at: unlocked.unlocked_at
			})
			continue
		}

		// Not earned: compute progress and bucket
		const progress = getTargetForType(t.achievement_type)
		const startsAt = t.from_time
		const endsAt = t.to_time
		const isBefore = startsAt && now < new Date(startsAt).toISOString()
		const isAfter = endsAt && now > new Date(endsAt).toISOString()

		if (isBefore) {
			upcoming.push({ id: t.id, type: t.achievement_type, title: t.title, description: t.description, emoji: t.logo_url, starts_at: startsAt, expired: false })
			continue
		}
		if (progress && progress.current > 0 && !isAfter) {
			inProgress.push({ id: t.id, type: t.achievement_type, title: t.title, description: t.description, emoji: t.logo_url, progress: { current: Math.min(progress.current, progress.target), target: progress.target } })
			continue
		}
		// If no progress or expired, include in upcoming and mark expired when past window
		upcoming.push({ id: t.id, type: t.achievement_type, title: t.title, description: t.description, emoji: t.logo_url, starts_at: startsAt || null, expired: !!isAfter })
	}

	// Recent = latest 3 earned
	const recent = earned
		.slice()
		.sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
		.slice(0, 3)

	return {
		summary: { earned: earned.length, total: safeTemplates.length },
		recent,
		earned: earned.sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime()),
		inProgress: inProgress.sort((a, b) => (b.progress.current / b.progress.target) - (a.progress.current / a.progress.target)),
		upcoming
	}
}


