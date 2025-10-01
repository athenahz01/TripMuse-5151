import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Compass, Sparkles, MapPin, Heart } from 'lucide-react'
import Progress from './Progress'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const steps = ['/', '/interests', '/traits', '/destination', '/discover']
  const idx = Math.max(0, steps.indexOf(pathname))

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <header className="sticky top-0 z-10 glass border-b border-white/20">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl group">
            <div className="p-2 rounded-xl gradient-bg shadow-soft group-hover:shadow-medium transition-all duration-300">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="gradient-text">TripMuse</span>
          </Link>
          <nav className="text-sm text-neutral-600 flex items-center gap-6">
            <Link to="/destination" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 hover:text-sky-600 transition-all duration-200">
              <MapPin className="w-4 h-4" />
              Destination
            </Link>
            <Link to="/discover" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 hover:text-sky-600 transition-all duration-200">
              <Sparkles className="w-4 h-4" />
              Discover
            </Link>
          </nav>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-4">
          <Progress value={(idx+1)/steps.length*100} />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 animate-fadeInUp">
        {children}
      </main>
      <footer className="mx-auto max-w-4xl px-4 py-12 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
          <Heart className="w-4 h-4 text-red-400" />
          <span>© {new Date().getFullYear()} TripMuse — Crafted with passion</span>
        </div>
      </footer>
    </div>
  )
}
