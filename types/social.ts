export interface SocialHighlight {
	type: 'partyLeader' | 'hydrationCheck' | 'trending' | 'alcoholConsumption' | 'userRank'
	title: string
	description: string
	data?: any
}

export interface LeaderboardEntry {
	name: string
	drinks: number
	rank: number
}

export interface TrendingDrink {
	name: string
	count: number
	category: string
}

export interface ActivityItem {
	guestName: string
	drinkName: string
	timestamp: string
}

export interface SocialData {
	highlights: SocialHighlight[]
	leaderboards: {
		hourly: LeaderboardEntry[]
		allTime: LeaderboardEntry[]
	}
	trending: TrendingDrink[]
	activity: ActivityItem[]
	userStats: {
		rank: number
		totalDrinks: number
		timeSinceWater: string | null
		alcoholConsumption: {
			totalAlcoholMl: number
			standardDrinks: number
			estimatedBAC: number
			lastHourAlcohol: number
		}
	}
}


