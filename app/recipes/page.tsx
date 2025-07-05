'use client'

import { useState, useEffect } from 'react'
import { Home, Play, ShoppingCart, Wine, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { DrinkMenuItem, Recipe } from '@/lib/supabase'

export default function RecipesPage() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [drinkMenu, setDrinkMenu] = useState<DrinkMenuItem[]>([])
  const [orderFeedback, setOrderFeedback] = useState<{ show: boolean; message: string; success: boolean }>({ show: false, message: '', success: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [recipesData, drinkMenuData] = await Promise.all([
        supabase.from('recipes').select('*, drink_menu(name, category)').order('name', { ascending: true }),
        supabase.from('drink_menu').select('*').eq('available', true).eq('category', 'cocktail').order('name', { ascending: true })
      ])

      if (recipesData.error) throw recipesData.error
      if (drinkMenuData.error) throw drinkMenuData.error

      setRecipes(recipesData.data || [])
      setDrinkMenu(drinkMenuData.data || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const orderDrink = async (recipe: Recipe) => {
    const tagUid = localStorage.getItem('pous_fest_tag_uid')
    if (!tagUid) {
      setOrderFeedback({
        show: true,
        message: 'Please scan your NFC tag first from the guest dashboard',
        success: false
      })
      setTimeout(() => setOrderFeedback({ show: false, message: '', success: false }), 3000)
      return
    }

    if (!recipe.drink_menu_id) {
      setOrderFeedback({
        show: true,
        message: 'This recipe is not linked to a drink in the menu.',
        success: false
      })
      setTimeout(() => setOrderFeedback({ show: false, message: '', success: false }), 3000)
      return
    }

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

      setOrderFeedback({
        show: true,
        message: `${recipe.name} ordered successfully! 🍻`,
        success: true
      })

      setTimeout(() => setOrderFeedback({ show: false, message: '', success: false }), 3000)
    } catch (err) {
      console.error('Failed to order drink:', err)
      setOrderFeedback({
        show: true,
        message: 'Failed to order cocktail. Please try again.',
        success: false
      })
      setTimeout(() => setOrderFeedback({ show: false, message: '', success: false }), 3000)
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
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setSelectedRecipe(null)}
              className="btn-outline"
            >
              ← Back to Recipes
            </button>
            <Link href="/" className="btn-outline">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </div>

          {/* Recipe Details */}
          <div className="card mb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Video Section */}
              <div className="lg:w-1/2">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{selectedRecipe.name}</h1>
                <p className="text-gray-600 mb-4">{selectedRecipe.description}</p>
                
                {/* Recipe Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedRecipe.prep_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Serves {selectedRecipe.serves}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedRecipe.difficulty || 'Easy')}`}>
                    {selectedRecipe.difficulty}
                  </span>
                </div>

                {selectedRecipe.video_url && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
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
                  className="btn-primary w-full lg:w-auto"
                >
                  Order This Cocktail
                </button>
              </div>

              {/* Recipe Instructions */}
              <div className="lg:w-1/2">
                <div className="space-y-6">
                  {/* Ingredients */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Ingredients</h3>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-gray-700">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Instructions</h3>
                    <ol className="space-y-3">
                      {selectedRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 pt-1">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Feedback Overlay */}
        {orderFeedback.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className={`bg-white rounded-lg p-6 max-w-sm mx-4 text-center shadow-xl ${orderFeedback.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${orderFeedback.success ? 'bg-green-100' : 'bg-red-100'}`}>
                {orderFeedback.success ? (
                  <Wine className={`w-8 h-8 ${orderFeedback.success ? 'text-green-600' : 'text-red-600'}`} />
                ) : (
                  <div className="text-red-600 text-2xl">⚠️</div>
                )}
              </div>
              <p className={`text-lg font-semibold ${orderFeedback.success ? 'text-green-800' : 'text-red-800'}`}>
                {orderFeedback.message}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Cocktail Recipes</h1>
            <p className="text-gray-600">Learn to make amazing cocktails with video tutorials</p>
          </div>
          <Link href="/" className="btn-outline">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <Wine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Recipes Available</h3>
            <p className="text-gray-500">Check back later for cocktail recipes!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
            <div key={recipe.id} className="card hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => setSelectedRecipe(recipe)}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Wine className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{recipe.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty || 'Easy')}`}>
                      {recipe.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{recipe.prep_time}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{recipe.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.prep_time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{recipe.serves}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {recipe.video_url && (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-red-600" />
                    </div>
                  )}
                  <span className="text-primary-600 font-medium text-sm">View Recipe →</span>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  )
} 