import React from 'react'
import { MapPin, Star, Clock, Camera, Phone, Globe, DollarSign, Users } from 'lucide-react'

type Props = {
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
}

export default function Card({ 
  title, 
  subtitle, 
  tags, 
  image, 
  info, 
  rating, 
  reviews, 
  address, 
  website, 
  phone, 
  priceLevel, 
  openNow 
}: Props) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-3 h-3 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i + fullStars + (hasHalfStar ? 1 : 0)} className="w-3 h-3 text-gray-300" />
        ))}
      </div>
    )
  }

  const renderPriceLevel = (level: number) => {
    return [...Array(4)].map((_, i) => (
      <DollarSign 
        key={i} 
        className={`w-3 h-3 ${i < level ? 'text-green-600' : 'text-gray-300'}`} 
      />
    ))
  }

  return (
    <div className="w-full rounded-3xl overflow-hidden shadow-strong bg-white border border-white/20 relative">
      {/* Image section */}
      <div className="relative h-64 bg-gradient-to-br from-sky-100 to-blue-100 overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
            loading="lazy" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 text-sky-400 mx-auto mb-2" />
              <span className="text-4xl">🗺️</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Rating overlay */}
        {rating && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-soft">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-neutral-700">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Open now indicator */}
        {openNow !== undefined && (
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium shadow-soft ${
            openNow 
              ? 'bg-green-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}>
            {openNow ? 'Open Now' : 'Closed'}
          </div>
        )}
        
        {/* Floating tags */}
        {tags && tags.length > 0 && (
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-neutral-700 shadow-soft">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-neutral-700">
            <MapPin className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-lg text-neutral-800">{title}</h3>
          </div>
          {subtitle && (
            <p className="text-neutral-600 font-medium">{subtitle}</p>
          )}
          {address && (
            <p className="text-sm text-neutral-500">{address}</p>
          )}
        </div>

        {/* Rating and reviews */}
        {(rating || reviews) && (
          <div className="flex items-center gap-4">
            {rating && (
              <div className="flex items-center gap-2">
                {renderStars(rating)}
                <span className="text-sm text-neutral-600">{rating.toFixed(1)}</span>
              </div>
            )}
            {reviews && (
              <div className="flex items-center gap-1 text-sm text-neutral-500">
                <Users className="w-4 h-4" />
                <span>{reviews.toLocaleString()} reviews</span>
              </div>
            )}
          </div>
        )}

        {/* Price level */}
        {priceLevel !== undefined && (
          <div className="flex items-center gap-1">
            {renderPriceLevel(priceLevel)}
            <span className="text-xs text-neutral-500 ml-2">
              {priceLevel === 0 ? 'Free' : 
               priceLevel === 1 ? 'Inexpensive' :
               priceLevel === 2 ? 'Moderate' :
               priceLevel === 3 ? 'Expensive' : 'Very Expensive'}
            </span>
          </div>
        )}

        {info && (
          <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">{info}</p>
        )}

        {/* Additional tags */}
        {tags && tags.length > 3 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(3).map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Contact info */}
        {(website || phone) && (
          <div className="flex items-center gap-4 pt-2 border-t border-neutral-100">
            {website && (
              <a 
                href={website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>Website</span>
              </a>
            )}
            {phone && (
              <a 
                href={`tel:${phone}`}
                className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>
            )}
          </div>
        )}

        {/* Action indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Featured</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>2-4 hours</span>
            </div>
          </div>
          <div className="text-xs text-sky-600 font-medium">
            Swipe to explore →
          </div>
        </div>
      </div>
    </div>
  )
}
