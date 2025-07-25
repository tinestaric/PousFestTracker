import Link from 'next/link'
import { Wine, Trophy, Calendar, BookOpen, User, Smartphone, UtensilsCrossed } from 'lucide-react'
import Image from 'next/image'
import { getEventConfig, getEnabledNavigationCards, getText, getInterpolatedText } from '@/lib/eventConfig'

export default function Home() {
  const config = getEventConfig()
  const navigationCards = getEnabledNavigationCards(config)

  // Icon mapping
  const iconMap = {
    User,
    BookOpen,
    Calendar,
    UtensilsCrossed,
    Wine,
    Trophy,
    Smartphone
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Matching Facebook Banner */}
      <div className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Dynamic Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.ui.heroGradient}`}>
          {/* Overlay texture for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-white/10"></div>
          {/* Soft cloud-like patterns */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-blue-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16 sm:py-20 text-center relative z-10 text-white">
          {/* Logo */}
          <div className="mb-8 sm:mb-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 sm:mb-8 relative">
              <Image 
                src={config.event.logo} 
                alt={`${config.event.name} ${config.event.year} Logo`} 
                fill
                className="object-contain drop-shadow-2xl filter brightness-0 invert"
                priority
              />
            </div>
          </div>
          
          {/* Event Title - Matching banner typography */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-wide leading-tight">
              {config.event.fullTitle}
            </h1>
            
            {/* Date and Location - matching banner style */}
            <div className="text-lg sm:text-xl md:text-2xl font-light mb-6 sm:mb-8 tracking-wide sm:tracking-widest opacity-95">
              {config.event.date} · {config.event.location}
            </div>
            
            <div className="relative">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-light italic opacity-90 mb-4 sm:mb-6 px-4">
                {config.event.tagline}
              </h2>
              <div className="w-24 h-0.5 bg-white/50 mx-auto"></div>
            </div>
          </div>
          
          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed px-4">
            {config.event.description}
          </p>
          
          {/* CTA Button */}
          <div className="flex justify-center">
            <Link 
              href="/guest" 
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/30 text-sm sm:text-base"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {getText('buttons.startAdventure', config)}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 px-4">
            {getText('navigation.whatWouldYouLike', config)}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
            {getInterpolatedText('home.subtitle', config)}
          </p>
        </div>
        
        {/* Dynamic Navigation Cards */}
        <div className={`grid gap-6 sm:gap-8 mb-16 sm:mb-20 ${
          navigationCards.length === 4 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
            : navigationCards.length === 3 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : navigationCards.length === 2 
            ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' 
            : 'grid-cols-1 max-w-md mx-auto'
        }`}>
          {navigationCards.map((card) => {
            const IconComponent = iconMap[card.icon as keyof typeof iconMap]
            return (
              <Link key={card.key} href={card.href} className="group">
                <div className={`card hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-${card.borderColor} text-center h-full`}>
                  <div className={`w-20 h-20 bg-gradient-to-br ${card.gradient} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {getText(`navigation.${card.key}`, config)}
                  </h3>
                  <p className="text-gray-600">
                    {getText(`navigation.${card.key}Description`, config)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Features - Simplified */}
        <div className="text-center mb-12 sm:mb-16">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-8 sm:mb-12 px-4">
            {getText('home.quickFeatures', config)}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="text-center px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{getText('features.achievementSystem', config)}</h4>
              <p className="text-gray-600 text-sm sm:text-base">{getText('features.achievementDescription', config)}</p>
            </div>
            
            <div className="text-center px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Wine className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{getText('features.easyOrdering', config)}</h4>
              <p className="text-gray-600 text-sm sm:text-base">{getText('features.easyOrderingDescription', config)}</p>
            </div>
            
            <div className="text-center px-4 sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{getText('features.nfcReady', config)}</h4>
              <p className="text-gray-600 text-sm sm:text-base">{getText('features.nfcDescription', config)}</p>
            </div>
          </div>
        </div>

        {/* Getting Started - Simplified */}
        <div className="max-w-2xl mx-auto text-center p-6 sm:p-8 bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50 rounded-2xl border border-blue-200 mx-4">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
            {getText('home.readyToStart', config)}
          </h4>
          <p className="text-gray-600 text-sm sm:text-base">
            {getInterpolatedText('home.footerCta', config)}
          </p>
        </div>
      </div>
    </div>
  )
} 