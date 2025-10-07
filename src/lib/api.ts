// Enhanced APIs for photos + attractions + info.
// - Photos: Unsplash, Pexels, Pixabay (fallback chain)
// - Attractions: Google Places, Foursquare, TripAdvisor
// - Info: Wikipedia, Google Places details

// Environment variable access that works in both browser and Node.js
const UNSPLASH_KEY = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;
  }
  return process.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;
})();

const PEXELS_KEY = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_PEXELS_KEY as string | undefined;
  }
  return process.env.VITE_PEXELS_KEY as string | undefined;
})();

const GOOGLE_PLACES_KEY = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_GOOGLE_PLACES_KEY as string | undefined;
  }
  return process.env.VITE_GOOGLE_PLACES_KEY as string | undefined;
})();

const FOURSQUARE_KEY = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_FOURSQUARE_KEY as string | undefined;
  }
  return process.env.VITE_FOURSQUARE_KEY as string | undefined;
})();

// Cache for API responses
const cache = new Map<string, any>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCached(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

// Image API types
type UnsplashPhoto = {
  urls: { regular: string; small: string; thumb: string }
  alt_description?: string | null
  user?: { name?: string }
}

type PexelsPhoto = {
  src: { large: string; medium: string; small: string }
  alt?: string
  photographer?: string
}

type PixabayPhoto = {
  webformatURL: string
  largeImageURL: string
  tags: string
}

// Google Places types
type GooglePlace = {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  price_level?: number
  photos?: Array<{ photo_reference: string }>
  types: string[]
  vicinity?: string
  formatted_address?: string
  website?: string
  formatted_phone_number?: string
  opening_hours?: { open_now: boolean }
  geometry?: {
    location?: {
      lat: number
      lng: number
    }
  }
}

type GooglePlaceDetails = {
  result: {
    name: string
    rating?: number
    user_ratings_total?: number
    photos?: Array<{ photo_reference: string }>
    reviews?: Array<{
      author_name: string
      rating: number
      text: string
    }>
    website?: string
    formatted_phone_number?: string
    opening_hours?: { open_now: boolean }
  }
}

// Foursquare types
type FoursquareVenue = {
  id: string
  name: string
  location: {
    address?: string
    lat: number
    lng: number
    distance?: number
  }
  categories: Array<{
    id: string
    name: string
    shortName: string
  }>
  rating?: number
  ratingSignals?: number
  photos?: {
    count: number
    groups: Array<{
      items: Array<{
        id: string
        prefix: string
        suffix: string
        width: number
        height: number
      }>
    }>
  }
}

// Wikipedia types
type WikiSummary = {
  title: string
  extract?: string
  description?: string
  thumbnail?: { source: string; width: number; height: number }
}

// Image fetching with fallback chain - improved matching
export async function fetchImage(query: string, destination: string): Promise<string | null> {
  const cacheKey = `image_${query}_${destination}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  // Try specific venue name first, then add destination
  const searchQuery = query.trim()
  
  // Try Unsplash with specific venue name
  let unsplashUrl = await fetchUnsplashImage(searchQuery)
  if (unsplashUrl) {
    setCache(cacheKey, unsplashUrl)
    return unsplashUrl
  }

  // Try with destination added
  const searchWithDestination = `${query} ${destination}`.trim()
  unsplashUrl = await fetchUnsplashImage(searchWithDestination)
  if (unsplashUrl) {
    setCache(cacheKey, unsplashUrl)
    return unsplashUrl
  }

  // Try Pexels
  const pexelsUrl = await fetchPexelsImage(searchWithDestination)
  if (pexelsUrl) {
    setCache(cacheKey, pexelsUrl)
    return pexelsUrl
  }

  return null
}

async function fetchUnsplashImage(query: string): Promise<string | null> {
  if (!UNSPLASH_KEY) return null
  try {
    const url = new URL('https://api.unsplash.com/search/photos')
    url.searchParams.set('query', query)
    url.searchParams.set('per_page', '1')
    url.searchParams.set('orientation', 'landscape')
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    const first: UnsplashPhoto | undefined = data?.results?.[0]
    return first?.urls?.regular ?? null
  } catch {
    return null
  }
}

async function fetchPexelsImage(query: string): Promise<string | null> {
  if (!PEXELS_KEY) return null
  try {
    const url = new URL('https://api.pexels.com/v1/search')
    url.searchParams.set('query', query)
    url.searchParams.set('per_page', '1')
    url.searchParams.set('orientation', 'landscape')
    const res = await fetch(url.toString(), {
      headers: { Authorization: PEXELS_KEY },
    })
    if (!res.ok) return null
    const data = await res.json()
    const first: PexelsPhoto | undefined = data?.photos?.[0]
    return first?.src?.large ?? null
  } catch {
    return null
  }
}

async function fetchPixabayImage(query: string): Promise<string | null> {
  try {
    const url = new URL('https://pixabay.com/api/')
    url.searchParams.set('key', 'your-pixabay-key') // Free tier - replace with your key
    url.searchParams.set('q', query)
    url.searchParams.set('image_type', 'photo')
    url.searchParams.set('orientation', 'horizontal')
    url.searchParams.set('safesearch', 'true')
    url.searchParams.set('per_page', '3')
    
    const res = await fetch(url.toString())
    if (!res.ok) return null
    const data = await res.json()
    const first: PixabayPhoto | undefined = data?.hits?.[0]
    return first?.largeImageURL ?? null
  } catch {
    return null
  }
}

// Enhanced Google Places API integration with pagination
export async function fetchNearbyAttractions(
  destination: string,
  latitude?: number,
  longitude?: number
): Promise<GooglePlace[]> {
  const cacheKey = `places_${destination}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  if (!GOOGLE_PLACES_KEY) {
    console.warn('⚠️ No Google Places API key found')
    return []
  }

  try {
    // First, get coordinates for the destination
    let lat = latitude
    let lng = longitude
    
    if (!lat || !lng) {
      console.log('📍 Geocoding destination:', destination)
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${GOOGLE_PLACES_KEY}`
      const geocodeRes = await fetch(geocodeUrl)
      if (geocodeRes.ok) {
        const geocodeData = await geocodeRes.json()
        if (geocodeData.results?.[0]?.geometry?.location) {
          lat = geocodeData.results[0].geometry.location.lat
          lng = geocodeData.results[0].geometry.location.lng
          console.log(`✅ Coordinates: ${lat}, ${lng}`)
        }
      }
    }

    if (!lat || !lng) {
      console.error('❌ Could not get coordinates for destination')
      return []
    }

    const allPlaces: GooglePlace[] = []
    
    // Helper function to fetch places with pagination
    async function fetchWithPagination(url: string, maxPages: number = 3): Promise<GooglePlace[]> {
      const results: GooglePlace[] = []
      let nextPageToken: string | undefined
      let pageCount = 0
      
      do {
        const pageUrl = nextPageToken 
          ? `${url}&pagetoken=${nextPageToken}`
          : url
        
        try {
          const res = await fetch(pageUrl)
          if (!res.ok) {
            console.error(`Failed to fetch: ${res.status}`)
            break
          }
          
          const data = await res.json()
          
          if (data.results && data.results.length > 0) {
            results.push(...data.results)
            console.log(`  📄 Page ${pageCount + 1}: ${data.results.length} results (total: ${results.length})`)
          }
          
          nextPageToken = data.next_page_token
          pageCount++
          
          // Google requires a short delay before requesting next page
          if (nextPageToken && pageCount < maxPages) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
          
        } catch (error) {
          console.error('Error fetching page:', error)
          break
        }
        
      } while (nextPageToken && pageCount < maxPages)
      
      return results
    }

    // Search strategies with pagination (up to 60 results per type)
    const searchStrategies = [
      {
        name: 'Tourist Attractions',
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=15000&type=tourist_attraction&key=${GOOGLE_PLACES_KEY}`
      },
      {
        name: 'Museums',
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=15000&type=museum&key=${GOOGLE_PLACES_KEY}`
      },
      {
        name: 'Parks',
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=15000&type=park&key=${GOOGLE_PLACES_KEY}`
      },
      {
        name: 'Art Galleries',
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=15000&type=art_gallery&key=${GOOGLE_PLACES_KEY}`
      },
      {
        name: 'Shopping',
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=15000&type=shopping_mall&key=${GOOGLE_PLACES_KEY}`
      },
      {
        name: 'Restaurants (High-Rated)',
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=restaurant&rankby=prominence&key=${GOOGLE_PLACES_KEY}`
      },
      {
        name: 'Entertainment',
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=15000&type=amusement_park&key=${GOOGLE_PLACES_KEY}`
      },
      {
        name: 'Things to Do',
        url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=things+to+do+in+${encodeURIComponent(destination)}&key=${GOOGLE_PLACES_KEY}`
      },
      {
        name: 'Attractions',
        url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=attractions+in+${encodeURIComponent(destination)}&key=${GOOGLE_PLACES_KEY}`
      },
      {
        name: 'Landmarks',
        url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=landmarks+in+${encodeURIComponent(destination)}&key=${GOOGLE_PLACES_KEY}`
      },
      {
        name: 'Must See',
        url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=must+see+${encodeURIComponent(destination)}&key=${GOOGLE_PLACES_KEY}`
      },
      {
        name: 'Popular Places',
        url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=popular+places+${encodeURIComponent(destination)}&key=${GOOGLE_PLACES_KEY}`
      }
    ]

    console.log(`\n🔍 Searching for places in ${destination}...`)
    
    // Execute all searches with pagination
    for (const strategy of searchStrategies) {
      console.log(`\n📍 ${strategy.name}:`)
      const results = await fetchWithPagination(strategy.url, 3) // Up to 3 pages (60 results)
      allPlaces.push(...results)
      
      // Small delay between different search types
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log(`\n📊 Total results fetched: ${allPlaces.length}`)

    // Deduplicate by place_id
    const uniquePlaces = allPlaces.filter((place, index, self) => 
      index === self.findIndex(p => p.place_id === place.place_id)
    )
    
    console.log(`✅ Unique places: ${uniquePlaces.length}`)

    // Filter and sort by quality
    const qualityPlaces = uniquePlaces
      .filter(place => {
        // Must have a rating
        if (!place.rating || place.rating < 3.5) return false
        
        // Must have some reviews (indicates real place)
        if (!place.user_ratings_total || place.user_ratings_total < 10) return false
        
        return true
      })
      .sort((a, b) => {
        // Sort by quality score: rating * log(reviews)
        const scoreA = (a.rating || 0) * Math.log((a.user_ratings_total || 0) + 1)
        const scoreB = (b.rating || 0) * Math.log((b.user_ratings_total || 0) + 1)
        return scoreB - scoreA
      })
      .slice(0, 100) // Keep top 100
    
    console.log(`🌟 High-quality places: ${qualityPlaces.length}`)
    
    setCache(cacheKey, qualityPlaces)
    return qualityPlaces
    
  } catch (error) {
    console.error('❌ Error fetching nearby attractions:', error)
    return []
  }
}

// Enhanced Foursquare API integration with multiple search strategies
export async function fetchFoursquareVenues(destination: string): Promise<FoursquareVenue[]> {
  const cacheKey = `foursquare_${destination}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  if (!FOURSQUARE_KEY) return []

  try {
    // Multiple search strategies for comprehensive results
    const searchQueries = [
      `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(destination)}&limit=20`,
      `https://api.foursquare.com/v3/places/search?query=tourist+attractions+${encodeURIComponent(destination)}&limit=20`,
      `https://api.foursquare.com/v3/places/search?query=museums+${encodeURIComponent(destination)}&limit=20`,
      `https://api.foursquare.com/v3/places/search?query=parks+${encodeURIComponent(destination)}&limit=20`,
      `https://api.foursquare.com/v3/places/search?query=restaurants+${encodeURIComponent(destination)}&limit=20`,
      `https://api.foursquare.com/v3/places/search?query=shopping+${encodeURIComponent(destination)}&limit=20`,
      `https://api.foursquare.com/v3/places/search?query=entertainment+${encodeURIComponent(destination)}&limit=20`,
      `https://api.foursquare.com/v3/places/search?query=landmarks+${encodeURIComponent(destination)}&limit=20`
    ]

    // Execute all searches in parallel
    const searchPromises = searchQueries.map(async (url) => {
      try {
        const res = await fetch(url, {
          headers: {
            'Authorization': FOURSQUARE_KEY,
            'Accept': 'application/json'
          }
        })
        if (res.ok) {
          const data = await res.json()
          return data.results || []
        }
        return []
      } catch {
        return []
      }
    })

    const allResults = await Promise.all(searchPromises)
    
    // Flatten and deduplicate results
    const allVenues = allResults.flat()
    const uniqueVenues = allVenues.filter((venue, index, self) => 
      index === self.findIndex(v => v.id === venue.id)
    )

    // Sort by rating and popularity
    const sortedVenues = uniqueVenues
      .filter(venue => venue.rating && venue.rating >= 3.0)
      .sort((a, b) => {
        const scoreA = (a.rating || 0) * Math.log((a.ratingSignals || 0) + 1)
        const scoreB = (b.rating || 0) * Math.log((b.ratingSignals || 0) + 1)
        return scoreB - scoreA
      })
      .slice(0, 30)
    
    setCache(cacheKey, sortedVenues)
    return sortedVenues
  } catch {
    return []
  }
}

// Wikipedia integration
export async function fetchWikiSummary(title: string): Promise<WikiSummary | null> {
  const cacheKey = `wiki_${title}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const safe = encodeURIComponent(title)
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${safe}`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) return null
    const data = (await res.json()) as WikiSummary
    setCache(cacheKey, data)
    return data
  } catch {
    return null
  }
}

// Enhanced card enrichment
export type EnrichedCard = {
  id: string
  title: string
  subtitle?: string
  tags?: string[]
  image?: string
  info?: string
  rating?: number
  reviews?: number
  address?: string
  website?: string
  phone?: string
  priceLevel?: number
  openNow?: boolean
  category?: string
}

export async function enrichCard(
  base: Omit<EnrichedCard, 'image' | 'info' | 'rating' | 'reviews' | 'address' | 'website' | 'phone' | 'priceLevel' | 'openNow'>,
  destination: string
): Promise<EnrichedCard> {
  const query = [base.title, destination].filter(Boolean).join(' ')
  
  // Fetch all data in parallel
  const [image, wiki, places, venues] = await Promise.all([
    fetchImage(query, destination),
    fetchWikiSummary(base.title),
    fetchNearbyAttractions(destination),
    fetchFoursquareVenues(destination)
  ])

  // Find matching place data
  const matchingPlace = places.find(p => 
    p.name.toLowerCase().includes(base.title.toLowerCase()) ||
    base.title.toLowerCase().includes(p.name.toLowerCase())
  )

  const matchingVenue = venues.find(v => 
    v.name.toLowerCase().includes(base.title.toLowerCase()) ||
    base.title.toLowerCase().includes(v.name.toLowerCase())
  )

  return {
    ...base,
    image: image || wiki?.thumbnail?.source,
    info: wiki?.extract || wiki?.description,
    rating: matchingPlace?.rating || matchingVenue?.rating,
    reviews: matchingPlace?.user_ratings_total || matchingVenue?.ratingSignals,
    address: matchingPlace?.formatted_address || matchingVenue?.location?.address,
    website: matchingPlace?.website,
    phone: matchingPlace?.formatted_phone_number,
    priceLevel: matchingPlace?.price_level,
    openNow: matchingPlace?.opening_hours?.open_now
  }
}

// Enhanced cards enrichment with real data
export async function enrichCards(
  items: Omit<EnrichedCard, 'image' | 'info' | 'rating' | 'reviews' | 'address' | 'website' | 'phone' | 'priceLevel' | 'openNow'>[],
  destination: string
): Promise<EnrichedCard[]> {
  return Promise.all(items.map((it) => enrichCard(it, destination)))
}

// Enhanced attraction fetching with ML-powered personalization
export async function getRealAttractions(
  destination: string, 
  userTraits: string[] = [],
  userInterests: string[] = [],
  userId?: string
): Promise<EnrichedCard[]> {
  const [places, venues] = await Promise.all([
    fetchNearbyAttractions(destination),
    fetchFoursquareVenues(destination)
  ])

  const attractions: EnrichedCard[] = []

  // Process Google Places results with enhanced data
  for (const place of places) {
    const image = await fetchImage(place.name, destination)
    
    // Enhanced tag mapping
    const enhancedTags = place.types.map(type => {
      const tagMap: Record<string, string> = {
        'tourist_attraction': 'Tourist Attraction',
        'museum': 'Museum',
        'park': 'Park',
        'restaurant': 'Restaurant',
        'shopping_mall': 'Shopping',
        'amusement_park': 'Entertainment',
        'zoo': 'Zoo',
        'aquarium': 'Aquarium',
        'art_gallery': 'Art Gallery',
        'church': 'Religious Site',
        'mosque': 'Religious Site',
        'synagogue': 'Religious Site',
        'temple': 'Religious Site',
        'library': 'Library',
        'university': 'Educational',
        'stadium': 'Sports',
        'theater': 'Entertainment',
        'night_club': 'Nightlife',
        'bar': 'Nightlife',
        'cafe': 'Cafe',
        'bakery': 'Food',
        'book_store': 'Shopping',
        'clothing_store': 'Shopping',
      }
      return tagMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    })

    attractions.push({
      id: `place_${place.place_id}`,
      title: place.name,
      subtitle: place.vicinity,
      tags: enhancedTags.slice(0, 5),
      category: enhancedTags[0] || 'General',
      image,
      rating: place.rating,
      reviews: place.user_ratings_total,
      address: place.formatted_address,
      priceLevel: place.price_level,
      website: place.website,
      phone: place.formatted_phone_number,
      openNow: place.opening_hours?.open_now
    })
  }

  // Process Foursquare results
  for (const venue of venues) {
    const image = await fetchImage(venue.name, destination)
    
    attractions.push({
      id: `venue_${venue.id}`,
      title: venue.name,
      subtitle: venue.location.address,
      tags: venue.categories.map(c => c.name),
      category: venue.categories[0]?.name || 'General',
      image,
      rating: venue.rating,
      reviews: venue.ratingSignals,
      address: venue.location.address
    })
  }

  // Remove duplicates
  const unique = attractions.filter((item, index, self) => 
    index === self.findIndex(t => t.title === item.title)
  )

  // Filter by preferences
  let filteredAttractions = unique

  if (userTraits.length > 0 || userInterests.length > 0) {
    filteredAttractions = unique.filter(attraction => {
      const allTags = [...(attraction.tags || [])]
      const searchTerms = [...userTraits, ...userInterests]
      
      return searchTerms.some(term => 
        allTags.some(tag => 
          tag.toLowerCase().includes(term.toLowerCase()) ||
          term.toLowerCase().includes(tag.toLowerCase())
        )
      )
    })
  }

  // Fallback to popular if too few results
  if (filteredAttractions.length < 10) {
    const popularAttractions = unique
      .filter(attraction => attraction.rating && attraction.rating >= 4.0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10)
    
    const combined = [...filteredAttractions, ...popularAttractions]
    const finalUnique = combined.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    )
    
    return finalUnique.slice(0, 30)
  }

  return filteredAttractions.slice(0, 30)
}

