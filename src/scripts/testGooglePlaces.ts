import 'dotenv/config'

const GOOGLE_PLACES_KEY = process.env.VITE_GOOGLE_PLACES_KEY

console.log('Testing Google Places API...')
console.log('API Key:', GOOGLE_PLACES_KEY ? `Found (${GOOGLE_PLACES_KEY.substring(0, 10)}...)` : '❌ Missing')

if (!GOOGLE_PLACES_KEY) {
  console.error('\n❌ VITE_GOOGLE_PLACES_KEY not found in environment')
  console.error('Please check your .env file has:')
  console.error('VITE_GOOGLE_PLACES_KEY=your_key_here')
  process.exit(1)
}

async function testAPI() {
  try {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=New+York+City&key=${GOOGLE_PLACES_KEY}`
    console.log('\n📍 Testing geocoding...')
    
    const response = await fetch(geocodeUrl)
    const data = await response.json()
    
    console.log('Response status:', data.status)
    
    if (data.status === 'OK') {
      console.log('✅ Google Places API is working!')
      const location = data.results[0].geometry.location
      console.log(`Coordinates: ${location.lat}, ${location.lng}`)
    } else {
      console.error('❌ API Error:', data.status)
      if (data.error_message) {
        console.error('Error message:', data.error_message)
      }
    }
  } catch (error) {
    console.error('❌ Fetch error:', error)
  }
}

testAPI()