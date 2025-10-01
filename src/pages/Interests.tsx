import React from 'react'
import { useNavigate } from 'react-router-dom'
import { INTERESTS } from '@/data/interests'
import Chip from '@/components/Chip'
import { useTaste } from '@/store/useTaste'
import { Heart, ArrowRight, CheckCircle } from 'lucide-react'

export default function Interests() {
  const nav = useNavigate()
  const { interests, toggleInterest } = useTaste()

  return (
    <section className="grid gap-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg shadow-soft mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold gradient-text">What sparks your wanderlust?</h1>
        <p className="text-xl text-neutral-600 leading-relaxed">
          Pick 3–5 interests that make your heart skip a beat when traveling
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20">
        <div className="space-y-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {INTERESTS.map((interest, index) => (
              <div key={interest} className="animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <Chip 
                  label={interest} 
                  selected={interests.includes(interest)} 
                  onClick={()=>toggleInterest(interest)} 
                />
              </div>
            ))}
          </div>

          {interests.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-sky-600 bg-sky-50 rounded-xl px-4 py-2">
              <CheckCircle className="w-4 h-4" />
              <span>{interests.length} selected</span>
            </div>
          )}

          <div className="flex justify-center">
            <button 
              onClick={()=>nav('/traits')} 
              className="flex items-center gap-2 px-8 py-4 rounded-2xl gradient-bg text-white font-semibold shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-neutral-500">
        <p>🎯 We'll use these to find experiences that match your vibe</p>
      </div>
    </section>
  )
}
