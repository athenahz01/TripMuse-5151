import { useState, useEffect } from 'react'
import { useTaste, Venue } from '../store/useTaste'
import { recommendationService } from '../services/recommendationService'
import { userService } from '../services/userService'
import { FALLBACK_NYC_VENUES } from '../data/fallbackVenues'

export function usePersonalizedVenues() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const {
    userId,
    interests,
    traits,
    budgetLevel,
    travelStyle,
    destination,
    setVenues: setStoreVenues,
    likes,
    skips
  } = useTaste()

  // Re-run when user swipes (likes/skips change)
  useEffect(() => {
    loadPersonalizedVenues()
  }, [userId, interests, traits, budgetLevel, likes.length, skips.length])

  async function loadPersonalizedVenues() {
    if (!userId) {
      setError('No user ID found')
      setLoading(false)
      return
    }
  
    try {
      setLoading(true)
      setError(null)
  
      console.log('\n🔄 Loading personalized venues...')
      console.log(`  Interests: ${interests.join(', ')}`)
      console.log(`  Traits: ${traits.join(', ')}`)
      console.log(`  User has ${likes.length} likes, ${skips.length} skips`)
  
      // CRITICAL: Ensure user exists in database first
      console.log('👤 Ensuring user exists in database...')
      const dbUserId = await userService.getOrCreateUser(userId)
      console.log('✅ User confirmed:', dbUserId)
  
      // Save current preferences
      console.log('💾 Saving preferences...')
      await userService.savePreferences(dbUserId, {
        interests,
        traits,
        budgetLevel,
        travelStyle,
      })
      console.log('✅ Preferences saved')
  
      // Get personalized recommendations
      console.log('🎯 Getting personalized recommendations...')
      let personalizedVenues = await recommendationService.getPersonalizedVenues(
        dbUserId,
        {
          interests,
          traits,
          budgetLevel,
          travelStyle,
        },
        30
      )
  
      // If no venues in database, use fallback
      if (personalizedVenues.length === 0) {
        console.log('⚠️ No venues in database, using fallback data')
        personalizedVenues = FALLBACK_NYC_VENUES.slice(0, 30) as Venue[]
      }
  
      console.log(`✅ Loaded ${personalizedVenues.length} personalized venues\n`)
      setVenues(personalizedVenues)
      setStoreVenues(personalizedVenues)
      setLoading(false)
    } catch (err) {
      console.error('❌ Error loading personalized venues:', err)
      
      // Fallback to static venues on error
      console.log('⚠️ Using fallback data due to error')
      const fallbackVenues = FALLBACK_NYC_VENUES.slice(0, 30) as Venue[]
      setVenues(fallbackVenues)
      setStoreVenues(fallbackVenues)
      setError(null)
      setLoading(false)
    }
  }

  return {
    venues,
    loading,
    error,
    reload: loadPersonalizedVenues
  }
}