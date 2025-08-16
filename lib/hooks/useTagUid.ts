"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export const TAG_UID_STORAGE_KEY = 'event_tag_uid'

export function getStoredTagUid(): string | null {
	if (typeof window === 'undefined') return null
	return localStorage.getItem(TAG_UID_STORAGE_KEY)
}

export function setStoredTagUid(tagUid: string): void {
	if (typeof window === 'undefined') return
	localStorage.setItem(TAG_UID_STORAGE_KEY, tagUid)
}

interface UseTagUidOptions {
	redirectTo?: string
}

export function useTagUid(options: UseTagUidOptions = {}) {
	const { redirectTo } = options
	const router = useRouter()
	const [tagUid, setTagUid] = useState<string | null>(null)

	useEffect(() => {
		const stored = getStoredTagUid()
		if (!stored && redirectTo) {
			router.push(redirectTo)
			return
		}
		setTagUid(stored)
	}, [redirectTo, router])

	return tagUid
}


