import { usePersonalizedVenues } from '../hooks/usePersonalizedVenues'
import { SwipeDeck } from '../components/SwipeDeck'
import { useTaste } from '../store/useTaste'
import { ArrowLeft, Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { swipeService } from '../services/swipeService'

export function Discover() {
  const navigate = useNavigate()
  const { destination, interests, traits, userId, like, skip, likes, skips } = useTaste()
  const { venues, loading, error, reload } = usePersonalizedVenues()

  const handleSwipe = async (id: string, direction: 'left' | 'right', venueData?: any) => {
    // Record in database
    if (userId && venueData) {
      await swipeService.recordSwipe(
        userId,
        id,
        direction === 'right' ? 'like' : 'dislike',
        0,
        {}
      )
    }

    // Update local state
    if (direction === 'right') {
      like(id, venueData)
    } else {
      skip(id, venueData)
    }

    // Auto-refresh recommendations every 5 swipes to show learning
    const totalSwipes = likes.length + skips.length
    if (totalSwipes > 0 && totalSwipes % 5 === 0) {
      console.log('🔄 Auto-refreshing recommendations after 5 swipes...')
      setTimeout(() => reload(), 500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading personalized recommendations...</p>
          {likes.length + skips.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Learning from your {likes.length + skips.length} swipes...
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>

          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles size={20} className="text-pink-500" />
              <h1 className="text-xl font-bold text-gray-900">
                Discover {destination}
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              Personalized for you
            </p>
          </div>

          {/* Refresh button */}
          <button
            onClick={reload}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
            title="Refresh recommendations"
          >
            <RefreshCw size={20} className="text-gray-700" />
          </button>
        </div>

        {/* User preferences summary */}
        {(interests.length > 0 || traits.length > 0) && (
          <div className="mt-4 p-4 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Based on your preferences
              </p>
              {(likes.length + skips.length) > 0 && (
                <span className="text-xs text-pink-600 font-semibold">
                  🧠 {likes.length + skips.length} swipes learned
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {[...interests, ...traits].slice(0, 5).map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Swipe Deck */}
      <div className="container mx-auto px-4 pb-8">
        {error ? (
          <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 250px)' }}>
            <div className="text-center max-w-md px-6">
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={reload}
                className="px-6 py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <SwipeDeck venues={venues} onSwipe={handleSwipe} />
        )}
      </div>
    </div>
  )
}

export default Discover