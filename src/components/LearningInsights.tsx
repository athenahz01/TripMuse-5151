import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, Target, Users, Clock, Star } from 'lucide-react'
import { useTaste } from '@/store/useTaste'

export default function LearningInsights() {
  const { getLearningInsights, behaviorHistory } = useTaste()
  const [insights, setInsights] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const currentInsights = getLearningInsights()
    setInsights(currentInsights)
  }, [behaviorHistory, getLearningInsights])

  if (!insights || insights.totalInteractions < 3) {
    return null
  }

  const confidencePercentage = Math.round(insights.confidence * 100)
  const topPreferences = insights.topPreferences.slice(0, 5)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
      >
        <Brain className="w-4 h-4" />
        <span className="text-sm font-medium">AI Learning</span>
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-strong border border-purple-100 p-6 z-50">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-800">AI Learning Progress</h3>
            </div>

            {/* Confidence Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">Learning Confidence</span>
                <span className="text-sm font-bold text-purple-600">{confidencePercentage}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${confidencePercentage}%` }}
                />
              </div>
            </div>

            {/* Interaction Count */}
            <div className="flex items-center gap-3 text-sm text-neutral-600">
              <Target className="w-4 h-4 text-green-500" />
              <span>{insights.totalInteractions} interactions tracked</span>
            </div>

            {/* Top Preferences */}
            {topPreferences.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-neutral-700">Your Preferences</h4>
                <div className="space-y-1">
                  {topPreferences.map((pref: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-neutral-600 capitalize">
                        {pref.feature.replace(/[_-]/g, ' ')}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-neutral-200 rounded-full h-1">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                            style={{ width: `${Math.abs(pref.weight) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-500 w-8 text-right">
                          {pref.weight > 0 ? '+' : ''}{pref.weight.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-neutral-700">AI Recommendations</h4>
              <div className="space-y-1">
                {insights.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-neutral-600">
                    <Star className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Status */}
            <div className="pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Clock className="w-3 h-3" />
                <span>
                  {insights.totalInteractions < 10 
                    ? 'Keep exploring to improve recommendations'
                    : 'AI is learning your preferences well!'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



