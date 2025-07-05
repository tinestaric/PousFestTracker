import Link from 'next/link'
import { Wine, Trophy, Calendar, BookOpen, User, Smartphone } from 'lucide-react'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Matching Facebook Banner */}
      <div className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Dreamy Blue Gradient Background - matching the banner */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-300">
          {/* Overlay texture for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-white/10"></div>
          {/* Soft cloud-like patterns */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-blue-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 py-20 text-center relative z-10 text-white">
          {/* Logo */}
          <div className="mb-10">
            <div className="w-28 h-28 mx-auto mb-8 relative">
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
          <div className="mb-10">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-wide">
              POUSFEST
            </h1>
            
            {/* Date and Location - matching banner style */}
            <div className="text-xl md:text-2xl font-light mb-8 tracking-widest opacity-95">
              19.7.2025 · DOBRUNJE
            </div>
            
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-light italic opacity-90 mb-6">
                The next chapter
              </h2>
              <div className="w-24 h-0.5 bg-white/50 mx-auto"></div>
            </div>
          </div>
          
          <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Prepare for an unforgettable experience where freedom, music, and friendship unite in one single day. We draw inspiration from the hummingbird – a symbol of lightness, living in the moment, and pure joy. Take your time, breathe, and dance.
          </p>
          
          {/* CTA Button */}
          <div>
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
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            What would you like to do?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose your adventure and make the most of Pousfest 2025
          </p>
        </div>
        
        {/* Main Navigation Cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-20">
          {/* Dashboard */}
          <Link href="/guest?tag_uid=demo" className="group">
            <div className="card hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 text-center h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">My Dashboard</h3>
              <p className="text-gray-600">
                View your achievements, order drinks, and track your party progress
              </p>
            </div>
          </Link>

          {/* Recipes */}
          <Link href="/recipes" className="group">
            <div className="card hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-200 text-center h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Cocktail Recipes</h3>
              <p className="text-gray-600">
                Learn to make amazing cocktails with step-by-step video tutorials
              </p>
            </div>
          </Link>

          {/* Schedule */}
          <Link href="/timetable" className="group">
            <div className="card hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200 text-center h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Event Schedule</h3>
              <p className="text-gray-600">
                Check the event timeline and never miss achievement opportunities
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Features - Simplified */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-semibold text-gray-800 mb-12">
            Experience the next chapter of party technology
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Achievement System</h4>
              <p className="text-gray-600">Unlock badges throughout the event</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Wine className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Easy Ordering</h4>
              <p className="text-gray-600">Order drinks with one tap</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">NFC Ready</h4>
              <p className="text-gray-600">Just tap your tag to start</p>
            </div>
          </div>
        </div>

        {/* Getting Started - Simplified */}
        <div className="max-w-2xl mx-auto text-center p-8 bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50 rounded-2xl border border-blue-200">
          <h4 className="text-xl font-semibold text-gray-800 mb-3">
            Ready to Begin Your Chapter?
          </h4>
          <p className="text-gray-600">
            Simply tap your NFC tag on your phone to access your personal dashboard and start your Pousfest 2025 journey!
          </p>
        </div>
      </div>
    </div>
  )
} 