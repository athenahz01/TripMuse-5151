import React from 'react'
import { useNavigate } from 'react-router-dom'
import { TRAIT_CARDS } from '@/data/traits'
import Chip from '@/components/Chip'
import Avatar from '@/components/Avatar'
import { useTaste } from '@/store/useTaste'
import { Settings, ArrowRight, Sparkles } from 'lucide-react'

export default function Traits() {
  const nav = useNavigate()
  const { traits, toggleTrait } = useTaste()

  return (
    <section className="grid gap-8 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg shadow-soft mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold gradient-text">Fine-tune your travel style</h1>
        <p className="text-xl text-neutral-600 leading-relaxed">
          Turn on the cards that feel like "you" and watch your avatar evolve
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {TRAIT_CARDS.map((trait, index) => (
                  <div key={trait.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <Chip 
                      label={trait.label} 
                      selected={traits.includes(trait.id)} 
                      onClick={()=>toggleTrait(trait.id)} 
                    />
                  </div>
                ))}
              </div>

              {traits.length > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-sky-600 bg-sky-50 rounded-xl px-4 py-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{traits.length} traits selected</span>
                </div>
              )}

              <div className="flex justify-center">
                <button 
                  onClick={()=>nav('/destination')} 
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl gradient-bg text-white font-semibold shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20 text-center">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-700">Your Travel Avatar</h3>
              <div className="flex justify-center">
                <Avatar traits={traits} />
              </div>
              <p className="text-sm text-neutral-500">
                Your avatar updates as you select traits, reflecting your unique travel personality
              </p>
              {traits.length === 0 && (
                <p className="text-xs text-neutral-400">
                  Select some traits to see your avatar come to life! ✨
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-neutral-500">
        <p>🎨 Your avatar represents your travel personality</p>
      </div>
    </section>
  )
}
