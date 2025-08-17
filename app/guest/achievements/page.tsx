'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { Sparkles, Trophy, ArrowLeft } from 'lucide-react'
import { getEventConfig, getText, formatInEventTimezone } from '@/lib/eventConfig'
import { getStoredTagUid } from '@/lib/hooks/useTagUid'

interface AchievementsView {
	summary: { earned: number; total: number }
	recent: Array<{ id: string; title: string; description: string; emoji: string; unlocked_at: string }>
	earned: Array<{ id: string; title: string; description: string; emoji: string; unlocked_at: string }>
	inProgress: Array<{ id: string; title: string; description: string; emoji: string; progress: { current: number; target: number } }>
	upcoming: Array<{ id: string; title: string; description: string; emoji: string; starts_at?: string | null; expired?: boolean }>
}

function ProgressBar({ current, target }: { current: number; target: number }) {
	const pct = Math.min(100, Math.round((current / Math.max(1, target)) * 100))
	return (
		<div className="w-full h-2 rounded-full overflow-hidden bg-[rgba(255,255,255,0.25)]">
			<div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${pct}%` }} />
		</div>
	)
}

function AchievementsContent() {
	const config = getEventConfig()
	const [data, setData] = useState<AchievementsView | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const tagUid = getStoredTagUid()
		if (!tagUid) { setLoading(false); return }
		fetch(`/api/getDashboardData?tag_uid=${tagUid}`).then(async (r) => {
			if (!r.ok) throw new Error('failed')
			const json = await r.json()
			setData(json.achievements_view || null)
		}).catch(() => {}).finally(() => setLoading(false))
	}, [])

	if (loading) {
		return (
			<div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} p-4 sm:p-6 lg:p-8`}>
				<div className="max-w-3xl mx-auto flex items-center justify-center min-h-[60vh]">
					<div className="text-center text-white">
						<Trophy className="w-12 h-12 mx-auto mb-4 animate-spin" />
						<p className="text-lg">{getText('guest.achievementsPage.loading', config)}</p>
					</div>
				</div>
			</div>
		)
	}
	
	return (
		<div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} p-4 sm:p-6 lg:p-8`}>
			<div className="max-w-3xl mx-auto space-y-6">
				<div className="flex items-center gap-4 mb-4">
					<Link href="/guest" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 p-3 rounded-xl transition-all duration-300">
						<ArrowLeft className="w-5 h-5" />
					</Link>
					<div className="flex-1">
						<h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{getText('guest.achievementsPage.title', config)}</h1>
						<p className="text-white/80 text-sm sm:text-base">{data ? getText('guest.achievementsPage.subtitle', config).replace('{earned}', String(data.summary.earned)).replace('{total}', String(data.summary.total)) : getText('guest.achievementsPage.subtitle', config).replace('{earned}', '0').replace('{total}', '0')}</p>
					</div>
				</div>
				
				{!data ? (
					<div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl shadow-xl text-center py-12 px-6">
						<Trophy className="w-16 h-16 text-white/60 mx-auto mb-4" />
						<h3 className="text-xl font-semibold text-white mb-2">{getText('guest.achievementsPage.emptyTitle', config)}</h3>
						<p className="text-white/80">{getText('guest.achievementsPage.emptyMessage', config)}</p>
					</div>
				) : data.earned.length + data.inProgress.length + data.upcoming.length === 0 ? (
					<div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl shadow-xl text-center py-12 px-6">
						<Trophy className="w-16 h-16 text-white/60 mx-auto mb-4" />
						<h3 className="text-xl font-semibold text-white mb-2">{getText('guest.achievementsPage.emptyTitle', config)}</h3>
						<p className="text-white/80">{getText('guest.achievementsPage.emptyMessage', config)}</p>
					</div>
				) : (
					<div className="space-y-8">
						{/* Earned */}
						<div>
							<h2 className="text-xl font-semibold text-white mb-3">{getText('guest.achievementsPage.sections.unlocked', config)}</h2>
							{data.earned.length === 0 ? (
								<p className="text-white/70 text-sm">{getText('guest.achievements.noAchievements', config)}</p>
							) : (
								<div className="grid grid-cols-2 gap-3">
									{data.earned.map(a => (
										<div key={a.id} className="bg-white/20 border border-white/30 rounded-xl p-3">
											<div className="flex items-start gap-2">
												<div className="w-10 h-10 rounded-lg bg-orange-500/70 flex items-center justify-center"><span className="text-xl">{a.emoji}</span></div>
												<div className="overflow-hidden">
													<div className="text-white font-semibold truncate">{a.title}</div>
													<div className="text-white/80 text-xs line-clamp-2">{a.description}</div>
													<div className="text-white/70 text-xs">{formatInEventTimezone(a.unlocked_at, config)}</div>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* In progress */}
						<div>
							<h2 className="text-xl font-semibold text-white mb-3">{getText('guest.achievementsPage.sections.inProgress', config)}</h2>
							{data.inProgress.length === 0 ? (
								<p className="text-white/70 text-sm">{getText('guest.achievements.noAchievements', config)}</p>
							) : (
								<div className="grid grid-cols-2 gap-3">
									{data.inProgress.map(a => (
										<div key={a.id} className="bg-white/10 border border-white/20 rounded-xl p-3">
											<div className="flex items-start gap-2 mb-2">
												<div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center"><span className="text-xl">{a.emoji}</span></div>
												<div className="overflow-hidden">
													<div className="text-white font-semibold truncate">{a.title}</div>
													<div className="text-white/80 text-xs line-clamp-2">{a.description}</div>
												</div>
											</div>
											<div className="text-white/80 text-xs mb-1">{a.progress.current}/{a.progress.target}</div>
											<ProgressBar current={a.progress.current} target={a.progress.target} />
										</div>
									))}
								</div>
							)}
						</div>

						{/* Upcoming */}
						<div>
							<h2 className="text-xl font-semibold text-white mb-3">{getText('guest.achievementsPage.sections.upcoming', config)}</h2>
							{data.upcoming.length === 0 ? (
								<p className="text-white/70 text-sm">{getText('guest.achievements.noAchievements', config)}</p>
							) : (
								<div className="grid grid-cols-2 gap-3">
									{data.upcoming.map(a => (
										<div key={a.id} className={`border rounded-xl p-3 ${a.expired ? 'bg-white/5 border-white/5 opacity-50' : 'bg-white/5 border-white/10 opacity-80'}`}>
											<div className="flex items-start gap-2">
												<div className={`w-10 h-10 rounded-lg ${a.expired ? 'bg-white/5' : 'bg-white/10'} flex items-center justify-center`}><span className="text-xl">{a.emoji}</span></div>
												<div className="overflow-hidden">
													<div className="text-white font-semibold truncate">{a.title}</div>
													<div className="text-white/80 text-xs line-clamp-2">{a.description}</div>
												</div>
											</div>
											{a.starts_at && !a.expired && <div className="text-white/60 text-xs mt-1">{getText('guest.achievementsPage.starts', config).replace('{date}', formatInEventTimezone(a.starts_at, config))}</div>}
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default function Page() {
	return <AchievementsContent />
}


