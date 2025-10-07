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
    likes,  // Add this - track likes
    skips   // Add this - track skips
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

      console.log('🔄 Loading personalized venues...')
      console.log(`  User has ${likes.length} likes, ${skips.length} skips`)

      // Get or create user in database
      const dbUserId = await userService.getOrCreateUser(userId)

      // Save current preferences
      await userService.savePreferences(dbUserId, {
        interests,
        traits,
        budgetLevel,
        travelStyle,
      })

      // Get personalized recommendations (THIS IS WHERE LEARNING HAPPENS)
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

      console.log(`✅ Loaded ${personalizedVenues.length} personalized venues`)
      setVenues(personalizedVenues)
      setStoreVenues(personalizedVenues)
      setLoading(false)
    } catch (err) {
      console.error('Error loading personalized venues:', err)
      
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