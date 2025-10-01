import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTaste } from '@/store/useTaste'
import { Plane, ArrowRight, Sparkles } from 'lucide-react'

export default function Onboarding() {
  const nav = useNavigate()
  const { recentTrip, setRecentTrip } = useTaste()
  const [val, setVal] = useState(recentTrip)

  return (
    <section className="grid gap-8 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg shadow-soft mb-4">
          <Plane className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold gradient-text">Welcome to TripMuse</h1>
        <p className="text-xl text-neutral-600 leading-relaxed">
          Tell us about a recent trip you loved, and we'll craft your perfect travel experience
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Your memorable trip</label>
            <textarea
              className="w-full border-2 border-neutral-200 rounded-2xl px-6 py-4 text-lg placeholder-neutral-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all duration-200 resize-none"
              placeholder="e.g., Kyoto last spring—temples, tea, and quiet alleys"
              value={val}
              onChange={e=>setVal(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={()=>{ setRecentTrip(val.trim()); nav('/interests') }}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl gradient-bg text-white font-semibold shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={()=>nav('/interests')} 
              className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-neutral-200 text-neutral-600 hover:border-sky-300 hover:text-sky-600 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              Skip
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-neutral-500">
        <p>✨ We'll use this to personalize your travel recommendations</p>
      </div>
    </section>
  )
}
