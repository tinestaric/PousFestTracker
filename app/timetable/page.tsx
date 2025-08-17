'use client'

import Link from 'next/link'
import { Calendar, Clock, MapPin, Trophy, Home } from 'lucide-react'
import timetableData from '@/public/timetable.json'
import { getEventConfig, getInterpolatedText, getText } from '@/lib/eventConfig'
import { useState } from 'react'

interface EventItem {
  time: string
  title: string
  description: string
  location: string
  achievement?: string | null
}

interface DayData {
  date: string
  caption: string
  events: EventItem[]
}

interface TimetableData {
  [key: string]: DayData
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
  road_tripper: '🚗',
  first_arrival: '🏞️',
  fire_starter: '🔥',
  early_bird: '🐦',
  welcome_committee: '🎉',
  quiz_master: '🧠',
  free_spirit: '🎵',
  well_fed: '🍽️',
  nature_walker: '🌿',
  water_warrior: '🏊‍♂️',
  snack_master: '🍿',
  dance_legend: '🕺',
  zen_master: '☕',
  brunch_lover: '🥐',
  memory_keeper: '📸',
  farewell_master: '🚗',
}

export default function Timetable() {
  const config = getEventConfig()
  const timetable = timetableData as TimetableData
  
  // Get all day keys and sort them
  const dayKeys = Object.keys(timetable).sort((a, b) => {
    const dayNumA = parseInt(a.replace('day', ''))
    const dayNumB = parseInt(b.replace('day', ''))
    return dayNumA - dayNumB
  })
  
  // Find today's day or default to day1
  const getTodaysDay = () => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    
    for (const dayKey of dayKeys) {
      if (timetable[dayKey].date === today) {
        return dayKey
      }
    }
    
    return dayKeys[0] // Default to first day if today doesn't match any day
  }
  
  const [selectedDay, setSelectedDay] = useState(getTodaysDay())
  const selectedDayData = timetable[selectedDay]
  // Achievement opportunities section removed; dedicated achievements screen covers this UX now
  
  // Get day number for display
  const getDayNumber = (dayKey: string) => {
    return parseInt(dayKey.replace('day', ''))
  }
  
  // Check if a day is today
  const isDayToday = (dayKey: string) => {
    const today = new Date().toISOString().split('T')[0]
    return timetable[dayKey].date === today
  }
  
  // Get gradient colors for different days
  const getDayGradient = (dayKey: string) => {
    const dayNum = getDayNumber(dayKey)
    const gradients = [
      'from-blue-600 to-cyan-500',
      'from-purple-600 to-pink-500', 
      'from-green-600 to-emerald-500',
      'from-orange-600 to-red-500',
      'from-indigo-600 to-purple-500',
      'from-teal-600 to-cyan-500',
      'from-rose-600 to-pink-500',
      'from-amber-600 to-orange-500'
    ]
    return gradients[(dayNum - 1) % gradients.length]
  }

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

          {/* Day Selector Tabs */}
          <div className="mb-8">
            {/* Desktop: Centered flex-wrap layout */}
            <div className="hidden md:flex flex-wrap gap-2 justify-center mb-4">
              {dayKeys.map((dayKey) => {
                const dayNum = getDayNumber(dayKey)
                const isSelected = selectedDay === dayKey
                const isToday = isDayToday(dayKey)
                return (
                  <button
                    key={dayKey}
                    onClick={() => setSelectedDay(dayKey)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 relative ${
                      isSelected
                        ? 'bg-white text-gray-800 shadow-lg scale-105'
                        : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:scale-105'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    {getText('time.day', config)} {dayNum}
                    {isToday && (
                      <span className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                        {getText('time.today', config)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Mobile: Horizontal scrollable layout */}
            <div className="md:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 -mx-4 pb-2">
                {dayKeys.map((dayKey) => {
                  const dayNum = getDayNumber(dayKey)
                  const isSelected = selectedDay === dayKey
                  const isToday = isDayToday(dayKey)
                  return (
                    <button
                      key={dayKey}
                      onClick={() => setSelectedDay(dayKey)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 relative flex-shrink-0 ${
                        isSelected
                          ? 'bg-white text-gray-800 shadow-lg scale-105'
                          : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:scale-105'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      {getText('time.day', config)} {dayNum}
                      {isToday && (
                        <span className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                          {getText('time.today', config)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Selected Day Content */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 bg-gradient-to-r ${getDayGradient(selectedDay)} rounded-xl shadow-lg`}>
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">{selectedDayData.caption}</h2>
            </div>
            
            <div className="space-y-6">
              {selectedDayData.events.map((event, index) => (
                <div key={index} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-40 flex-shrink-0">
                      <div className={`flex items-center gap-2 text-white font-bold text-lg bg-gradient-to-r ${getDayGradient(selectedDay)} px-4 py-2 rounded-xl shadow-lg`}>
                        <Clock className="w-5 h-5" />
                        {event.time}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                          {event.title}
                        </h3>
                        {/* Achievement chip removed per new dedicated achievements page */}
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

          {/* Program note */}
          <div className="mb-12">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
              <p className="text-white/90 text-center text-lg italic">
                {getText('timetable.programNote', config)}
              </p>
            </div>
          </div>

          {/* Achievement opportunities removed */}
        </div>
      </div>
    </div>
  )
}