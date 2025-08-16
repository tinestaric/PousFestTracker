export function getAdminHeaders(): Record<string, string> {
	if (typeof window === 'undefined') return {}
	try {
		const pwd = localStorage.getItem('admin_password')
		return pwd ? { 'x-admin-password': pwd } : {}
	} catch {
		return {}
	}
}


