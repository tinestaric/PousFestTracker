import Link from 'next/link'
import { Wine, Trophy, Calendar, BookOpen, User, Smartphone } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to PousFest! 🎉
          </h1>
          <p className="text-lg md:text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Your ultimate party companion for tracking achievements, ordering drinks, learning recipes, and having fun!
          </p>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
          What would you like to do?
        </h2>
        
        {/* Main Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Dashboard */}
          <Link href="/guest?tag_uid=demo" className="card hover:shadow-xl transition-all duration-200 group">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">My Dashboard</h3>
              <p className="text-gray-600 text-sm">
                View your achievements, order drinks, and track your party progress
              </p>
            </div>
          </Link>

          {/* Recipes */}
          <Link href="/recipes" className="card hover:shadow-xl transition-all duration-200 group">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Cocktail Recipes</h3>
              <p className="text-gray-600 text-sm">
                Learn to make amazing cocktails with step-by-step video tutorials
              </p>
            </div>
          </Link>

          {/* Schedule */}
          <Link href="/timetable" className="card hover:shadow-xl transition-all duration-200 group">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Event Schedule</h3>
              <p className="text-gray-600 text-sm">
                Check the event timeline and never miss achievement opportunities
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Features */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Why PousFest Tracker?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-gray-800">Achievement System</h4>
                <p className="text-sm text-gray-600">Unlock badges throughout the event</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <Wine className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-gray-800">Easy Ordering</h4>
                <p className="text-sm text-gray-600">Order drinks with one tap</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Smartphone className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-gray-800">NFC Ready</h4>
                <p className="text-sm text-gray-600">Just tap your tag to start</p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-800 mb-2 text-center">
            🏷️ Getting Started
          </h4>
          <p className="text-gray-600 text-center">
            Simply tap your NFC tag on your phone to access your personal dashboard instantly!
          </p>
        </div>
      </div>
    </div>
  )
} 