// ML-powered personalization integration
export async function getPersonalizedAttractions(
  destination: string,
  userTraits: string[] = [],
  userInterests: string[] = [],
  userId?: string
): Promise<EnrichedCard[]> {
  const baseAttractions = await getRealAttractions(destination, userTraits, userInterests, userId)
  
  if (!userId) {
    return baseAttractions
  }

  const { preferenceLearningManager } = await import('./preferenceLearning')
  
  const attractionFeatures = baseAttractions.map(attraction => ({
    id: attraction.id,
    title: attraction.title,
    tags: attraction.tags || [],
    rating: attraction.rating || 0,
    reviews: attraction.reviews || 0,
    priceLevel: attraction.priceLevel,
    category: attraction.category || attraction.tags?.[0] || 'General',
    location: {
      city: destination,
      country: 'USA',
    },
    features: {
      hasPhotos: !!attraction.image,
      hasWebsite: !!attraction.website,
      hasPhone: !!attraction.phone,
      isOpenNow: attraction.openNow
    }
  }))

  const personalizedAttractions = preferenceLearningManager.getPersonalizedRecommendations(
    userId,
    attractionFeatures,
    []
  )

  return personalizedAttractions.map(attraction => {
    const originalAttraction = baseAttractions.find(a => a.id === attraction.id)
    return originalAttraction || {
      id: attraction.id,
      title: attraction.title,
      subtitle: attraction.location.city,
      tags: attraction.tags,
      category: attraction.category,
      image: undefined,
      rating: attraction.rating,
      reviews: attraction.reviews,
      address: undefined
    }
  })
}