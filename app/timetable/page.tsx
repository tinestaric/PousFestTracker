import Link from 'next/link'
import { Calendar, Clock, MapPin, Trophy, Home } from 'lucide-react'
import timetableData from '@/public/timetable.json'

interface EventItem {
  time: string
  title: string
  description: string
  location: string
  achievement?: string
}

interface TimetableData {
  day1: EventItem[]
  day2: EventItem[]
}

const achievementIcons = {
  early_arrival: '🐦',
  pool_party: '🏊',
  night_owl: '🦉',
  morning_after: '☀️',
  social_butterfly: '🦋',
  party_animal: '🎉',
}

export default function Timetable() {
  const timetable = timetableData as TimetableData

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Event Schedule
            </h1>
            <p className="text-gray-600">
              Your complete guide to PousFest activities
            </p>
          </div>
          <Link href="/" className="btn-outline">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </div>

        {/* Day 1 */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-8 h-8 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-800">Day 1</h2>
          </div>
          
          <div className="space-y-4">
            {timetable.day1.map((event, index) => (
              <div key={index} className="card">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-32 flex-shrink-0">
                    <div className="flex items-center gap-2 text-primary-600 font-semibold">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {event.title}
                      </h3>
                      {event.achievement && (
                        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                          <Trophy className="w-4 h-4" />
                          <span>{achievementIcons[event.achievement as keyof typeof achievementIcons]}</span>
                          Achievement
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Day 2 */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-8 h-8 text-secondary-600" />
            <h2 className="text-2xl font-bold text-gray-800">Day 2</h2>
          </div>
          
          <div className="space-y-4">
            {timetable.day2.map((event, index) => (
              <div key={index} className="card">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-32 flex-shrink-0">
                    <div className="flex items-center gap-2 text-secondary-600 font-semibold">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {event.title}
                      </h3>
                      {event.achievement && (
                        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                          <Trophy className="w-4 h-4" />
                          <span>{achievementIcons[event.achievement as keyof typeof achievementIcons]}</span>
                          Achievement
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Legend */}
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🏆 Achievement Opportunities
          </h3>
          <p className="text-gray-600 mb-4">
            Participate in these activities to unlock special achievements! 
            Make sure to scan your NFC tag during the event times.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐦</span>
              <div>
                <span className="font-medium">Early Bird</span>
                <p className="text-sm text-gray-600">Arrive early to the party</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏊</span>
              <div>
                <span className="font-medium">Pool Party Champion</span>
                <p className="text-sm text-gray-600">Join the pool activities</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <span className="font-medium">Party Animal</span>
                <p className="text-sm text-gray-600">Dance the night away</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🦉</span>
              <div>
                <span className="font-medium">Night Owl</span>
                <p className="text-sm text-gray-600">Stay up late</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">☀️</span>
              <div>
                <span className="font-medium">Morning Warrior</span>
                <p className="text-sm text-gray-600">Early riser for brunch</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🦋</span>
              <div>
                <span className="font-medium">Social Butterfly</span>
                <p className="text-sm text-gray-600">Mingle throughout the day</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 