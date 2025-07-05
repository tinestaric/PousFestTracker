import Link from 'next/link'
import { Wine, Trophy, Calendar, BookOpen, User, Smartphone } from 'lucide-react'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Matching Facebook Banner */}
      <div className="relative overflow-hidden min-h-[80vh] flex items-center">
        {/* Dreamy Blue Gradient Background - matching the banner */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-300">
          {/* Overlay texture for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-white/10"></div>
          {/* Soft cloud-like patterns */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-blue-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 py-16 text-center relative z-10 text-white">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <Image 
                src="/Logo.png" 
                alt="Pousfest 2025 Logo" 
                fill
                className="object-contain drop-shadow-2xl filter brightness-0 invert"
                priority
              />
            </div>
          </div>
          
          {/* Event Title - Matching banner typography */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-wide">
              POUSFEST
            </h1>
            
            {/* Date and Location - matching banner style */}
            <div className="text-xl md:text-2xl font-light mb-6 tracking-widest">
              19.7.2025 · DOBRUNJE
            </div>
            
            <div className="relative mb-8">
              <h2 className="text-2xl md:text-3xl font-light italic opacity-90">
                The next chapter
              </h2>
              <div className="w-32 h-0.5 bg-white/50 mx-auto mt-4"></div>
            </div>
          </div>
          
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Your ultimate party companion for tracking achievements, ordering drinks, learning recipes, and creating unforgettable memories!
          </p>
          
          {/* CTA Button */}
          <div className="mt-8">
            <Link 
              href="/guest?tag_uid=demo" 
              className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/30"
            >
              <User className="w-5 h-5 mr-2" />
              Start Your Journey
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            What would you like to do?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose your adventure and make the most of Pousfest 2025
          </p>
        </div>
        
        {/* Main Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Dashboard */}
          <Link href="/guest?tag_uid=demo" className="card hover:shadow-xl transition-all duration-200 group border-2 border-transparent hover:border-blue-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">My Dashboard</h3>
              <p className="text-gray-600 text-sm">
                View your achievements, order drinks, and track your party progress
              </p>
            </div>
          </Link>

          {/* Recipes */}
          <Link href="/recipes" className="card hover:shadow-xl transition-all duration-200 group border-2 border-transparent hover:border-orange-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Cocktail Recipes</h3>
              <p className="text-gray-600 text-sm">
                Learn to make amazing cocktails with step-by-step video tutorials
              </p>
            </div>
          </Link>

          {/* Schedule */}
          <Link href="/timetable" className="card hover:shadow-xl transition-all duration-200 group border-2 border-transparent hover:border-green-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
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
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Why Pousfest 2025?
          </h3>
          <p className="text-gray-600 mb-8">Experience the next chapter of party technology</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
              <Trophy className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-gray-800">Achievement System</h4>
                <p className="text-sm text-gray-600">Unlock badges throughout the event</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
              <Wine className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-gray-800">Easy Ordering</h4>
                <p className="text-sm text-gray-600">Order drinks with one tap</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
              <Smartphone className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-gray-800">NFC Ready</h4>
                <p className="text-sm text-gray-600">Just tap your tag to start</p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-2 text-center">
            🏷️ Ready to Begin Your Chapter?
          </h4>
          <p className="text-gray-600 text-center">
            Simply tap your NFC tag on your phone to access your personal dashboard and start your Pousfest 2025 journey!
          </p>
        </div>
      </div>
    </div>
  )
} 