import React from 'react'

export default function Progress({ value }: { value: number }) {
  const percentage = Math.min(100, Math.max(0, value))
  
  return (
    <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden shadow-inner">
      <div
        className="h-full gradient-bg transition-[width] duration-700 ease-out relative"
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-1 h-full bg-white/40 shadow-lg"></div>
      </div>
    </div>
  )
}
