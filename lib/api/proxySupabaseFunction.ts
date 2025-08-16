type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface ProxyOptions {
	method?: HttpMethod
	params?: Record<string, string | number | boolean | undefined>
	body?: any
}

export async function proxySupabaseFunction<T = unknown>(
	functionName: string,
	options: ProxyOptions = {}
): Promise<Response> {
	const method = options.method ?? 'GET'
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (!supabaseUrl || !anonKey) {
		throw new Error('Supabase environment variables are not configured')
	}

	const url = new URL(`${supabaseUrl}/functions/v1/${functionName}`)
	if (options.params) {
		for (const [key, value] of Object.entries(options.params)) {
			if (value !== undefined) url.searchParams.set(key, String(value))
		}
	}

	const response = await fetch(url.toString(), {
		method,
		headers: {
			'Authorization': `Bearer ${anonKey}`,
			'Content-Type': 'application/json',
		},
		body: method !== 'GET' ? JSON.stringify(options.body ?? {}) : undefined,
	})

	return response
}


