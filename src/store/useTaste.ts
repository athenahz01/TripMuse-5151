import { create } from 'zustand'
import { preferenceLearningManager } from '@/lib/preferenceLearning'

type TasteState = {
  userId: string
  recentTrip: string
  interests: string[]
  traits: string[]
  destination: string
  likes: string[]
  skips: string[]
  behaviorHistory: Array<{
    attractionId: string
    action: 'like' | 'skip' | 'view'
    timestamp: number
  }>
  setRecentTrip: (t: string) => void
  toggleInterest: (i: string) => void
  toggleTrait: (t: string) => void
  setDestination: (d: string) => void
  like: (id: string, attractionData?: any) => void
  skip: (id: string, attractionData?: any) => void
  view: (id: string, attractionData?: any) => void
  reset: () => void
  getLearningInsights: () => any
}

// Generate unique user ID
const generateUserId = () => {
  const stored = localStorage.getItem('tripmuse_user_id')
  if (stored) return stored
  
  const newId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  localStorage.setItem('tripmuse_user_id', newId)
  return newId
}

export const useTaste = create<TasteState>((set, get) => ({
  userId: generateUserId(),
  recentTrip: '',
  interests: [],
  traits: [],
  destination: '',
  likes: [],
  skips: [],
  behaviorHistory: [],
  setRecentTrip: (t) => set({ recentTrip: t }),
  toggleInterest: (i) => set(s => ({
    interests: s.interests.includes(i) ? s.interests.filter(x=>x!==i) : [...s.interests, i]
  })),
  toggleTrait: (t) => set(s => ({
    traits: s.traits.includes(t) ? s.traits.filter(x=>x!==t) : [...s.traits, t]
  })),
  setDestination: (d) => set({ destination: d }),
  like: (id, attractionData) => {
    const state = get()
    set({ likes: [...state.likes, id] })
    
    // Record behavior for ML learning
    if (attractionData) {
      const behavior = {
        userId: state.userId,
        attractionId: id,
        action: 'like' as const,
        timestamp: Date.now(),
        attractionFeatures: {
          id,
          title: attractionData.title || '',
          tags: attractionData.tags || [],
          rating: attractionData.rating || 0,
          reviews: attractionData.reviews || 0,
          priceLevel: attractionData.priceLevel,
          category: attractionData.tags?.[0] || 'General',
          location: {
            city: state.destination,
            country: state.destination,
          },
          features: {
            hasPhotos: !!attractionData.image,
            hasWebsite: !!attractionData.website,
            hasPhone: !!attractionData.phone,
            isOpenNow: attractionData.openNow
          }
        },
        context: {
          traits: state.traits,
          interests: state.interests,
          destination: state.destination,
          timeOfDay: getTimeOfDay(),
          dayOfWeek: new Date().getDay()
        }
      }
      
      preferenceLearningManager.recordBehavior(behavior)
      set({ 
        behaviorHistory: [...state.behaviorHistory, {
          attractionId: id,
          action: 'like',
          timestamp: Date.now()
        }]
      })
    }
  },
  skip: (id, attractionData) => {
    const state = get()
    set({ skips: [...state.skips, id] })
    
    // Record behavior for ML learning
    if (attractionData) {
      const behavior = {
        userId: state.userId,
        attractionId: id,
        action: 'skip' as const,
        timestamp: Date.now(),
        attractionFeatures: {
          id,
          title: attractionData.title || '',
          tags: attractionData.tags || [],
          rating: attractionData.rating || 0,
          reviews: attractionData.reviews || 0,
          priceLevel: attractionData.priceLevel,
          category: attractionData.tags?.[0] || 'General',
          location: {
            city: state.destination,
            country: state.destination,
          },
          features: {
            hasPhotos: !!attractionData.image,
            hasWebsite: !!attractionData.website,
            hasPhone: !!attractionData.phone,
            isOpenNow: attractionData.openNow
          }
        },
        context: {
          traits: state.traits,
          interests: state.interests,
          destination: state.destination,
          timeOfDay: getTimeOfDay(),
          dayOfWeek: new Date().getDay()
        }
      }
      
      preferenceLearningManager.recordBehavior(behavior)
      set({ 
        behaviorHistory: [...state.behaviorHistory, {
          attractionId: id,
          action: 'skip',
          timestamp: Date.now()
        }]
      })
    }
  },
  view: (id, attractionData) => {
    const state = get()
    
    // Record view behavior for ML learning
    if (attractionData) {
      const behavior = {
        userId: state.userId,
        attractionId: id,
        action: 'view' as const,
        timestamp: Date.now(),
        attractionFeatures: {
          id,
          title: attractionData.title || '',
          tags: attractionData.tags || [],
          rating: attractionData.rating || 0,
          reviews: attractionData.reviews || 0,
          priceLevel: attractionData.priceLevel,
          category: attractionData.tags?.[0] || 'General',
          location: {
            city: state.destination,
            country: state.destination,
          },
          features: {
            hasPhotos: !!attractionData.image,
            hasWebsite: !!attractionData.website,
            hasPhone: !!attractionData.phone,
            isOpenNow: attractionData.openNow
          }
        },
        context: {
          traits: state.traits,
          interests: state.interests,
          destination: state.destination,
          timeOfDay: getTimeOfDay(),
          dayOfWeek: new Date().getDay()
        }
      }
      
      preferenceLearningManager.recordBehavior(behavior)
      set({ 
        behaviorHistory: [...state.behaviorHistory, {
          attractionId: id,
          action: 'view',
          timestamp: Date.now()
        }]
      })
    }
  },
  reset: () => set({
    recentTrip: '', interests: [], traits: [], destination: '', likes: [], skips: [], behaviorHistory: []
  }),
  getLearningInsights: () => {
    const state = get()
    return preferenceLearningManager.getLearningInsights(state.userId)
  }
}))

// Helper function to get time of day
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}
