import { supabase } from '../lib/supabase'
import { Venue } from '../store/useTaste'
import { swipeService } from '../services/swipeService'

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
      
      console.log(`📊 Total venues in DB: ${allVenues.length}`)
      
      // Get venues user has already swiped
      const swipedVenueIds = await swipeService.getSwipedVenueIds(userId)
      console.log(`👆 User has swiped: ${swipedVenueIds.length} venues`)
      
      // Filter out already swiped venues
      const unseenVenues = allVenues.filter(v => !swipedVenueIds.includes(v.id))
      console.log(`👀 Unseen venues: ${unseenVenues.length}`)
      
      if (unseenVenues.length === 0) {
        // User has seen everything, return top-rated venues
        return allVenues
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, limit)
      }
      
      // Get user's swipe history for learning
      const swipeHistory = await swipeService.getUserSwipes(userId)
      const likedVenues = swipeHistory.filter(s => s.action === 'like')
      const dislikedVenues = swipeHistory.filter(s => s.action === 'dislike')
      
      console.log(`❤️ Liked: ${likedVenues.length} venues`)
      console.log(`👎 Disliked: ${dislikedVenues.length} venues`)
      
      // LEARNING: Extract patterns from liked venues
      const likedCategories = new Set(likedVenues.map(v => v.venues?.category).filter(Boolean))
      const likedTags = new Set(
        likedVenues.flatMap(v => v.venues?.tags || []).map(t => t.toLowerCase())
      )
      
      // LEARNING: Extract anti-patterns from disliked venues
      const dislikedCategories = new Set(dislikedVenues.map(v => v.venues?.category).filter(Boolean))
      const dislikedTags = new Set(
        dislikedVenues.flatMap(v => v.venues?.tags || []).map(t => t.toLowerCase())
      )
      
      console.log(`📚 Learning patterns:`)
      console.log(`  Liked categories:`, Array.from(likedCategories))
      console.log(`  Disliked categories:`, Array.from(dislikedCategories))
      
      // Score each unseen venue with learned preferences
      const scoredVenues = unseenVenues.map(venue => {
        const baseScore = this.scoreVenue(venue, preferences, likedVenues)
        
        // BOOST: Venues in liked categories
        if (likedCategories.has(venue.category)) {
          baseScore.score += 0.2
          baseScore.reasons.unshift('✨ Category you loved!')
        }
        
        // BOOST: Venues with liked tags
        const venueTags = venue.tags?.map(t => t.toLowerCase()) || []
        const matchingLikedTags = venueTags.filter(t => likedTags.has(t))
        if (matchingLikedTags.length > 0) {
          baseScore.score += 0.15 * matchingLikedTags.length
          baseScore.reasons.unshift(`🎯 Has ${matchingLikedTags[0]} (you liked this!)`)
        }
        
        // PENALTY: Venues in disliked categories
        if (dislikedCategories.has(venue.category)) {
          baseScore.score -= 0.3
        }
        
        // PENALTY: Venues with disliked tags
        const matchingDislikedTags = venueTags.filter(t => dislikedTags.has(t))
        if (matchingDislikedTags.length > 0) {
          baseScore.score -= 0.2 * matchingDislikedTags.length
        }
        
        return baseScore
      })
      
      // Sort by adjusted score
      scoredVenues.sort((a, b) => b.score - a.score)
      
      // Show top 10 scores for debugging
      console.log(`\n🏆 Top 10 recommended venues:`)
      scoredVenues.slice(0, 10).forEach((sv, i) => {
        console.log(`  ${i + 1}. ${sv.venue.name} (${sv.venue.category}) - Score: ${sv.score.toFixed(2)}`)
        console.log(`     Reasons: ${sv.reasons.join(', ')}`)
      })
      
      // STRICTER FILTERING based on learned preferences
      let minScore = 0.3
      
      // If user has liked stuff, be more selective
      if (likedVenues.length > 3) {
        minScore = 0.4
        console.log(`🎓 User has history, using stricter threshold: ${minScore}`)
      }
      
      const goodMatches = scoredVenues.filter(sv => sv.score >= minScore)
      
      // If we filtered out too many, relax the threshold
      let finalVenues = goodMatches
      if (goodMatches.length < 10) {
        console.log('⚠️ Strict filtering left too few venues, relaxing threshold')
        finalVenues = scoredVenues.filter(sv => sv.score >= 0.2)
      }
      
      // If still too few, just take top scorers
      if (finalVenues.length < 5) {
        console.log('⚠️ Still too few venues, showing top-scored')
        finalVenues = scoredVenues.slice(0, 20)
      }
      
      console.log(`\n✅ Returning ${Math.min(finalVenues.length, limit)} venues\n`)
      
      // Return top N
      return finalVenues
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
    const venueDescription = `${venue.name} ${venue.description || ''}`.toLowerCase()
    const userInterests = interests.map(i => i.toLowerCase())
    
    // Enhanced matching - check tags, category, name, and description
    let matches = 0
    let strongMatches = 0
    
    for (const interest of userInterests) {
      // Strong match: interest in category or primary tags
      if (venue.category.toLowerCase().includes(interest) || interest.includes(venue.category.toLowerCase())) {
        strongMatches++
        matches++
        continue
      }
      
      // Good match: interest in any tag
      for (const tag of venueTags) {
        if (tag.includes(interest) || interest.includes(tag)) {
          matches++
          break
        }
      }
      
      // Weak match: interest in name or description
      if (venueDescription.includes(interest)) {
        matches += 0.5
      }
    }
    
    // Weight strong matches more heavily
    const score = (strongMatches * 2 + matches) / (userInterests.length * 2)
    return Math.min(1, score)
  },

  /**
   * Calculate how well venue matches user traits
   */
  calculateTraitScore(venue: Venue, traits: string[]): number {
    if (traits.length === 0) return 0.5 // Neutral if no traits
    
    const venueTags = [venue.category, ...(venue.tags || [])].map(t => t.toLowerCase())
    const venueText = `${venue.name} ${venue.description || ''}`.toLowerCase()
    
    // Enhanced trait mapping with more keywords
    const traitMap: Record<string, (venue: Venue) => boolean> = {
      'adventurous': (v) => {
        const keywords = ['adventure', 'outdoor', 'sports', 'hiking', 'climbing', 'kayak', 'zip', 'thrill']
        return keywords.some(k => 
          v.tags?.some(tag => tag.toLowerCase().includes(k)) || 
          venueText.includes(k)
        )
      },
      'cultural': (v) => {
        const keywords = ['museum', 'art', 'culture', 'historic', 'gallery', 'theater', 'theatre', 'heritage', 'memorial']
        return keywords.some(k => 
          v.tags?.some(tag => tag.toLowerCase().includes(k)) || 
          v.category.toLowerCase().includes(k) ||
          venueText.includes(k)
        )
      },
      'foodie': (v) => {
        const keywords = ['food', 'restaurant', 'cafe', 'market', 'dining', 'culinary', 'bakery', 'cuisine']
        return keywords.some(k => 
          v.tags?.some(tag => tag.toLowerCase().includes(k)) || 
          v.category.toLowerCase().includes(k) ||
          venueText.includes(k)
        )
      },
      'nightlife': (v) => {
        const keywords = ['nightlife', 'bar', 'club', 'entertainment', 'night', 'lounge', 'pub']
        return keywords.some(k => 
          v.tags?.some(tag => tag.toLowerCase().includes(k)) ||
          venueText.includes(k)
        )
      },
      'relaxed': (v) => {
        const keywords = ['park', 'nature', 'spa', 'garden', 'peaceful', 'calm', 'beach', 'relax']
        return keywords.some(k => 
          v.tags?.some(tag => tag.toLowerCase().includes(k)) || 
          v.category.toLowerCase().includes(k) ||
          venueText.includes(k)
        )
      },
      'nature': (v) => {
        const keywords = ['park', 'nature', 'garden', 'beach', 'outdoor', 'forest', 'trail', 'botanical', 'wildlife']
        return keywords.some(k => 
          v.tags?.some(tag => tag.toLowerCase().includes(k)) || 
          v.category.toLowerCase().includes(k) ||
          venueText.includes(k)
        )
      },
      'beach': (v) => {
        const keywords = ['beach', 'shore', 'coast', 'ocean', 'sea', 'waterfront', 'boardwalk']
        return keywords.some(k => 
          v.tags?.some(tag => tag.toLowerCase().includes(k)) ||
          v.name.toLowerCase().includes(k) ||
          venueText.includes(k)
        )
      },
      'shopping': (v) => {
        const keywords = ['shopping', 'mall', 'market', 'boutique', 'store', 'retail']
        return keywords.some(k => 
          v.tags?.some(tag => tag.toLowerCase().includes(k)) || 
          v.category.toLowerCase().includes(k) ||
          venueText.includes(k)
        )
      },
      'wellness': (v) => {
        const keywords = ['spa', 'wellness', 'yoga', 'fitness', 'health', 'meditation', 'relaxation']
        return keywords.some(k => 
          v.tags?.some(tag => tag.toLowerCase().includes(k)) ||
          venueText.includes(k)
        )
      },
      'photography': (v) => {
        const keywords = ['scenic', 'view', 'photo', 'landmark', 'observation', 'lookout', 'bridge', 'architecture']
        return keywords.some(k => 
          v.tags?.some(tag => tag.toLowerCase().includes(k)) ||
          venueText.includes(k)
        )
      },
      'art': (v) => {
        const keywords = ['art', 'gallery', 'museum', 'sculpture', 'painting', 'exhibit', 'artist']
        return keywords.some(k => 
          v.tags?.some(tag => tag.toLowerCase().includes(k)) ||
          v.category.toLowerCase().includes(k) ||
          venueText.includes(k)
        )
      },
      'history': (v) => {
        const keywords = ['historic', 'history', 'heritage', 'memorial', 'monument', 'museum', 'ancient']
        return keywords.some(k => 
          v.tags?.some(tag => tag.toLowerCase().includes(k)) ||
          v.category.toLowerCase().includes(k) ||
          venueText.includes(k)
        )
      }
    }
    
    let matches = 0
    for (const trait of traits) {
      const checker = traitMap[trait.toLowerCase()]
      if (checker && checker(venue)) {
        matches++
      }
    }
    
    return matches > 0 ? Math.min(1, matches / traits.length) : 0
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