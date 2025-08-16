import { getAdminHeaders } from '@/lib/admin/headers'
async function api<T>(path: string, init?: RequestInit): Promise<T> {
	const doFetch = async (): Promise<Response> => fetch(path, {
		...(init || {}),
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers || {}),
			...getAdminHeaders(),
		},
	})
	let res = await doFetch()
	if (res.status === 401 && typeof window !== 'undefined') {
		const pwd = window.prompt('Enter admin password:')
		if (pwd) {
			try { localStorage.setItem('admin_password', pwd) } catch {}
			res = await doFetch()
		}
	}
	if (!res.ok) {
		const text = await res.text()
		throw new Error(text || 'Admin API error')
	}
	return res.json()
}

export async function fetchAllAdminData() {
	const data = await api<any>('/api/admin/getAll')
	return {
		guestsData: { data: data.guests, error: null },
		achievementsData: { data: data.achievements, error: null },
		drinksData: { data: data.drinks, error: null },
		recipesData: { data: data.recipes, error: null },
		drinkOrdersData: { data: data.drinkOrders, error: null },
		guestAchievementsData: { data: data.guestAchievements, error: null },
		foodMenuData: { data: data.foodMenu, error: null },
		foodOrdersData: { data: data.foodOrders, error: null },
		deviceConfigsData: { data: data.deviceConfigs, error: null },
	}
}

export async function adminSave(type: 'guest' | 'achievement' | 'drink' | 'recipe' | 'food' | 'device', id: string | null, data: any) {
	return api('/api/admin/save', {
		method: 'POST',
		body: JSON.stringify({ type, id, data }),
	})
}

export async function adminDelete(type: 'guest' | 'achievement' | 'drink' | 'recipe' | 'food' | 'device', id: string) {
	return api('/api/admin/delete', {
		method: 'POST',
		body: JSON.stringify({ type, id }),
	})
}


