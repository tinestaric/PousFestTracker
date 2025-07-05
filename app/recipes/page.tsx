'use client'

import { useState, useEffect } from 'react'
import { Home, Play, ShoppingCart, Wine, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { DrinkMenuItem } from '@/lib/supabase'

interface Recipe {
  id: string
  name: string
  description: string
  ingredients: string[]
  instructions: string[]
  videoUrl?: string
  prepTime: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  serves: number
  drinkId?: string
}

// Sample cocktail recipes data
const cocktailRecipes: Recipe[] = [
  {
    id: 'mojito',
    name: 'Classic Mojito',
    description: 'A refreshing Cuban cocktail with mint, lime, and rum',
    ingredients: [
      '2 oz White rum',
      '1 oz Fresh lime juice',
      '2 tsp Sugar',
      '6-8 Fresh mint leaves',
      'Soda water',
      'Ice cubes',
      'Lime wheel and mint sprig for garnish'
    ],
    instructions: [
      'Add mint leaves and sugar to a highball glass',
      'Gently muddle the mint to release oils (don\'t over-muddle)',
      'Add lime juice and rum',
      'Fill glass with ice cubes',
      'Top with soda water',
      'Stir gently to combine',
      'Garnish with lime wheel and fresh mint sprig'
    ],
    videoUrl: 'https://www.youtube.com/embed/4oiA7hW8QqQ',
    prepTime: '5 min',
    difficulty: 'Easy',
    serves: 1
  },
  {
    id: 'margarita',
    name: 'Classic Margarita',
    description: 'The perfect balance of tequila, lime, and orange liqueur',
    ingredients: [
      '2 oz Blanco tequila',
      '1 oz Fresh lime juice',
      '1 oz Orange liqueur (Cointreau or Triple Sec)',
      '1/2 oz Simple syrup (optional)',
      'Salt for rim',
      'Ice cubes',
      'Lime wheel for garnish'
    ],
    instructions: [
      'Rim glass with salt (optional)',
      'Add all ingredients to a shaker with ice',
      'Shake vigorously for 10-15 seconds',
      'Strain into a rocks glass over fresh ice',
      'Garnish with lime wheel'
    ],
    videoUrl: 'https://www.youtube.com/embed/TZlTdFNjAx8',
    prepTime: '3 min',
    difficulty: 'Easy',
    serves: 1
  },
  {
    id: 'old-fashioned',
    name: 'Old Fashioned',
    description: 'A timeless whiskey cocktail with bitters and sugar',
    ingredients: [
      '2 oz Bourbon or rye whiskey',
      '1/4 oz Simple syrup',
      '2-3 dashes Angostura bitters',
      'Orange peel',
      'Ice cubes',
      'Maraschino cherry (optional)'
    ],
    instructions: [
      'Add simple syrup and bitters to a rocks glass',
      'Add a large ice cube',
      'Pour whiskey over ice',
      'Stir gently for 30 seconds',
      'Express orange peel oils over drink',
      'Garnish with orange peel and cherry'
    ],
    videoUrl: 'https://www.youtube.com/embed/qhoGgKdYWkw',
    prepTime: '4 min',
    difficulty: 'Medium',
    serves: 1
  },
  {
    id: 'cosmopolitan',
    name: 'Cosmopolitan',
    description: 'A sophisticated pink cocktail with vodka and cranberry',
    ingredients: [
      '1.5 oz Vodka',
      '1 oz Cointreau or Triple Sec',
      '0.5 oz Fresh lime juice',
      '0.5 oz Cranberry juice',
      'Ice cubes',
      'Lime wheel for garnish'
    ],
    instructions: [
      'Add all ingredients to a cocktail shaker with ice',
      'Shake vigorously for 10-15 seconds',
      'Double strain into a chilled martini glass',
      'Garnish with lime wheel'
    ],
    videoUrl: 'https://www.youtube.com/embed/6Kf3KKaGYSs',
    prepTime: '3 min',
    difficulty: 'Medium',
    serves: 1
  },
  {
    id: 'negroni',
    name: 'Negroni',
    description: 'A bitter Italian aperitif with gin, vermouth, and Campari',
    ingredients: [
      '1 oz Gin',
      '1 oz Sweet vermouth',
      '1 oz Campari',
      'Ice cubes',
      'Orange peel for garnish'
    ],
    instructions: [
      'Add all ingredients to a rocks glass with ice',
      'Stir gently for 30 seconds',
      'Express orange peel oils over drink',
      'Garnish with orange peel'
    ],
    videoUrl: 'https://www.youtube.com/embed/apb7DYlCJdY',
    prepTime: '2 min',
    difficulty: 'Easy',
    serves: 1
  },
  {
    id: 'whiskey-sour',
    name: 'Whiskey Sour',
    description: 'A perfect balance of whiskey, lemon, and sweetness',
    ingredients: [
      '2 oz Bourbon whiskey',
      '1 oz Fresh lemon juice',
      '0.75 oz Simple syrup',
      '1 Egg white (optional)',
      'Ice cubes',
      'Lemon wheel and cherry for garnish'
    ],
    instructions: [
      'Add all ingredients to a shaker',
      'Dry shake (without ice) if using egg white',
      'Add ice and shake vigorously',
      'Strain into a rocks glass over fresh ice',
      'Garnish with lemon wheel and cherry'
    ],
    videoUrl: 'https://www.youtube.com/embed/QhfHR7MI8Pg',
    prepTime: '4 min',
    difficulty: 'Medium',
    serves: 1
  }
]

export default function RecipesPage() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [drinkMenu, setDrinkMenu] = useState<DrinkMenuItem[]>([])
  const [orderFeedback, setOrderFeedback] = useState<{ show: boolean; message: string; success: boolean }>({ show: false, message: '', success: false })

  useEffect(() => {
    fetchDrinkMenu()
  }, [])

  const fetchDrinkMenu = async () => {
    try {
      const { data, error } = await supabase
        .from('drink_menu')
        .select('*')
        .eq('available', true)
        .eq('category', 'cocktail')
        .order('name', { ascending: true })

      if (error) throw error
      setDrinkMenu(data || [])
    } catch (err) {
      console.error('Failed to fetch drink menu:', err)
    }
  }

  const orderDrink = async (drinkName: string) => {
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

    // Find the drink in our menu
    const drink = drinkMenu.find(d => d.name.toLowerCase().includes(drinkName.toLowerCase()))
    if (!drink) {
      setOrderFeedback({
        show: true,
        message: 'This cocktail is not available for ordering',
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
          drink_menu_id: drink.id,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to order drink')
      }

      setOrderFeedback({
        show: true,
        message: `${drink.name} ordered successfully! 🍻`,
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
                    <span className="text-sm text-gray-600">{selectedRecipe.prepTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Serves {selectedRecipe.serves}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedRecipe.difficulty)}`}>
                    {selectedRecipe.difficulty}
                  </span>
                </div>

                {selectedRecipe.videoUrl && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
                    <iframe
                      src={selectedRecipe.videoUrl}
                      title={`${selectedRecipe.name} Recipe Video`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Order Button */}
                <button
                  onClick={() => orderDrink(selectedRecipe.name)}
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cocktailRecipes.map((recipe) => (
            <div key={recipe.id} className="card hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => setSelectedRecipe(recipe)}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Wine className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{recipe.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{recipe.prepTime}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{recipe.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.prepTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{recipe.serves}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {recipe.videoUrl && (
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
      </div>
    </div>
  )
} 