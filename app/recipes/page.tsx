'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Wine, Clock, Users, Play, Home, ChefHat, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Recipe } from '@/lib/supabase'
import { getEventConfig, getText, getInterpolatedText } from '@/lib/eventConfig'
import { getStoredTagUid } from '@/lib/hooks/useTagUid'

// Cache constants to match guest page
const GUEST_DATA_CACHE_KEY = 'event_guest_data_cache'
const DRINK_MENU_CACHE_KEY = 'event_drink_menu_cache'

export default function RecipesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [orderFeedback, setOrderFeedback] = useState<{ show: boolean; message: string; success: boolean; redirecting?: boolean; processing?: boolean }>({ show: false, message: '', success: false })
  const [returnUrl, setReturnUrl] = useState<string>('/recipes')
  const config = getEventConfig()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Handle recipe parameter from URL
    const recipeId = searchParams.get('recipe')
    const fromParam = searchParams.get('from')
    
    // Set return URL based on 'from' parameter
    if (fromParam) {
      setReturnUrl(decodeURIComponent(fromParam))
    }
    
    if (recipeId && recipes.length > 0) {
      const recipe = recipes.find(r => r.id === recipeId)
      if (recipe) {
        setSelectedRecipe(recipe)
      }
    }
  }, [searchParams, recipes])

  const fetchData = async () => {
    try {
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select(`
          *,
          drink_menu (
            id,
            name,
            category,
            description
          )
        `)
        .order('name')

      if (error) throw error
      setRecipes(recipes || [])
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const orderDrink = async (recipe: Recipe) => {
    const tagUid = getStoredTagUid()
    if (!tagUid) {
      setOrderFeedback({
        show: true,
        message: getText('recipes.errors.scanNfcFirst', config),
        success: false,
        processing: false
      })
      setTimeout(() => setOrderFeedback({ show: false, message: '', success: false, processing: false }), 3000)
      return
    }

    // Show processing feedback IMMEDIATELY to prevent multiple clicks
    setOrderFeedback({
      show: true,
      message: getInterpolatedText('recipes.feedback.processingOrder', config, { drinkName: recipe.name }),
      success: true, // Use success styling for processing state
      processing: true
    })

    try {
      const response = await fetch('/api/orderDrink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag_uid: tagUid,
          drink_menu_id: recipe.drink_menu_id,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to order drink')
      }

      // Update to success feedback
      setOrderFeedback({
        show: true,
        message: getInterpolatedText('recipes.feedback.orderSuccess', config, { drinkName: recipe.name }),
        success: true,
        processing: false
      })

      // Invalidate cache so the guest dashboard shows updated data
      localStorage.removeItem(GUEST_DATA_CACHE_KEY)

      // If we came from guest dashboard, redirect back after showing feedback
      if (returnUrl.includes('guest')) {
        setTimeout(() => {
          setOrderFeedback({ 
            show: true, 
            message: getText('recipes.feedback.redirecting', config), 
            success: true, 
            redirecting: true,
            processing: false
          })
        }, 1500)
        setTimeout(() => {
          router.push(returnUrl)
        }, 2500)
      } else {
        setTimeout(() => setOrderFeedback({ show: false, message: '', success: false, processing: false }), 2000)
      }
    } catch (err) {
      console.error('Failed to order drink:', err)
      
      // Show error feedback
      setOrderFeedback({
        show: true,
        message: getText('recipes.orderFailed', config),
        success: false,
        processing: false
      })

      // Auto-hide feedback after 3 seconds
      setTimeout(() => setOrderFeedback({ show: false, message: '', success: false, processing: false }), 3000)
    }
  }

  const handleBackNavigation = () => {
    if (returnUrl === '/recipes') {
      setSelectedRecipe(null)
    } else {
      router.push(returnUrl)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (selectedRecipe) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative p-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleBackNavigation}
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                ← {getText('buttons.back', config)}
              </button>
              <Link href="/" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2">
                <Home className="w-4 h-4" />
                {getText('buttons.home', config)}
              </Link>
            </div>

            {/* Recipe Details */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 mb-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Video Section */}
                <div className="lg:w-1/2">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">{selectedRecipe.name}</h1>
                  <p className="text-gray-600 mb-6 text-lg">{selectedRecipe.description}</p>
                  
                  {/* Recipe Info */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">{selectedRecipe.prep_time}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">{getText('recipes.serves', config)} {selectedRecipe.serves}</span>
                    </div>
                    <span className={`px-3 py-2 rounded-lg text-sm font-medium ${getDifficultyColor(selectedRecipe.difficulty || 'Easy')}`}>
                      {selectedRecipe.difficulty}
                    </span>
                  </div>

                  {selectedRecipe.video_url && (
                    <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6 shadow-lg">
                      <iframe
                        src={selectedRecipe.video_url}
                        title={`${selectedRecipe.name} Recipe Video`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* Order Button */}
                  <button
                    onClick={() => orderDrink(selectedRecipe)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl w-full lg:w-auto text-lg"
                  >
                    {getText('recipes.orderCocktail', config)}
                  </button>
                </div>

                {/* Recipe Instructions */}
                <div className="lg:w-1/2">
                  <div className="space-y-8">
                    {/* Ingredients */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                        {getText('recipes.ingredients', config)}
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <ul className="space-y-3">
                          {selectedRecipe.ingredients.map((ingredient, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></span>
                              <span className="text-gray-700 font-medium">{ingredient}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ChefHat className="w-6 h-6 text-blue-600" />
                        {getText('recipes.instructions', config)}
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <ol className="space-y-4">
                          {selectedRecipe.instructions.map((instruction, index) => (
                            <li key={index} className="flex gap-4">
                              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-gray-700 pt-1 font-medium">{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Feedback Overlay */}
        {orderFeedback.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className={`bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl ${orderFeedback.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
              <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${orderFeedback.success ? 'bg-green-100' : 'bg-red-100'}`}>
                {orderFeedback.processing ? (
                  <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                ) : orderFeedback.redirecting ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-300 border-t-green-600"></div>
                ) : orderFeedback.success ? (
                  <Wine className="w-10 h-10 text-green-600" />
                ) : (
                  <div className="text-red-600 text-3xl">⚠️</div>
                )}
              </div>
              <p className={`text-xl font-bold ${orderFeedback.success ? 'text-green-800' : 'text-red-800'}`}>
                {orderFeedback.message}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{getText('recipes.title', config)}</h1>
              <p className="text-blue-100 text-lg">{getText('recipes.subtitle', config)}</p>
            </div>
            <Link href="/" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2">
                              <Home className="w-4 h-4" />
              {getText('buttons.home', config)}
            </Link>
          </div>

          {/* Recipe Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="relative mx-auto mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto"></div>
                <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
              </div>
              <p className="text-white text-lg font-medium">{getText('recipes.loading', config)}</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-12 max-w-md mx-auto">
                <Wine className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-600 mb-4">{getText('recipes.noRecipes', config)}</h3>
                <p className="text-gray-500 text-lg">{getText('recipes.noRecipesMessage', config)}</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 hover:shadow-3xl hover:scale-105 transition-all duration-300 cursor-pointer group" onClick={() => setSelectedRecipe(recipe)}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Wine className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{recipe.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(recipe.difficulty || 'Easy')}`}>
                          {recipe.difficulty}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{recipe.prep_time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">{recipe.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-800 font-medium">{recipe.prep_time}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-800 font-medium">{recipe.serves}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {recipe.video_url && (
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-red-600" />
                        </div>
                      )}
                      <span className="text-blue-600 font-bold text-sm group-hover:text-blue-700 transition-colors">{getText('recipes.viewRecipe', config)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 