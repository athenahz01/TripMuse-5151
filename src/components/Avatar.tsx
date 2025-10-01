import React from 'react'

type Props = { traits: string[] }
/** Beautiful avatar that maps traits to emoji for the MVP */
export default function Avatar({ traits }: Props) {
  const map: Record<string,string> = {
    'ocean-view': '🌊',
    'mountains': '⛰️',
    'foodie': '🍜',
    'art': '🖼️',
    'nightlife': '🌃',
    'budget': '💸',
    'luxury': '💎',
    'hiking': '🥾',
    'photography': '📷',
    'coffee': '☕',
  }
  const icons = traits.slice(0,4).map(t => map[t] || '✨')
  
  return (
    <div className="relative">
      <div className="w-32 h-32 rounded-3xl gradient-bg shadow-strong flex items-center justify-center text-4xl relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="grid grid-cols-2 gap-2 relative z-10">
          {icons.map((icon, idx) => (
            <div 
              key={idx} 
              className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl animate-fadeInUp"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {icon}
            </div>
          ))}
        </div>
        {traits.length === 0 && (
          <div className="text-6xl opacity-50">✨</div>
        )}
      </div>
      {traits.length > 0 && (
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold shadow-medium">
          {traits.length}
        </div>
      )}
    </div>
  )
}
