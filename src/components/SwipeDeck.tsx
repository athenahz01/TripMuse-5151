import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Heart, X, RotateCcw, ArrowLeft } from 'lucide-react'
import Card from './Card'
import { Venue } from '../store/useTaste'

type Props = {
  venues: Venue[]
  onSwipe: (id: string, direction: 'left' | 'right', venueData?: any) => void
}

export function SwipeDeck({ venues, onSwipe }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const constraintsRef = useRef(null)
  
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-30, 30])
  const opacity = useTransform(x, [-150, -50, 0, 50, 150], [0, 1, 1, 1, 0])

  const currentVenue = venues[currentIndex]

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentVenue) return
    
    setSwipeDirection(direction)
    onSwipe(currentVenue.id, direction, currentVenue)
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      setSwipeDirection(null)
      x.set(0)
    }, 400)
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (_: any, { offset, velocity }: any) => {
    setIsDragging(false)
    const swipeThreshold = 100
    const velocityThreshold = 500
    
    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
      const direction = offset.x > 0 ? 'right' : 'left'
      handleSwipe(direction)
    } else {
      // Snap back to center
      x.set(0)
    }
  }

  const handleDrag = (_: any, { offset }: any) => {
    const threshold = 50
    if (offset.x > threshold) {
      setSwipeDirection('right')
    } else if (offset.x < -threshold) {
      setSwipeDirection('left')
    } else {
      setSwipeDirection(null)
    }
  }

  const undoLastSwipe = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  if (!currentVenue) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center mb-6 shadow-lg animate-pulse">
          <Heart className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-700 mb-2">All done!</h3>
        <p className="text-lg text-neutral-500">You've discovered all available experiences.</p>
        <div className="mt-6 px-6 py-3 bg-sky-50 rounded-xl">
          <p className="text-sm text-sky-600">✨ Check your saved experiences to plan your trip!</p>
        </div>
        {currentIndex > 0 && (
          <button
            onClick={undoLastSwipe}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-neutral-200 text-neutral-600 hover:border-sky-300 hover:text-sky-600 transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            Go back
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-md mx-auto" ref={constraintsRef}>
      <AnimatePresence>
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ 
            scale: isDragging ? 1.05 : 1, 
            opacity: 1, 
            x: 0, 
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 30 }
          }}
          exit={{ 
            x: swipeDirection === 'left' ? -1000 : 1000, 
            scale: 0.8, 
            opacity: 0,
            rotate: swipeDirection === 'left' ? -30 : 30,
            transition: { duration: 0.4, ease: "easeInOut" }
          }}
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{ x, rotate, opacity }}
          className="cursor-grab active:cursor-grabbing select-none"
          whileDrag={{ scale: 1.05 }}
        >
          <div className="relative">
            <Card 
              title={currentVenue.name}
              subtitle={currentVenue.category}
              tags={currentVenue.tags}
              image={currentVenue.photos?.[0]}
              info={currentVenue.description}
              rating={currentVenue.rating}
              address={currentVenue.location?.address}
              priceLevel={currentVenue.price_level}
            />
            
            {/* Swipe overlay indicators */}
            <AnimatePresence>
              {swipeDirection && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 rounded-3xl flex items-center justify-center text-6xl font-bold ${
                    swipeDirection === 'right' 
                      ? 'bg-green-500/20 text-green-600' 
                      : 'bg-red-500/20 text-red-600'
                  }`}
                >
                  {swipeDirection === 'right' ? '❤️' : '👎'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card counter */}
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-neutral-600 shadow-lg">
                {currentIndex + 1} of {venues.length}
              </div>
            </div>

            {/* Swipe hints */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between">
              <motion.div
                animate={{ 
                  opacity: swipeDirection === 'left' ? 1 : 0.3,
                  scale: swipeDirection === 'left' ? 1.2 : 1
                }}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-full text-red-600 text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Skip
              </motion.div>
              <motion.div
                animate={{ 
                  opacity: swipeDirection === 'right' ? 1 : 0.3,
                  scale: swipeDirection === 'right' ? 1.2 : 1
                }}
                className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-full text-green-600 text-sm font-medium"
              >
                <Heart className="w-4 h-4" />
                Save
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Enhanced action buttons */}
      <div className="flex justify-center gap-8 mt-8">
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-white border-4 border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl active:scale-95"
        >
          <X className="w-8 h-8" />
        </button>
        
        {currentIndex > 0 && (
          <button
            onClick={undoLastSwipe}
            className="w-12 h-12 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-white border-4 border-green-200 flex items-center justify-center text-green-500 hover:bg-green-50 hover:border-green-300 transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl active:scale-95"
        >
          <Heart className="w-8 h-8" />
        </button>
      </div>

      {/* Enhanced progress indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {venues.slice(0, Math.min(8, venues.length)).map((_, index) => (
          <motion.div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-sky-500 scale-125' 
                : index < currentIndex 
                  ? 'bg-sky-300' 
                  : 'bg-neutral-200'
            }`}
            animate={{
              scale: index === currentIndex ? 1.25 : 1,
              opacity: index <= currentIndex ? 1 : 0.5
            }}
          />
        ))}
        {venues.length > 8 && (
          <span className="text-xs text-neutral-400 ml-2 flex items-center">
            +{venues.length - 8} more
          </span>
        )}
      </div>

      {/* Enhanced instructions */}
      <div className="text-center mt-6 space-y-2">
        <p className="text-sm text-neutral-500">
          <span className="font-medium text-green-600">Swipe right</span> to save • <span className="font-medium text-red-600">Swipe left</span> to skip
        </p>
        <p className="text-xs text-neutral-400">
          Or use the buttons below • Drag to see preview
        </p>
      </div>
    </div>
  )
}

export default SwipeDeck