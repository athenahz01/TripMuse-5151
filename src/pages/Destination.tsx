import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTaste } from '@/store/useTaste'
import { MapPin, Search, ArrowRight, Sparkles } from 'lucide-react'

export default function Destination() {
  const nav = useNavigate()
  const { destination, setDestination } = useTaste()
  const [val, setVal] = useState(destination)

  const popularDestinations = ['Los Angeles', 'New York', 'San Francisco', 'Tokyo', 'Paris', 'London']

  return (
    <section className="grid gap-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg shadow-soft mb-4">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold gradient-text">Where to next?</h1>
        <p className="text-xl text-neutral-600 leading-relaxed">
          Tell us your dream destination and we'll find amazing experiences just for you
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Your destination</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                className="w-full border-2 border-neutral-200 rounded-2xl px-12 py-4 text-lg placeholder-neutral-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all duration-200"
                placeholder="Type a city…"
                value={val}
                onChange={e=>setVal(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-neutral-700">Popular destinations</p>
            <div className="flex flex-wrap gap-2">
              {popularDestinations.map((dest, index) => (
                <button
                  key={dest}
                  onClick={() => setVal(dest)}
                  className="px-4 py-2 rounded-xl border-2 border-neutral-200 text-neutral-600 hover:border-sky-300 hover:text-sky-600 transition-all duration-200 hover:scale-105"
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={()=>{ setDestination(val.trim()); nav('/discover') }}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl gradient-bg text-white font-semibold shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              Discover Experiences
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-neutral-500">
        <p>🌍 We'll find experiences that match your style in {val || 'your destination'}</p>
      </div>
    </section>
  )
}
