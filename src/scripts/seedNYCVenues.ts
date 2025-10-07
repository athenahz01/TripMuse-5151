import 'dotenv/config'
import { supabase } from '../lib/supabase'
import { fetchNearbyAttractions, fetchImage } from '../lib/api'

// Helper to get environment variables in Node.js
const getEnv = (key: string): string | undefined => {
  return process.env[key];
};

// Curated seed data to ensure we have NYC icons
const CURATED_NYC_ATTRACTIONS = [
  { name: 'Statue of Liberty', category: 'Landmark', tags: ['Landmark', 'Historic', 'Iconic'], priceLevel: 2 },
  { name: 'Empire State Building', category: 'Landmark', tags: ['Landmark', 'Views', 'Architecture'], priceLevel: 3 },
  { name: 'Central Park', category: 'Park', tags: ['Park', 'Nature', 'Outdoor'], priceLevel: 1 },
  { name: 'Times Square', category: 'Entertainment', tags: ['Entertainment', 'Shopping', 'Nightlife'], priceLevel: 1 },
  { name: 'Brooklyn Bridge', category: 'Landmark', tags: ['Landmark', 'Architecture', 'Photography'], priceLevel: 1 },
  { name: 'Metropolitan Museum of Art', category: 'Museum', tags: ['Museum', 'Art', 'Culture'], priceLevel: 3 },
  { name: 'Museum of Modern Art', category: 'Museum', tags: ['Museum', 'Art', 'Modern'], priceLevel: 3 },
  { name: 'American Museum of Natural History', category: 'Museum', tags: ['Museum', 'Science', 'Family'], priceLevel: 3 },
  { name: '9/11 Memorial & Museum', category: 'Museum', tags: ['Museum', 'History', 'Memorial'], priceLevel: 3 },
  { name: 'High Line', category: 'Park', tags: ['Park', 'Art', 'Outdoor'], priceLevel: 1 },
]

export async function seedNYCVenues() {
  console.log('🗽 NYC Venues Seeding Started!\n')
  
  console.log('Step 1: Checking environment variables...')
  console.log('  GOOGLE_PLACES_KEY:', getEnv('VITE_GOOGLE_PLACES_KEY') ? '✓ Set' : '✗ Missing')
  console.log('  UNSPLASH_KEY:', getEnv('VITE_UNSPLASH_ACCESS_KEY') ? '✓ Set' : '✗ Missing')
  console.log('  SUPABASE_URL:', getEnv('VITE_SUPABASE_URL') ? '✓ Set' : '✗ Missing')
  console.log('')
  
  try {
    // Check existing venues
    const { data: existingVenues } = await supabase
      .from('venues')
      .select('google_place_id, name')
    
    const existingPlaceIds = new Set(
      existingVenues?.map(v => v.google_place_id).filter(Boolean) || []
    )
    const existingNames = new Set(
      existingVenues?.map(v => v.name.toLowerCase()) || []
    )
    
    console.log(`📊 Current database: ${existingVenues?.length || 0} venues\n`)
    
    // Fetch real data from Google Places API
    console.log('📍 Fetching comprehensive NYC data from Google Places...')
    const realPlaces = await fetchNearbyAttractions('New York City', 40.7128, -74.0060)
    
    console.log(`\n✅ Found ${realPlaces.length} places from Google Places API`)
    
    if (realPlaces.length === 0) {
      console.error('❌ No places returned from Google Places API!')
      console.log('Please check:')
      console.log('1. VITE_GOOGLE_PLACES_KEY is set in .env')
      console.log('2. API key is valid and has Places API enabled')
      console.log('3. You have billing enabled on Google Cloud')
      return
    }
    
    const allVenues = []
    
    // Map place types to categories
    const categoryMap: Record<string, string> = {
      'tourist_attraction': 'Tourist Attraction',
      'museum': 'Museum',
      'art_gallery': 'Museum',
      'park': 'Park',
      'restaurant': 'Restaurant',
      'cafe': 'Cafe',
      'bar': 'Bar',
      'shopping_mall': 'Shopping',
      'store': 'Shopping',
      'amusement_park': 'Entertainment',
      'night_club': 'Nightlife',
      'movie_theater': 'Entertainment',
      'zoo': 'Family',
      'aquarium': 'Family',
      'stadium': 'Sports',
      'library': 'Cultural',
      'church': 'Cultural',
      'synagogue': 'Cultural',
      'mosque': 'Cultural',
      'hindu_temple': 'Cultural',
    }
    
    // Process all places from API
    console.log('\n🎨 Processing venues...')
    let processedCount = 0
    
    for (const place of realPlaces) {
      // Skip if already exists
      if (place.place_id && existingPlaceIds.has(place.place_id)) {
        continue
      }
      
      if (existingNames.has(place.name.toLowerCase())) {
        continue
      }
      
      // Determine category
      let category = 'Attraction'
      for (const type of place.types) {
        if (categoryMap[type]) {
          category = categoryMap[type]
          break
        }
      }
      
      // Create tags from types
      const tags = place.types
        .slice(0, 4)
        .map(t => t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
        .filter(t => t !== 'Point Of Interest' && t !== 'Establishment')
      
      // Fetch image (with rate limiting)
      let image: string | null = null
      try {
        image = await fetchImage(place.name, 'New York City')
        if (image) {
          console.log(`  ✓ Image found for: ${place.name}`)
        }
      } catch (error) {
        console.log(`  ⚠️ No image for: ${place.name}`)
      }
      
      const venue = {
        name: place.name,
        category,
        description: `Experience ${place.name}, ${category.toLowerCase()} in New York City.`,
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: place.formatted_address || place.vicinity || 'New York, NY'
        },
        price_level: place.price_level || 2,
        rating: place.rating || 0,
        photos: image ? [image] : [],
        tags,
        google_place_id: place.place_id
      }
      
      allVenues.push(venue)
      processedCount++
      
      if (processedCount % 10 === 0) {
        console.log(`  📊 Processed ${processedCount} venues...`)
      }
      
      // Rate limit: 1 request per 200ms for images
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    console.log(`\n✅ Processed ${allVenues.length} new venues`)
    
    if (allVenues.length === 0) {
      console.log('ℹ️ No new venues to add!')
      return
    }
    
    // Insert into Supabase in batches
    console.log(`\n💾 Inserting ${allVenues.length} venues into Supabase...`)
    
    const batchSize = 20
    let insertedCount = 0
    
    for (let i = 0; i < allVenues.length; i += batchSize) {
      const batch = allVenues.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('venues')
        .insert(batch)
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message)
      } else {
        insertedCount += batch.length
        console.log(`  ✓ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} venues inserted (${insertedCount}/${allVenues.length})`)
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('\n🎉 NYC venues seeding completed!')
    console.log(`📊 Total venues in database: ${(existingVenues?.length || 0) + insertedCount}`)
    console.log(`🆕 New venues added: ${insertedCount}`)
    
  } catch (error) {
    console.error('❌ Error seeding venues:', error)
    throw error
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedNYCVenues()
}