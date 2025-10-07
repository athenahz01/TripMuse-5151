import 'dotenv/config'
import { seedNYCVenues } from './seedNYCVenues'

async function main() {
  console.log('🚀 Starting database seeding...\n')
  
  // Check environment variables
  console.log('Checking environment variables:')
  console.log('  VITE_GOOGLE_PLACES_KEY:', process.env.VITE_GOOGLE_PLACES_KEY ? '✓ Set' : '✗ Missing')
  console.log('  VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing')
  console.log('  VITE_UNSPLASH_ACCESS_KEY:', process.env.VITE_UNSPLASH_ACCESS_KEY ? '✓ Set' : '✗ Missing')
  console.log('')
  
  if (!process.env.VITE_GOOGLE_PLACES_KEY) {
    console.error('❌ Missing VITE_GOOGLE_PLACES_KEY in .env file')
    process.exit(1)
  }
  
  console.log('⏳ This may take 5-10 minutes. Please wait...\n')
  
  try {
    await seedNYCVenues()
    console.log('\n✅ Seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

main()