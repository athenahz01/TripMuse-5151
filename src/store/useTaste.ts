import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { preferenceLearningManager, UserBehavior } from '@/lib/preferenceLearning'

export interface Venue {
  id: string
  name: string
  category: string
  description: string
  location: {
    lat: number
    lng: number
    address: string
  }
  price_level: number
  rating: number
  photos: string[]
  tags: string[]
  google_place_id?: string
}

type TasteState = {
  // User identity
  userId: string
  
  // Onboarding flow
  recentTrip: string
  interests: string[]
  traits: string[]
  destination: string
  budgetLevel: number
  travelStyle: string
  
  // Swipe state
  likes: string[]
  skips: string[]
  savedVenues: string[]
  
  // Behavior tracking
  behaviorHistory: Array<{
    attractionId: string
    action: 'like' | 'skip' | 'view'
    timestamp: number
  }>
  
  // Venues data
  venues: Venue[]
  currentVenueIndex: number
  
  // Session tracking
  sessionStartTime: number
  cardViewStartTime: number
  
  // Actions - Onboarding
  setRecentTrip: (t: string) => void
  toggleInterest: (i: string) => void
  toggleTrait: (t: string) => void
  setDestination: (d: string) => void
  setBudgetLevel: (level: number) => void
  setTravelStyle: (style: string) => void
  
  // Actions - Swipe
  like: (id: string, attractionData?: any) => void
  skip: (id: string, attractionData?: any) => void
  view: (id: string, attractionData?: any) => void
  
  // Actions - Save/Bookmark
  saveVenue: (venueId: string) => void
  unsaveVenue: (venueId: string) => void
  
  // Actions - Venues
  setVenues: (venues: Venue[]) => void
  setCurrentVenueIndex: (index: number) => void
  
  // Actions - Session
  setCardViewStartTime: (time: number) => void
  
  // Utilities
  reset: () => void
  getLearningInsights: () => any
  getSwipedVenueIds: () => string[]
}

// Generate unique user ID
const generateUserId = () => {
  const stored = localStorage.getItem('tripmuse_user_id')
  if (stored) return stored
  
  const newId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  localStorage.setItem('tripmuse_user_id', newId)
  return newId
}

// Helper to get time of day
const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours()
  if (hour < 6) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'night'
}

const initialState = {
  userId: generateUserId(),
  recentTrip: '',
  interests: [],
  traits: [],
  destination: 'New York',
  budgetLevel: 2,
  travelStyle: 'solo',
  likes: [],
  skips: [],
  savedVenues: [],
  behaviorHistory: [],
  venues: [],
  currentVenueIndex: 0,
  sessionStartTime: Date.now(),
  cardViewStartTime: Date.now(),
}

export const useTaste = create<TasteState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Onboarding actions
      setRecentTrip: (t) => set({ recentTrip: t }),
      
      toggleInterest: (i) => set(s => ({
        interests: s.interests.includes(i) 
          ? s.interests.filter(x => x !== i) 
          : [...s.interests, i]
      })),
      
      toggleTrait: (t) => set(s => ({
        traits: s.traits.includes(t) 
          ? s.traits.filter(x => x !== t) 
          : [...s.traits, t]
      })),
      
      setDestination: (d) => set({ destination: d }),
      
      setBudgetLevel: (level) => set({ budgetLevel: level }),
      
      setTravelStyle: (style) => set({ travelStyle: style }),
      
      // Swipe actions
      like: (id, attractionData) => {
        const state = get()
        set({ likes: [...state.likes, id] })
        
        // Record behavior for ML learning
        if (attractionData) {
          const behavior: UserBehavior = {
            userId: state.userId,
            attractionId: id,
            action: 'like',
            timestamp: Date.now(),
            attractionFeatures: {
              id,
              title: attractionData.title || attractionData.name || '',
              tags: attractionData.tags || [],
              rating: attractionData.rating || 0,
              reviews: attractionData.reviews || 0,
              priceLevel: attractionData.priceLevel || attractionData.price_level,
              category: attractionData.category || attractionData.tags?.[0] || 'General',
              location: {
                city: state.destination,
                country: 'USA',
              },
              features: {
                hasPhotos: !!(attractionData.image || attractionData.photos?.length),
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
          const behavior: UserBehavior = {
            userId: state.userId,
            attractionId: id,
            action: 'skip',
            timestamp: Date.now(),
            attractionFeatures: {
              id,
              title: attractionData.title || attractionData.name || '',
              tags: attractionData.tags || [],
              rating: attractionData.rating || 0,
              reviews: attractionData.reviews || 0,
              priceLevel: attractionData.priceLevel || attractionData.price_level,
              category: attractionData.category || attractionData.tags?.[0] || 'General',
              location: {
                city: state.destination,
                country: 'USA',
              },
              features: {
                hasPhotos: !!(attractionData.image || attractionData.photos?.length),
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
        set({ 
          behaviorHistory: [...state.behaviorHistory, {
            attractionId: id,
            action: 'view',
            timestamp: Date.now()
          }]
        })
        
        if (attractionData) {
          const behavior: UserBehavior = {
            userId: state.userId,
            attractionId: id,
            action: 'view',
            timestamp: Date.now(),
            attractionFeatures: {
              id,
              title: attractionData.title || attractionData.name || '',
              tags: attractionData.tags || [],
              rating: attractionData.rating || 0,
              reviews: attractionData.reviews || 0,
              priceLevel: attractionData.priceLevel || attractionData.price_level,
              category: attractionData.category || attractionData.tags?.[0] || 'General',
              location: {
                city: state.destination,
                country: 'USA',
              },
              features: {
                hasPhotos: !!(attractionData.image || attractionData.photos?.length),
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
        }
      },
      
      // Save/Bookmark actions
      saveVenue: (venueId) => set(s => ({
        savedVenues: [...s.savedVenues, venueId]
      })),
      
      unsaveVenue: (venueId) => set(s => ({
        savedVenues: s.savedVenues.filter(id => id !== venueId)
      })),
      
      // Venues actions
      setVenues: (venues) => set({ venues }),
      
      setCurrentVenueIndex: (index) => set({ currentVenueIndex: index }),
      
      // Session tracking
      setCardViewStartTime: (time) => set({ cardViewStartTime: time }),
      
      // Utilities
      reset: () => set(initialState),
      
      getLearningInsights: () => {
        const state = get()
        return preferenceLearningManager.getLearningInsights(state.userId)
      },
      
      getSwipedVenueIds: () => {
        const state = get()
        return [...state.likes, ...state.skips]
      },
    }),
    {
      name: 'tripmuse-taste-storage',
      partialize: (state) => ({
        userId: state.userId,
        recentTrip: state.recentTrip,
        interests: state.interests,
        traits: state.traits,
        destination: state.destination,
        budgetLevel: state.budgetLevel,
        travelStyle: state.travelStyle,
        likes: state.likes,
        skips: state.skips,
        savedVenues: state.savedVenues,
      }),
    }
  )
)