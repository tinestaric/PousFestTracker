import Link from 'next/link'
import { PartyPopper, Users, Trophy, Wine } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <PartyPopper className="w-20 h-20 text-primary-600 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            PousFest Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track your achievements, drinks, and memories at the ultimate party!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="card text-center">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Achievements</h3>
            <p className="text-gray-600">
              Unlock special badges by participating in different activities
            </p>
          </div>
          
          <div className="card text-center">
            <Wine className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Drink Tracking</h3>
            <p className="text-gray-600">
              Log your drinks and see what everyone else is enjoying
            </p>
          </div>
          
          <div className="card text-center">
            <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Social Stats</h3>
            <p className="text-gray-600">
              Compare your progress with other party-goers
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
            <p className="text-gray-600 mb-6">
              Tap your NFC tag to access your personal dashboard, or browse the event info
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/guest?tag_uid=demo" className="btn-primary">
              Demo Guest Dashboard
            </Link>
            <Link href="/timetable" className="btn-outline">
              View Event Schedule
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            🎉 Have your NFC tag ready? Just tap it to get started! 🎉
          </p>
        </div>
      </div>
    </div>
  )
} 