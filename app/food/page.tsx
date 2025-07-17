'use client'

import Link from 'next/link'
import { UtensilsCrossed, Check, Loader2, Home } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { FoodMenuItem, FoodOrder } from '@/lib/supabase'

export default function FoodPage() {
  const [foodMenu, setFoodMenu] = useState<FoodMenuItem[]>([])
  const [guestFoodOrder, setGuestFoodOrder] = useState<FoodOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [orderFeedback, setOrderFeedback] = useState<{ show: boolean; message: string; success: boolean }>({ show: false, message: '', success: false })

  useEffect(() => {
    fetchFoodData()
  }, [])

  const fetchFoodData = async () => {
    try {
      const tagUid = localStorage.getItem('pous_fest_tag_uid')
      const response = await fetch(`/api/getFoodData${tagUid ? `?tag_uid=${tagUid}` : ''}`)
      if (response.ok) {
        const data = await response.json()
        setFoodMenu(data.foodMenu || [])
        setGuestFoodOrder(data.guestFoodOrder)
      }
    } catch (error) {
      console.error('Error fetching food data:', error)
    }
  }

  const orderFood = async (foodId: string) => {
    const tagUid = localStorage.getItem('pous_fest_tag_uid')
    if (!tagUid) {
      setOrderFeedback({
        show: true,
        message: 'Prosimo, skeniraj svojo NFC oznako prvo.',
        success: false
      })
      setTimeout(() => setOrderFeedback({ show: false, message: '', success: false }), 3000)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/orderFood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag_uid: tagUid,
          food_menu_id: foodId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const foodName = foodMenu.find(f => f.id === foodId)?.name || 'Food'
        
        setOrderFeedback({
          show: true,
          message: data.updated 
            ? `Zajtrk spremenjen na ${foodName}! 🍳`
            : `${foodName} uspešno naročen! 🍳`,
          success: true
        })
        
        // Refresh food data to show current order
        fetchFoodData()
      } else {
        throw new Error('Failed to order food')
      }
    } catch (error) {
      setOrderFeedback({
        show: true,
        message: 'Naročilo hrane ni uspelo. Prosimo, poskusi znova.',
        success: false
      })
    } finally {
      setLoading(false)
      setTimeout(() => setOrderFeedback({ show: false, message: '', success: false }), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-300 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-white/5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>

      <div className="relative z-10 p-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-end items-center mb-8">
            <Link href="/" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2 shadow-lg">
              <Home className="w-4 h-4" />
              Domov
            </Link>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <UtensilsCrossed className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Zajtrk
            </h1>
            <p className="text-white/90 text-xl max-w-3xl mx-auto leading-relaxed mb-6">
              Izberi svoj zajtrk za sobotno jutro. Lahko spreminjaš svojo izbiro do 8:45.
            </p>
            
            {guestFoodOrder && (
              <div className="mt-6 p-6 bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl max-w-md mx-auto shadow-xl">
                <div className="flex items-center justify-center gap-3 text-white">
                  <div className="w-12 h-12 bg-green-500/90 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-white/90 font-medium">Trenutna izbira:</p>
                    <p className="font-bold text-lg drop-shadow-sm">
                      {guestFoodOrder.food_menu?.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Food Menu */}
          {foodMenu.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {foodMenu.map((food) => (
                <div key={food.id} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">{food.name}</h3>
                    {food.description && (
                      <p className="text-white/90 mb-6 leading-relaxed">{food.description}</p>
                    )}
                    <button
                      onClick={() => orderFood(food.id)}
                      disabled={loading}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                        guestFoodOrder?.food_menu_id === food.id
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white transform hover:scale-105'
                      }`}
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : guestFoodOrder?.food_menu_id === food.id ? (
                        <>
                          <Check className="w-6 h-6" />
                          Izbrano
                        </>
                      ) : (
                        'Izberi'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <UtensilsCrossed className="w-10 h-10 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Ni razpoložljivih možnosti</h3>
              <p className="text-white/80 text-lg">Trenutno ni na voljo nobenih možnosti za zajtrk.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Feedback Overlay */}
      {orderFeedback.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl ${orderFeedback.success ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'}`}>
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${orderFeedback.success ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {orderFeedback.success ? (
                <UtensilsCrossed className="w-10 h-10 text-green-300" />
              ) : (
                <div className="text-red-300 text-3xl">⚠️</div>
              )}
            </div>
            <p className="text-xl font-bold text-white drop-shadow-lg">
              {orderFeedback.message}
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 