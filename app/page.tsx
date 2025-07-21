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
        
        <div className="max-w-4xl mx-auto px-4 py-20 text-center relative z-10 text-white">
          {/* Logo */}
          <div className="mb-10">
            <div className="w-28 h-28 mx-auto mb-8 relative">
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
          <div className="mb-10">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-wide">
              {config.event.fullTitle}
            </h1>
            
            {/* Date and Location - matching banner style */}
            <div className="text-xl md:text-2xl font-light mb-8 tracking-widest opacity-95">
              {config.event.date} · {config.event.location}
            </div>
            
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-light italic opacity-90 mb-6">
                {config.event.tagline}
              </h2>
              <div className="w-24 h-0.5 bg-white/50 mx-auto"></div>
            </div>
          </div>
          
          <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
            {config.event.description}
          </p>
          
          {/* CTA Button */}
          <div>
            <Link 
              href="/guest" 
              className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/30"
            >
              <User className="w-5 h-5 mr-2" />
              {getText('buttons.startAdventure', config)}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {getText('navigation.whatWouldYouLike', config)}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {getInterpolatedText('home.subtitle', config)}
          </p>
        </div>
        
        {/* Dynamic Navigation Cards */}
        <div className={`grid gap-8 mb-20 ${
          navigationCards.length === 4 
            ? 'md:grid-cols-4' 
            : navigationCards.length === 3 
            ? 'md:grid-cols-3' 
            : navigationCards.length === 2 
            ? 'md:grid-cols-2 max-w-2xl mx-auto' 
            : 'md:grid-cols-1 max-w-md mx-auto'
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
        <div className="text-center mb-16">
          <h3 className="text-2xl font-semibold text-gray-800 mb-12">
            {getText('home.quickFeatures', config)}
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">{getText('features.achievementSystem', config)}</h4>
              <p className="text-gray-600">{getText('features.achievementDescription', config)}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Wine className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">{getText('features.easyOrdering', config)}</h4>
              <p className="text-gray-600">{getText('features.easyOrderingDescription', config)}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">{getText('features.nfcReady', config)}</h4>
              <p className="text-gray-600">{getText('features.nfcDescription', config)}</p>
            </div>
          </div>
        </div>

        {/* Getting Started - Simplified */}
        <div className="max-w-2xl mx-auto text-center p-8 bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50 rounded-2xl border border-blue-200">
          <h4 className="text-xl font-semibold text-gray-800 mb-3">
            {getText('home.readyToStart', config)}
          </h4>
          <p className="text-gray-600">
            {getInterpolatedText('home.footerCta', config)}
          </p>
        </div>
      </div>
    </div>
  )
} 