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
            Pripravi se na nepozabno izkušnjo, kjer se svoboda, glasba in prijateljstvo združijo v enem samem dnevu. Navdihujemo se pri kolibriju – simbolu lahkotnosti, življenja v trenutku in čiste radosti. Vzemi si čas, zadihaj in pleši.
          </p>
          
          {/* CTA Button */}
          <div>
            <Link 
              href="/guest" 
              className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/30"
            >
              <User className="w-5 h-5 mr-2" />
              Začni svojo pustolovščino
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Kaj bi rad naredil?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Izberi svojo pustolovščino in izkoristi Pousfest 2025 na največ!
          </p>
        </div>
        
        {/* Main Navigation Cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-20">
          {/* Dashboard */}
          <Link href="/guest" className="group">
            <div className="card hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 text-center h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Moj profil</h3>
              <p className="text-gray-600">
                Poglej svoje dosežke, naroči pijačo in spremljaj svoj napredek zabave!
              </p>
            </div>
          </Link>

          {/* Recipes */}
          <Link href="/recipes" className="group">
            <div className="card hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-200 text-center h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Koktajl recepti</h3>
              <p className="text-gray-600">
                Nauči se delati neverjetne koktajle s korak-za-korakom video tutoriali
              </p>
            </div>
          </Link>

          {/* Schedule */}
          <Link href="/timetable" className="group">
            <div className="card hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200 text-center h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Časovnica</h3>
              <p className="text-gray-600">
                Preveri časovnico dogodka in nikoli ne zamudi priložnosti za dosežke
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Features - Simplified */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-semibold text-gray-800 mb-12">
            Doživite novo poglavje zabavne tehnologije
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Sistem dosežkov</h4>
              <p className="text-gray-600">Odkleni značke tekom dogodka</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Wine className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Enostavno naročanje</h4>
              <p className="text-gray-600">Naroči pijače z enim dotikom</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">NFC pripravljen</h4>
              <p className="text-gray-600">Samo tapni svojo označbo za začetek</p>
            </div>
          </div>
        </div>

        {/* Getting Started - Simplified */}
        <div className="max-w-2xl mx-auto text-center p-8 bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50 rounded-2xl border border-blue-200">
          <h4 className="text-xl font-semibold text-gray-800 mb-3">
            Pripravljen začeti svoje poglavje?
          </h4>
          <p className="text-gray-600">
            Preprosto tapni svojo NFC označbo na telefon za dostop do osebne nadzorne plošče in začni svoje Pousfest 2025 potovanje!
          </p>
        </div>
      </div>
    </div>
  )
} 