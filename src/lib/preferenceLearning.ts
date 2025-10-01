// Preference Learning System for Travel Taste Optimization
// Uses machine learning algorithms to learn and optimize user preferences

export interface UserBehavior {
  userId: string
  attractionId: string
  action: 'like' | 'skip' | 'view' | 'save'
  timestamp: number
  attractionFeatures: AttractionFeatures
  context: UserContext
}

export interface AttractionFeatures {
  id: string
  title: string
  tags: string[]
  rating: number
  reviews: number
  priceLevel?: number
  category: string
  location: {
    city: string
    country: string
    coordinates?: { lat: number; lng: number }
  }
  features: {
    hasPhotos: boolean
    hasWebsite: boolean
    hasPhone: boolean
    isOpenNow?: boolean
  }
}

export interface UserContext {
  traits: string[]
  interests: string[]
  destination: string
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  dayOfWeek: number // 0-6
  season?: 'spring' | 'summer' | 'fall' | 'winter'
}

export interface UserProfile {
  userId: string
  preferences: {
    tagWeights: Record<string, number>
    categoryWeights: Record<string, number>
    featureWeights: Record<string, number>
    contextWeights: Record<string, number>
  }
  behaviorHistory: UserBehavior[]
  learningMetrics: {
    totalInteractions: number
    lastUpdated: number
    confidence: number
  }
}

// Collaborative Filtering System
export class CollaborativeFiltering {
  private userSimilarityMatrix: Map<string, Map<string, number>> = new Map()
  private itemSimilarityMatrix: Map<string, Map<string, number>> = new Map()

  // Calculate user similarity based on behavior patterns
  calculateUserSimilarity(user1: string, user2: string, behaviors: UserBehavior[]): number {
    const user1Behaviors = behaviors.filter(b => b.userId === user1)
    const user2Behaviors = behaviors.filter(b => b.userId === user2)
    
    if (user1Behaviors.length === 0 || user2Behaviors.length === 0) return 0

    // Jaccard similarity for liked attractions
    const user1Liked = new Set(user1Behaviors.filter(b => b.action === 'like').map(b => b.attractionId))
    const user2Liked = new Set(user2Behaviors.filter(b => b.action === 'like').map(b => b.attractionId))
    
    const intersection = new Set([...user1Liked].filter(id => user2Liked.has(id)))
    const union = new Set([...user1Liked, ...user2Liked])
    
    return intersection.size / union.size
  }

