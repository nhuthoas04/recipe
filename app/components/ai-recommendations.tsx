"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { RecipeCard } from "@/components/recipe/recipe-card"
import { RecipeDetailDialog } from "@/components/recipe/recipe-detail-dialog"
import { RefreshCw, ChevronLeft, ChevronRight, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Recipe } from "@/lib/types"

interface AIRecommendationsProps {
  userId: string
  age?: number
  healthConditions?: string[]
  dietaryPreferences?: string[]
}

export function AIRecommendations({ userId, age, healthConditions, dietaryPreferences }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Kiểm tra có thông tin sức khỏe không (không chỉ tuổi)
  const hasHealthInfo = (healthConditions && healthConditions.length > 0) || 
                        (dietaryPreferences && dietaryPreferences.length > 0)

  const loadRecommendations = useCallback(async () => {
    if (!hasHealthInfo) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          age,
          healthConditions: healthConditions || [],
          dietaryPreferences: dietaryPreferences || [],
        }),
      })

      const data = await response.json()
      if (data.success) {
        const formattedRecipes = data.recipes.map((recipe: any) => ({
          ...recipe,
          likesCount: recipe.likesCount || 0,
          savesCount: recipe.savesCount || 0,
          commentsCount: recipe.commentsCount || 0,
        }))
        setRecommendations(formattedRecipes)
      }
    } catch (error) {
      console.error('Load recommendations error:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, age, healthConditions, dietaryPreferences, hasHealthInfo])

  useEffect(() => {
    // Chỉ load một lần khi mount, không load lại khi dependencies thay đổi
    loadRecommendations()
  }, [])

  // Update comment count for a specific recipe in recommendations (delta: +1 for add, -1 for delete)
  const handleCommentChange = useCallback((delta: number = 1) => {
    if (selectedRecipe?.id) {
      setRecommendations(prev => 
        prev.map(recipe => 
          recipe.id === selectedRecipe.id 
            ? { ...recipe, commentsCount: Math.max(0, (recipe.commentsCount || 0) + delta) }
            : recipe
        )
      )
    }
  }, [selectedRecipe?.id])

  // Update like/save counts for a specific recipe
  const handleLikeSaveChange = useCallback((recipeId: string, field: 'likesCount' | 'savesCount', newValue: number) => {
    console.log('[AI Recommendations] handleLikeSaveChange called:', { recipeId, field, newValue })
    setRecommendations(prev => {
      console.log('[AI Recommendations] Current recommendations IDs:', prev.map(r => r.id))
      return prev.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, [field]: newValue }
          : recipe
      )
    })
  }, [])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' })
    }
  }

  // Không hiện gì nếu không có thông tin sức khỏe
  if (!hasHealthInfo) {
    return null
  }

  if (loading) {
    return (
      <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border bg-[#f5f5f0]">
        <div className="flex min-h-[400px]">
          <div className="bg-[#3d6b5a] text-white p-8 w-[280px] flex-shrink-0 flex flex-col justify-center rounded-l-2xl">
            <h2 className="text-xl font-bold italic mb-3 whitespace-nowrap">Gợi ý món ăn theo</h2>
            <h2 className="text-xl font-bold italic mb-4 whitespace-nowrap">sức khỏe</h2>
            <p className="text-white/80 text-xs leading-relaxed">Đang tải gợi ý...</p>
          </div>
          <div className="bg-white p-8 flex-1 flex items-center justify-center rounded-r-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3d6b5a]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border bg-[#f5f5f0]">
      <div className="flex min-h-[450px]">
        {/* Left Panel - Green Background */}
        <div className="bg-[#3d6b5a] text-white p-8 w-[280px] flex-shrink-0 flex flex-col justify-between rounded-l-2xl">
          <div>
            <h2 className="text-xl font-bold italic leading-tight mb-4">
              Gợi ý món ăn theo<br/>sức khỏe
            </h2>
            <p className="text-white/80 text-xs leading-relaxed">
              Dựa trên thông tin sức khỏe, chúng tôi đề xuất món ăn ngon và dễ làm cho bạn
            </p>
          </div>

          {/* Decorative Icon */}
          <div className="flex justify-center my-6">
            <svg className="w-32 h-32 opacity-90" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Open Book */}
              <path d="M30 160 Q30 155 35 155 L95 155 Q100 155 100 160 L100 205 Q100 210 95 210 L35 210 Q30 210 30 205 Z" stroke="white" strokeWidth="4" fill="none"/>
              <path d="M170 160 Q170 155 165 155 L105 155 Q100 155 100 160 L100 205 Q100 210 105 210 L165 210 Q170 210 170 205 Z" stroke="white" strokeWidth="4" fill="none"/>
              <path d="M100 155 L100 210" stroke="white" strokeWidth="4"/>
              
              {/* Left page content */}
              <rect x="40" y="165" width="30" height="25" stroke="white" strokeWidth="2.5" rx="2" fill="none"/>
              <line x1="75" y1="168" x2="88" y2="168" stroke="white" strokeWidth="2"/>
              <line x1="75" y1="173" x2="90" y2="173" stroke="white" strokeWidth="2"/>
              <line x1="75" y1="178" x2="88" y2="178" stroke="white" strokeWidth="2"/>
              <line x1="40" y1="198" x2="90" y2="198" stroke="white" strokeWidth="2"/>
              <line x1="40" y1="203" x2="85" y2="203" stroke="white" strokeWidth="2"/>
              
              {/* Right page content */}
              <line x1="110" y1="168" x2="160" y2="168" stroke="white" strokeWidth="2"/>
              <line x1="110" y1="173" x2="155" y2="173" stroke="white" strokeWidth="2"/>
              <line x1="110" y1="178" x2="160" y2="178" stroke="white" strokeWidth="2"/>
              <line x1="110" y1="183" x2="158" y2="183" stroke="white" strokeWidth="2"/>
              <line x1="110" y1="198" x2="160" y2="198" stroke="white" strokeWidth="2"/>
              <line x1="110" y1="203" x2="155" y2="203" stroke="white" strokeWidth="2"/>
              
              {/* Steam waves */}
              <path d="M45 145 Q40 130 45 115 Q50 100 45 85" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              <path d="M70 150 Q65 135 70 120 Q75 105 70 90" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              <path d="M125 150 Q130 135 125 120 Q120 105 125 90" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              <path d="M150 145 Q155 130 150 115 Q145 100 150 85" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              
              {/* Small thought bubbles */}
              <circle cx="90" cy="80" r="4" fill="white"/>
              <circle cx="95" cy="68" r="6" fill="white"/>
              
              {/* Large thought bubble cloud */}
              <ellipse cx="100" cy="35" rx="60" ry="40" stroke="white" strokeWidth="4" fill="none"/>
              
              {/* Chef hat inside bubble */}
              <ellipse cx="100" cy="35" rx="28" ry="18" stroke="white" strokeWidth="3" fill="none"/>
              <path d="M75 35 Q75 22 85 18 Q90 12 100 12 Q110 12 115 18 Q125 22 125 35" stroke="white" strokeWidth="3" fill="none"/>
              <line x1="72" y1="35" x2="128" y2="35" stroke="white" strokeWidth="3"/>
              <rect x="72" y="35" width="56" height="12" rx="2" stroke="white" strokeWidth="3" fill="none"/>
              
              {/* Fork in bubble */}
              <g transform="translate(135, 25)">
                <line x1="-4" y1="8" x2="-4" y2="32" stroke="white" strokeWidth="3"/>
                <line x1="0" y1="8" x2="0" y2="32" stroke="white" strokeWidth="3"/>
                <line x1="4" y1="8" x2="4" y2="32" stroke="white" strokeWidth="3"/>
                <path d="M-5 8 L-5 3 Q-5 0 -2 0 L2 0 Q5 0 5 3 L5 8" stroke="white" strokeWidth="3" fill="none"/>
              </g>
              
              {/* Spoon in bubble */}
              <g transform="translate(65, 25)">
                <ellipse cx="0" cy="3" rx="5" ry="6" stroke="white" strokeWidth="3" fill="none"/>
                <line x1="0" y1="9" x2="0" y2="32" stroke="white" strokeWidth="3"/>
              </g>
            </svg>
          </div>

          {/* Refresh Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadRecommendations}
            disabled={loading}
            className="border-white/40 text-white hover:bg-white/10 bg-transparent w-fit"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        {/* Right Panel - Recipe Grid */}
        <div className="bg-white p-8 flex-1 flex flex-col rounded-r-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 text-lg">Món ăn gợi ý</h3>
            <div className="flex gap-2">
              <button
                onClick={scrollLeft}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={scrollRight}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Scrollable Recipe Grid - Fixed width container with horizontal scroll */}
          <div className="flex-1 relative">
            <div 
              ref={scrollContainerRef}
              className="w-full h-full overflow-x-scroll overflow-y-hidden pb-4"
              style={{ 
                scrollbarWidth: 'auto',
                scrollbarColor: '#3d6b5a #e5e7eb'
              }}
              onWheel={(e) => {
                if (scrollContainerRef.current) {
                  e.preventDefault()
                  scrollContainerRef.current.scrollLeft += e.deltaY
                }
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  height: 12px;
                }
                div::-webkit-scrollbar-track {
                  background: #e5e7eb;
                  border-radius: 8px;
                  margin: 0 8px;
                }
                div::-webkit-scrollbar-thumb {
                  background: #3d6b5a;
                  border-radius: 8px;
                  border: 2px solid #e5e7eb;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: #2d5a4a;
                }
              `}</style>
              <div className="flex gap-6 h-full items-start" style={{ width: 'max-content', minWidth: '100%' }}>
                {recommendations.map((recipe) => (
                  <div key={recipe.id} className="w-[270px] flex-shrink-0">
                    <RecipeCard 
                      recipe={recipe} 
                      onClick={() => setSelectedRecipe(recipe)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <RecipeDetailDialog 
        recipe={selectedRecipe} 
        onClose={() => setSelectedRecipe(null)}
        onCommentChange={handleCommentChange}
        onLikeSaveChange={handleLikeSaveChange}
      />
    </div>
  )
}
