import { supabase } from '../lib/supabase'
import { Venue } from '../store/useTaste'
import { swipeService } from './swipeService'

interface UserPreferences {
  interests: string[]
  traits: string[]
  budgetLevel: number
  travelStyle: string
}

interface ScoredVenue {
  venue: Venue
  score: number
  reasons: string[]
}

export const recommendationService = {
  /**
   * Get personalized venue recommendations
   */
  async getPersonalizedVenues(
    userId: string,
    preferences: UserPreferences,
    limit: number = 20
  ): Promise<Venue[]> {
    try {
      // Get all venues from database
      const { data: allVenues, error } = await supabase
        .from('venues')
        .select('*')
      
      if (error) throw error
      if (!allVenues) return []
      
      // Get venues user has already swiped
      const swipedVenueIds = await swipeService.getSwipedVenueIds(userId)
      
      // Filter out already swiped venues
      const unseenVenues = allVenues.filter(v => !swipedVenueIds.includes(v.id))
      
      if (unseenVenues.length === 0) {
        // User has seen everything, return top-rated venues
        return allVenues
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, limit)
      }
      
      // Get user's swipe history for learning
      const swipeHistory = await swipeService.getUserSwipes(userId)
      const likedVenues = swipeHistory.filter(s => s.action === 'like')
      
      // Score each unseen venue
      const scoredVenues = unseenVenues.map(venue => 
        this.scoreVenue(venue, preferences, likedVenues)
      )
      
      // Sort by score and return top N
      return scoredVenues
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(sv => sv.venue)
      
    } catch (error) {
      console.error('Error getting personalized venues:', error)
      
      // Fallback: return popular venues
      const { data } = await supabase
        .from('venues')
        .select('*')
        .order('rating', { ascending: false })
        .limit(limit)
      
      return data || []
    }
  },

  /**
   * Score a venue based on user preferences and behavior
   */
  scoreVenue(
    venue: Venue,
    preferences: UserPreferences,
    likedVenues: any[]
  ): ScoredVenue {
    let score = 0
    const reasons: string[] = []
    
    // Base score from venue quality (25% weight)
    const qualityScore = this.calculateQualityScore(venue)
    score += qualityScore * 0.25
    if (qualityScore > 0.7) {
      reasons.push('Highly rated')
    }
    
    // Category/Interest match (30% weight)
    const interestScore = this.calculateInterestScore(venue, preferences.interests)
    score += interestScore * 0.30
    if (interestScore > 0.5) {
      reasons.push(`Matches your interests in ${venue.category}`)
    }
    
    // Trait alignment (20% weight)
    const traitScore = this.calculateTraitScore(venue, preferences.traits)
    score += traitScore * 0.20
    if (traitScore > 0.5) {
      reasons.push('Fits your travel style')
    }
    
    // Budget alignment (15% weight)
    const budgetScore = this.calculateBudgetScore(venue, preferences.budgetLevel)
    score += budgetScore * 0.15
    if (budgetScore > 0.8) {
      reasons.push('Within your budget')
    }
    
    // Similarity to liked venues (10% weight)
    const similarityScore = this.calculateSimilarityScore(venue, likedVenues)
    score += similarityScore * 0.10
    if (similarityScore > 0.5) {
      reasons.push('Similar to places you liked')
    }
    
    // Diversity bonus - slightly boost different categories
    if (likedVenues.length > 0) {
      const likedCategories = likedVenues.map(v => v.venues?.category || '')
      if (!likedCategories.includes(venue.category)) {
        score += 0.05
        reasons.push('New experience')
      }
    }
    
    return { venue, score, reasons }
  },

  /**
   * Calculate quality score based on rating
   */
  calculateQualityScore(venue: Venue): number {
    const rating = venue.rating || 0
    
    // Normalize rating (0-5 scale)
    const ratingScore = rating / 5
    
    // For now, just use rating since we don't have reviews count in DB
    return ratingScore
  },

  /**
   * Calculate how well venue matches user interests
   */
  calculateInterestScore(venue: Venue, interests: string[]): number {
    if (interests.length === 0) return 0.5 // Neutral if no interests
    
    const venueTags = [venue.category, ...(venue.tags || [])].map(t => t.toLowerCase())
    const userInterests = interests.map(i => i.toLowerCase())
    
    // Count matches
    let matches = 0
    for (const interest of userInterests) {
      for (const tag of venueTags) {
        if (tag.includes(interest) || interest.includes(tag)) {
          matches++
          break
        }
      }
    }
    
    return Math.min(1, matches / Math.max(interests.length * 0.5, 1))
  },

  /**
   * Calculate how well venue matches user traits
   */
  calculateTraitScore(venue: Venue, traits: string[]): number {
    if (traits.length === 0) return 0.5 // Neutral if no traits
    
    // Map traits to venue characteristics
    const traitMap: Record<string, (venue: Venue) => boolean> = {
      'adventurous': (v) => ['outdoor', 'adventure', 'sports'].some(t => 
        v.tags?.some(tag => tag.toLowerCase().includes(t))
      ),
      'cultural': (v) => ['museum', 'art', 'culture', 'historic'].some(t => 
        v.tags?.some(tag => tag.toLowerCase().includes(t)) || v.category.toLowerCase().includes(t)
      ),
      'foodie': (v) => ['food', 'restaurant', 'cafe', 'market'].some(t => 
        v.tags?.some(tag => tag.toLowerCase().includes(t)) || v.category.toLowerCase().includes(t)
      ),
      'nightlife': (v) => ['nightlife', 'bar', 'club', 'entertainment'].some(t => 
        v.tags?.some(tag => tag.toLowerCase().includes(t))
      ),
      'relaxed': (v) => ['park', 'nature', 'spa', 'garden'].some(t => 
        v.tags?.some(tag => tag.toLowerCase().includes(t)) || v.category.toLowerCase().includes(t)
      ),
      'shopping': (v) => ['shopping', 'mall', 'market'].some(t => 
        v.tags?.some(tag => tag.toLowerCase().includes(t)) || v.category.toLowerCase().includes(t)
      ),
    }
    
    let matches = 0
    for (const trait of traits) {
      const checker = traitMap[trait.toLowerCase()]
      if (checker && checker(venue)) {
        matches++
      }
    }
    
    return Math.min(1, matches / traits.length)
  },

  /**
   * Calculate budget alignment
   */
  calculateBudgetScore(venue: Venue, budgetLevel: number): number {
    const venuePrice = venue.price_level || 2
    const difference = Math.abs(venuePrice - budgetLevel)
    
    // Perfect match = 1, each level difference reduces score
    return Math.max(0, 1 - (difference * 0.25))
  },

  /**
   * Calculate similarity to previously liked venues
   */
  calculateSimilarityScore(venue: Venue, likedVenues: any[]): number {
    if (likedVenues.length === 0) return 0.5 // Neutral if no history
    
    let totalSimilarity = 0
    
    for (const liked of likedVenues) {
      const likedVenue = liked.venues
      if (!likedVenue) continue
      
      let similarity = 0
      
      // Category match
      if (venue.category === likedVenue.category) {
        similarity += 0.4
      }
      
      // Tag overlap
      const venueTags = new Set(venue.tags?.map(t => t.toLowerCase()) || [])
      const likedTags = new Set(likedVenue.tags?.map(t => t.toLowerCase()) || [])
      const intersection = [...venueTags].filter(t => likedTags.has(t))
      const union = new Set([...venueTags, ...likedTags])
      
      if (union.size > 0) {
        similarity += (intersection.length / union.size) * 0.4
      }
      
      // Price level similarity
      const priceDiff = Math.abs((venue.price_level || 2) - (likedVenue.price_level || 2))
      similarity += Math.max(0, 1 - priceDiff * 0.2) * 0.2
      
      totalSimilarity += similarity
    }
    
    return totalSimilarity / likedVenues.length
  },

  /**
   * Get recommendation insights for a venue
   */
  getRecommendationReason(
    venue: Venue,
    preferences: UserPreferences,
    likedVenues: any[]
  ): string {
    const { reasons } = this.scoreVenue(venue, preferences, likedVenues)
    
    if (reasons.length === 0) {
      return `Popular ${venue.category.toLowerCase()} in New York`
    }
    
    return reasons[0] // Return top reason
  }
}