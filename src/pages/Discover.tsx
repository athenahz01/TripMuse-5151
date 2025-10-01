import React, { useEffect, useMemo, useState } from 'react'
import { EXPERIENCES } from '@/data/experiences'
import { personalize } from '@/lib/filters'
import { useTaste } from '@/store/useTaste'
import SwipeDeck from '@/components/SwipeDeck'
import Avatar from '@/components/Avatar'
import LearningInsights from '@/components/LearningInsights'
import { enrichCards, getRealAttractions, getPersonalizedAttractions, EnrichedCard } from '@/lib/api'
import { Sparkles, Heart, MapPin, Loader2, Globe, Database } from 'lucide-react'

export default function Discover() {
  const { destination, traits, interests, like, skip, likes, userId, getLearningInsights } = useTaste()
  const [cards, setCards] = useState<EnrichedCard[]>([])
  const [loading, setLoading] = useState(false)
  const [useRealData, setUseRealData] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Base items from your trait-based filter
  const baseItems = useMemo(
    () =>
      personalize(EXPERIENCES, destination, traits).map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: e.subtitle,
        tags: e.tags,
      })),
    [destination, traits]
  )

  useEffect(() => {
    let alive = true
    setLoading(true)
    setCards([])
    setLoadingProgress(0)

    const loadData = async () => {
      try {
        if (useRealData && destination) {
          // Try to get ML-powered personalized attractions
          setLoadingProgress(20)
          const personalizedAttractions = await getPersonalizedAttractions(destination, traits, interests, userId)
          
          if (personalizedAttractions.length > 0) {
            setLoadingProgress(80)
            setCards(personalizedAttractions)
          } else {
            // Fallback to regular real attractions
            setLoadingProgress(40)
            const realAttractions = await getRealAttractions(destination, traits, interests, userId)
            if (realAttractions.length > 0) {
              setCards(realAttractions)
            } else {
              // Final fallback to curated experiences
              const enriched = await enrichCards(baseItems, destination)
              setCards(enriched)
            }
          }
        } else {
          // Use curated experiences
          setLoadingProgress(50)
          const enriched = await enrichCards(baseItems, destination || '')
          setCards(enriched)
        }
        setLoadingProgress(100)
      } catch (error) {
        console.error('Error loading attractions:', error)
        // Fallback to curated experiences
        const enriched = await enrichCards(baseItems, destination || '')
        setCards(enriched)
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadData()
    return () => { alive = false }
  }, [baseItems, destination, traits, useRealData])

  return (
    <section className="grid gap-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg shadow-soft mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold gradient-text">
          Discover {destination ? `in ${destination}` : 'Your Next Adventure'}
          </h1>
        <p className="text-xl text-neutral-600 leading-relaxed">
          Swipe right to save experiences you love, left to skip. We'll find the perfect matches for your style.
          </p>
        </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
          <Avatar traits={traits} />
            <div className="text-sm">
              <div className="font-semibold text-neutral-700">Your Travel Style</div>
              <div className="text-neutral-500">{traits.length} traits selected</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 rounded-xl">
              <Heart className="w-4 h-4 text-sky-500" />
              <span className="text-sm font-medium text-sky-600">{likes.length} saved</span>
            </div>
            <button
              onClick={() => setUseRealData(!useRealData)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                useRealData 
                  ? 'bg-green-50 text-green-600 border border-green-200' 
                  : 'bg-neutral-50 text-neutral-600 border border-neutral-200'
              }`}
            >
              {useRealData ? <Globe className="w-4 h-4" /> : <Database className="w-4 h-4" />}
              <span className="text-xs font-medium">
                {useRealData ? 'Live Data' : 'Curated'}
              </span>
            </button>
            <LearningInsights />
          </div>
      </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-4" />
            <p className="text-lg font-medium">Finding amazing experiences...</p>
            <p className="text-sm mb-4">
              {useRealData ? 'Searching multiple APIs for real attractions and photos' : 'Loading curated experiences'}
            </p>
            <div className="w-64 bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full gradient-bg transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-400 mt-2">{loadingProgress}% complete</p>
            {useRealData && (
              <div className="mt-4 text-xs text-neutral-400">
                <p>🔍 Searching Google Places, Foursquare, and image APIs...</p>
                <p>📊 Filtering by your preferences...</p>
              </div>
            )}
          </div>
        )}

        {!loading && (
          <>
            {cards.length > 0 && (
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 rounded-xl text-sm text-sky-600">
                  <span className="font-medium">{cards.length}</span>
                  <span>attractions found</span>
                  {useRealData && (
                    <span className="text-xs text-sky-500">• Live data</span>
                  )}
                </div>
              </div>
            )}
      <SwipeDeck
        items={cards}
              onSwipe={(id, dir, attractionData)=> {
                if (dir === 'right') {
                  like(id, attractionData)
                } else {
                  skip(id, attractionData)
                }
              }}
            />
          </>
        )}
      </div>

      <div className="text-center text-sm text-neutral-500 space-y-2">
        <p>🎯 Each experience is personalized based on your interests and travel style</p>
        {useRealData && (
          <p className="text-xs text-neutral-400">
            🌐 Powered by Google Places, Foursquare, and multiple image APIs
          </p>
        )}
      </div>
    </section>
  )
}