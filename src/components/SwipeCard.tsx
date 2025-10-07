import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Venue, useTaste } from '../store/useTaste'
import { swipeService } from '../services/swipeService'
import { saveService } from '../services/saveService'
import { Heart, X, Bookmark, MapPin, Star, DollarSign } from 'lucide-react'

interface SwipeCardProps {
  venue: Venue
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}

export function SwipeCard({ venue, onSwipe, isTop }: SwipeCardProps) {
  const { userId, like, skip, setCardViewStartTime, cardViewStartTime } = useTaste()
  const [saved, setSaved] = useState(false)
  
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])

  // Track time spent viewing this card
  useEffect(() => {
    if (isTop) {
      setCardViewStartTime(Date.now())
    }
  }, [isTop, setCardViewStartTime])

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const swipeThreshold = 100
    
    if (Math.abs(info.offset.x) > swipeThreshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left'
      const timeSpent = Date.now() - cardViewStartTime
      
      // Record swipe in database
      if (userId) {
        await swipeService.recordSwipe(
          userId,
          venue.id,
          direction === 'right' ? 'like' : 'dislike',
          timeSpent,
          {
            swipeVelocity: info.velocity.x,
            timeOfDay: new Date().getHours(),
          }
        )
      }
      
      // Update local state
      if (direction === 'right') {
        like(venue.id, venue)
      } else {
        skip(venue.id, venue)
      }
      
      onSwipe(direction)
    }
  }

  const handleSave = async () => {
    if (!userId) return
    
    try {
      if (saved) {
        await saveService.unsaveVenue(userId, venue.id)
        setSaved(false)
      } else {
        await saveService.saveVenue(userId, venue.id)
        setSaved(true)
      }
    } catch (error) {
      console.error('Error saving venue:', error)
    }
  }

  const handleLike = async () => {
    const timeSpent = Date.now() - cardViewStartTime
    
    if (userId) {
      await swipeService.recordSwipe(userId, venue.id, 'like', timeSpent)
    }
    
    like(venue.id, venue)
    onSwipe('right')
  }

  const handleDislike = async () => {
    const timeSpent = Date.now() - cardViewStartTime
    
    if (userId) {
      await swipeService.recordSwipe(userId, venue.id, 'dislike', timeSpent)
    }
    
    skip(venue.id, venue)
    onSwipe('left')
  }

  const primaryImage = venue.photos?.[0] || 'https://images.unsplash.com/photo-1508234572182-f8f45a8c1b82?w=800'
  
  // Price level indicator
  const getPriceIndicator = (level: number) => {
    return '$'.repeat(level) + '·'.repeat(4 - level)
  }

  return (
    <motion.div
      className="absolute w-full h-full"
      style={{
        x,
        rotate,
        opacity,
        cursor: isTop ? 'grab' : 'default',
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      initial={{ scale: 0.95, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Image */}
        <div className="relative h-3/5 overflow-hidden">
          <img
            src={primaryImage}
            alt={venue.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
          
          {/* Save button */}
          <button
            onClick={handleSave}
            className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <Bookmark
              size={20}
              className={saved ? 'fill-red-500 text-red-500' : 'text-gray-700'}
            />
          </button>

          {/* Rating badge */}
          {venue.rating && venue.rating > 0 && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full flex items-center gap-1.5">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-white text-sm font-semibold">
                {venue.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
            <span className="text-xs font-semibold text-gray-800">
              {venue.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-2/5 flex flex-col">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
              {venue.name}
            </h2>
            
            {venue.location?.address && (
              <div className="flex items-start gap-2 mb-3">
                <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600 line-clamp-2">
                  {venue.location.address}
                </p>
              </div>
            )}

            {/* Price level */}
            {venue.price_level && (
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600 font-medium">
                  {getPriceIndicator(venue.price_level)}
                </span>
              </div>
            )}

            {/* Tags */}
            {venue.tags && venue.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {venue.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDislike}
              className="w-16 h-16 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center shadow-lg hover:border-red-500 hover:bg-red-50 transition-colors"
            >
              <X size={28} className="text-gray-600" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow"
            >
              <Heart size={32} className="text-white fill-white" />
            </motion.button>
          </div>
        </div>

        {/* Swipe indicators */}
        <motion.div
          className="absolute top-1/4 left-8 px-6 py-3 bg-green-500 text-white text-2xl font-bold rounded-lg rotate-[-20deg] border-4 border-green-400"
          style={{
            opacity: useTransform(x, [0, 100], [0, 1]),
          }}
        >
          LIKE
        </motion.div>

        <motion.div
          className="absolute top-1/4 right-8 px-6 py-3 bg-red-500 text-white text-2xl font-bold rounded-lg rotate-[20deg] border-4 border-red-400"
          style={{
            opacity: useTransform(x, [-100, 0], [1, 0]),
          }}
        >
          NOPE
        </motion.div>
      </div>
    </motion.div>
  )
}