import Link from 'next/link'
import { Calendar, Clock, MapPin, Trophy, Home } from 'lucide-react'
import timetableData from '@/public/timetable.json'
import { getEventConfig, getInterpolatedText, getText } from '@/lib/eventConfig'

interface EventItem {
  time: string
  title: string
  description: string
  location: string
  achievement?: string | null
}

interface DayData {
  caption: string
  events: EventItem[]
}

interface TimetableData {
  day1: DayData
  day2: DayData
}

const achievementIcons = {
  early_arrival: '🐦',
  pool_party: '🏊',
  night_owl: '🦉',
  morning_after: '☀️',
  social_butterfly: '🦋',
  party_animal: '🎉',
  morning_fuel: '☀️',
  beer_pong_champion: '🏆',
  food_explorer: '🍽️',
  evening_snacker: '🥨',
  ceremony_witness: '🎭',
  music_marathon: '🎵',
  camp_survivor: '🏕️',
}

export default function Timetable() {
  const config = getEventConfig()
  const timetable = timetableData as TimetableData
  const achievementsEnabled = config.features.achievements

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} relative overflow-hidden`}>
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-white/5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>

      <div className="relative z-10 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {getText('navigation.timetable', config)}
              </h1>
              <p className="text-white/90 text-lg">
                {getInterpolatedText('timetable.subtitle', config)}
              </p>
            </div>
            <Link href="/" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2 shadow-lg">
              <Home className="w-4 h-4" />
              {getText('buttons.home', config)}
            </Link>
          </div>

          {/* Day 1 */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">{timetable.day1.caption}</h2>
            </div>
            
            <div className="space-y-6">
              {timetable.day1.events.map((event, index) => (
                <div key={index} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-40 flex-shrink-0">
                      <div className="flex items-center gap-2 text-white font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 rounded-xl shadow-lg">
                        <Clock className="w-5 h-5" />
                        {event.time}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                          {event.title}
                        </h3>
                        {achievementsEnabled && event.achievement && (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                            <Trophy className="w-4 h-4" />
                            <span className="text-lg">{achievementIcons[event.achievement as keyof typeof achievementIcons]}</span>
                            {getText('timetable.achievement', config)}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-white/90 mb-4 text-lg leading-relaxed">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-white/80">
                        <MapPin className="w-5 h-5" />
                        <span className="font-medium">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day 2 */}
          {timetable.day2 && timetable.day2.events && timetable.day2.events.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">{timetable.day2.caption}</h2>
              </div>
              
              <div className="space-y-6">
                {timetable.day2.events.map((event, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="md:w-40 flex-shrink-0">
                        <div className="flex items-center gap-2 text-white font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 rounded-xl shadow-lg">
                          <Clock className="w-5 h-5" />
                          {event.time}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                            {event.title}
                          </h3>
                          {achievementsEnabled && event.achievement && (
                            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                              <Trophy className="w-4 h-4" />
                              <span className="text-lg">{achievementIcons[event.achievement as keyof typeof achievementIcons]}</span>
                              {getText('timetable.achievement', config)}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-white/90 mb-4 text-lg leading-relaxed">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-white/80">
                          <MapPin className="w-5 h-5" />
                          <span className="font-medium">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Program note */}
          <div className="mb-12">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
              <p className="text-white/90 text-center text-lg italic">
                {getText('timetable.programNote', config)}
              </p>
            </div>
          </div>

          {/* Achievement Legend */}
          {achievementsEnabled && (
            <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-300/30 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl shadow-lg">
                  <Trophy className="w-8 h-8 text-yellow-900" />
                </div>
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                  {getText('timetable.achievementOpportunities', config)}
                </h3>
              </div>
              <p className="text-white/90 mb-6 text-lg leading-relaxed">
                {getText('timetable.achievementOpportunitiesMessage', config)}
              </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                <span className="text-3xl">🐦</span>
                <div>
                  <span className="font-bold text-white text-lg">{getText('timetable.achievements.earlyBird', config)}</span>
                  <p className="text-white/80">{getText('timetable.achievements.earlyBirdDesc', config)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                <span className="text-3xl">🏊</span>
                <div>
                  <span className="font-bold text-white text-lg">{getText('timetable.achievements.poolChampion', config)}</span>
                  <p className="text-white/80">{getText('timetable.achievements.poolChampionDesc', config)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                <span className="text-3xl">🎉</span>
                <div>
                  <span className="font-bold text-white text-lg">{getText('timetable.achievements.partyAnimal', config)}</span>
                  <p className="text-white/80">{getText('timetable.achievements.partyAnimalDesc', config)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                <span className="text-3xl">🦉</span>
                <div>
                  <span className="font-bold text-white text-lg">{getText('timetable.achievements.nightOwl', config)}</span>
                  <p className="text-white/80">{getText('timetable.achievements.nightOwlDesc', config)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                <span className="text-3xl">🦋</span>
                <div>
                  <span className="font-bold text-white text-lg">{getText('timetable.achievements.socialButterfly', config)}</span>
                  <p className="text-white/80">{getText('timetable.achievements.socialButterflyDesc', config)}</p>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 