  // Get similar users
  getSimilarUsers(userId: string, behaviors: UserBehavior[], limit: number = 10): string[] {
    const allUsers = [...new Set(behaviors.map(b => b.userId))]
    const similarities = allUsers
      .filter(id => id !== userId)
      .map(id => ({
        userId: id,
        similarity: this.calculateUserSimilarity(userId, id, behaviors)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .filter(u => u.similarity > 0.1)
    
    return similarities.map(u => u.userId)
  }

  // Get recommendations from similar users
  getCollaborativeRecommendations(
    userId: string, 
    behaviors: UserBehavior[], 
    attractions: AttractionFeatures[]
  ): AttractionFeatures[] {
    const similarUsers = this.getSimilarUsers(userId, behaviors)
    const userLiked = new Set(
      behaviors
        .filter(b => b.userId === userId && b.action === 'like')
        .map(b => b.attractionId)
    )

    const recommendations = new Map<string, { attraction: AttractionFeatures; score: number }>()

    for (const similarUserId of similarUsers) {
      const similarUserLiked = behaviors
        .filter(b => b.userId === similarUserId && b.action === 'like')
        .map(b => b.attractionId)

      for (const attractionId of similarUserLiked) {
        if (!userLiked.has(attractionId)) {
          const attraction = attractions.find(a => a.id === attractionId)
          if (attraction) {
            const currentScore = recommendations.get(attractionId)?.score || 0
            const similarity = this.calculateUserSimilarity(userId, similarUserId, behaviors)
            recommendations.set(attractionId, {
              attraction,
              score: currentScore + similarity
            })
          }
        }
      }
    }

    return Array.from(recommendations.values())
      .sort((a, b) => b.score - a.score)
      .map(r => r.attraction)
  }
}

// Content-Based Filtering System
export class ContentBasedFiltering {
  // Calculate feature weights based on user behavior
  calculateFeatureWeights(behaviors: UserBehavior[]): Record<string, number> {
    const weights: Record<string, number> = {}
    const likedBehaviors = behaviors.filter(b => b.action === 'like')
    const skippedBehaviors = behaviors.filter(b => b.action === 'skip')

    // Extract all features from liked and skipped attractions
    const likedFeatures = this.extractFeatures(likedBehaviors)
    const skippedFeatures = this.extractFeatures(skippedBehaviors)

    // Calculate weights based on feature frequency and user preference
    const allFeatures = new Set([...Object.keys(likedFeatures), ...Object.keys(skippedFeatures)])
    
    for (const feature of allFeatures) {
      const likedCount = likedFeatures[feature] || 0
      const skippedCount = skippedFeatures[feature] || 0
      const totalCount = likedCount + skippedCount
      
      if (totalCount > 0) {
        // Weight = (liked_count - skipped_count) / total_count
        weights[feature] = (likedCount - skippedCount) / totalCount
      }
    }

    return weights
  }

  // Extract features from behaviors
  private extractFeatures(behaviors: UserBehavior[]): Record<string, number> {
    const features: Record<string, number> = {}
    
    for (const behavior of behaviors) {
      const { attractionFeatures } = behavior
      
      // Tag features
      for (const tag of attractionFeatures.tags) {
        features[`tag_${tag.toLowerCase()}`] = (features[`tag_${tag.toLowerCase()}`] || 0) + 1
      }
      
      // Category features
      features[`category_${attractionFeatures.category.toLowerCase()}`] = 
        (features[`category_${attractionFeatures.category.toLowerCase()}`] || 0) + 1
      
      // Rating features (binned)
      const ratingBin = Math.floor(attractionFeatures.rating)
      features[`rating_${ratingBin}`] = (features[`rating_${ratingBin}`] || 0) + 1
      
      // Price level features
      if (attractionFeatures.priceLevel !== undefined) {
        features[`price_${attractionFeatures.priceLevel}`] = 
          (features[`price_${attractionFeatures.priceLevel}`] || 0) + 1
      }
      
      // Feature presence
      if (attractionFeatures.features.hasPhotos) {
        features['has_photos'] = (features['has_photos'] || 0) + 1
      }
      if (attractionFeatures.features.hasWebsite) {
        features['has_website'] = (features['has_website'] || 0) + 1
      }
    }
    
    return features
  }

  // Score attractions based on learned preferences
  scoreAttractions(
    attractions: AttractionFeatures[], 
    userProfile: UserProfile
  ): Array<{ attraction: AttractionFeatures; score: number }> {
    const { preferences } = userProfile
    
    return attractions.map(attraction => {
      let score = 0
      
      // Tag-based scoring
      for (const tag of attraction.tags) {
        const tagWeight = preferences.tagWeights[`tag_${tag.toLowerCase()}`] || 0
        score += tagWeight
      }
      
      // Category-based scoring
      const categoryWeight = preferences.categoryWeights[`category_${attraction.category.toLowerCase()}`] || 0
      score += categoryWeight
      
      // Rating-based scoring
      const ratingBin = Math.floor(attraction.rating)
      const ratingWeight = preferences.tagWeights[`rating_${ratingBin}`] || 0
      score += ratingWeight
      
      // Price level scoring
      if (attraction.priceLevel !== undefined) {
        const priceWeight = preferences.tagWeights[`price_${attraction.priceLevel}`] || 0
        score += priceWeight
      }
      
      // Feature presence scoring
      if (attraction.features.hasPhotos) {
        score += preferences.featureWeights['has_photos'] || 0
      }
      if (attraction.features.hasWebsite) {
        score += preferences.featureWeights['has_website'] || 0
      }
      
      return { attraction, score }
    })
  }
}

// Hybrid Recommendation System
export class HybridRecommendationSystem {
  private collaborativeFiltering: CollaborativeFiltering
  private contentBasedFiltering: ContentBasedFiltering

  constructor() {
    this.collaborativeFiltering = new CollaborativeFiltering()
    this.contentBasedFiltering = new ContentBasedFiltering()
  }

  // Generate hybrid recommendations
  generateRecommendations(
    userId: string,
    userProfile: UserProfile,
    behaviors: UserBehavior[],
    attractions: AttractionFeatures[],
    weights: { collaborative: number; contentBased: number } = { collaborative: 0.3, contentBased: 0.7 }
  ): AttractionFeatures[] {
    // Get collaborative recommendations
    const collaborativeRecs = this.collaborativeFiltering.getCollaborativeRecommendations(
      userId, 
      behaviors, 
      attractions
    )

    // Get content-based recommendations
    const contentBasedScores = this.contentBasedFiltering.scoreAttractions(attractions, userProfile)
    const contentBasedRecs = contentBasedScores
      .sort((a, b) => b.score - a.score)
      .map(s => s.attraction)

    // Combine recommendations
    const combinedRecs = new Map<string, { attraction: AttractionFeatures; score: number }>()

    // Add collaborative recommendations
    for (let i = 0; i < collaborativeRecs.length; i++) {
      const attraction = collaborativeRecs[i]
      const score = weights.collaborative * (1 - i / collaborativeRecs.length)
      combinedRecs.set(attraction.id, { attraction, score })
    }

    // Add content-based recommendations
    for (let i = 0; i < contentBasedRecs.length; i++) {
      const attraction = contentBasedRecs[i]
      const existingScore = combinedRecs.get(attraction.id)?.score || 0
      const contentScore = weights.contentBased * (1 - i / contentBasedRecs.length)
      combinedRecs.set(attraction.id, { 
        attraction, 
        score: existingScore + contentScore 
      })
    }

    return Array.from(combinedRecs.values())
      .sort((a, b) => b.score - a.score)
      .map(r => r.attraction)
  }

  // Update user profile based on new behavior
  updateUserProfile(
    userProfile: UserProfile,
    newBehavior: UserBehavior
  ): UserProfile {
    const updatedBehaviors = [...userProfile.behaviorHistory, newBehavior]
    
    // Recalculate preferences
    const tagWeights = this.contentBasedFiltering.calculateFeatureWeights(updatedBehaviors)
    const categoryWeights = this.calculateCategoryWeights(updatedBehaviors)
    const featureWeights = this.calculateFeatureWeights(updatedBehaviors)
    const contextWeights = this.calculateContextWeights(updatedBehaviors)

    return {
      ...userProfile,
      behaviorHistory: updatedBehaviors,
      preferences: {
        tagWeights,
        categoryWeights,
        featureWeights,
        contextWeights
      },
      learningMetrics: {
        totalInteractions: updatedBehaviors.length,
        lastUpdated: Date.now(),
        confidence: Math.min(1, updatedBehaviors.length / 50) // Confidence based on interaction count
      }
    }
  }

  private calculateCategoryWeights(behaviors: UserBehavior[]): Record<string, number> {
    const weights: Record<string, number> = {}
    const likedBehaviors = behaviors.filter(b => b.action === 'like')
    const skippedBehaviors = behaviors.filter(b => b.action === 'skip')

    const likedCategories = likedBehaviors.map(b => b.attractionFeatures.category)
    const skippedCategories = skippedBehaviors.map(b => b.attractionFeatures.category)

    const allCategories = new Set([...likedCategories, ...skippedCategories])

    for (const category of allCategories) {
      const likedCount = likedCategories.filter(c => c === category).length
      const skippedCount = skippedCategories.filter(c => c === category).length
      const totalCount = likedCount + skippedCount

      if (totalCount > 0) {
        weights[category.toLowerCase()] = (likedCount - skippedCount) / totalCount
      }
    }

    return weights
  }

  private calculateFeatureWeights(behaviors: UserBehavior[]): Record<string, number> {
    const weights: Record<string, number> = {}
    const likedBehaviors = behaviors.filter(b => b.action === 'like')
    const skippedBehaviors = behaviors.filter(b => b.action === 'skip')

    const features = ['hasPhotos', 'hasWebsite', 'hasPhone', 'isOpenNow']
    
    for (const feature of features) {
      const likedCount = likedBehaviors.filter(b => 
        b.attractionFeatures.features[feature as keyof typeof b.attractionFeatures.features]
      ).length
      
      const skippedCount = skippedBehaviors.filter(b => 
        b.attractionFeatures.features[feature as keyof typeof b.attractionFeatures.features]
      ).length
      
      const totalCount = likedCount + skippedCount
      
      if (totalCount > 0) {
        weights[feature] = (likedCount - skippedCount) / totalCount
      }
    }

    return weights
  }

  private calculateContextWeights(behaviors: UserBehavior[]): Record<string, number> {
    const weights: Record<string, number> = {}
    const likedBehaviors = behaviors.filter(b => b.action === 'like')
    const skippedBehaviors = behaviors.filter(b => b.action === 'skip')

    // Time-based preferences
    const timeSlots = ['morning', 'afternoon', 'evening', 'night']
    for (const timeSlot of timeSlots) {
      const likedCount = likedBehaviors.filter(b => b.context.timeOfDay === timeSlot).length
      const skippedCount = skippedBehaviors.filter(b => b.context.timeOfDay === timeSlot).length
      const totalCount = likedCount + skippedCount

      if (totalCount > 0) {
        weights[`time_${timeSlot}`] = (likedCount - skippedCount) / totalCount
      }
    }

    // Day of week preferences
    for (let day = 0; day < 7; day++) {
      const likedCount = likedBehaviors.filter(b => b.context.dayOfWeek === day).length
      const skippedCount = skippedBehaviors.filter(b => b.context.dayOfWeek === day).length
      const totalCount = likedCount + skippedCount

      if (totalCount > 0) {
        weights[`day_${day}`] = (likedCount - skippedCount) / totalCount
      }
    }

    return weights
  }
}

// Preference Learning Manager
export class PreferenceLearningManager {
  private hybridSystem: HybridRecommendationSystem
  private userProfiles: Map<string, UserProfile> = new Map()

  constructor() {
    this.hybridSystem = new HybridRecommendationSystem()
  }

  // Initialize or get user profile
  getUserProfile(userId: string): UserProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        preferences: {
          tagWeights: {},
          categoryWeights: {},
          featureWeights: {},
          contextWeights: {}
        },
        behaviorHistory: [],
        learningMetrics: {
          totalInteractions: 0,
          lastUpdated: Date.now(),
          confidence: 0
        }
      })
    }
    return this.userProfiles.get(userId)!
  }

  // Record user behavior
  recordBehavior(behavior: UserBehavior): void {
    const userProfile = this.getUserProfile(behavior.userId)
    const updatedProfile = this.hybridSystem.updateUserProfile(userProfile, behavior)
    this.userProfiles.set(behavior.userId, updatedProfile)
  }

  // Get personalized recommendations
  getPersonalizedRecommendations(
    userId: string,
    attractions: AttractionFeatures[],
    allBehaviors: UserBehavior[] = []
  ): AttractionFeatures[] {
    const userProfile = this.getUserProfile(userId)
    
    if (userProfile.learningMetrics.totalInteractions < 5) {
      // Not enough data for personalization, return popular attractions
      return attractions
        .sort((a, b) => (b.rating * Math.log(b.reviews + 1)) - (a.rating * Math.log(a.reviews + 1)))
        .slice(0, 20)
    }

    return this.hybridSystem.generateRecommendations(
      userId,
      userProfile,
      allBehaviors,
      attractions
    )
  }

  // Get learning insights
  getLearningInsights(userId: string): {
    confidence: number
    totalInteractions: number
    topPreferences: Array<{ feature: string; weight: number }>
    recommendations: string[]
  } {
    const userProfile = this.getUserProfile(userId)
    const { preferences, learningMetrics } = userProfile

    // Get top preferences
    const allWeights = [
      ...Object.entries(preferences.tagWeights).map(([k, v]) => ({ feature: k, weight: v })),
      ...Object.entries(preferences.categoryWeights).map(([k, v]) => ({ feature: k, weight: v })),
      ...Object.entries(preferences.featureWeights).map(([k, v]) => ({ feature: k, weight: v }))
    ]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10)

    return {
      confidence: learningMetrics.confidence,
      totalInteractions: learningMetrics.totalInteractions,
      topPreferences: allWeights,
      recommendations: [
        'Try more attractions to improve recommendations',
        'Rate attractions you visit to help the system learn',
        'Explore different types of attractions for better diversity'
      ]
    }
  }
}

// Export singleton instance
export const preferenceLearningManager = new PreferenceLearningManager()



