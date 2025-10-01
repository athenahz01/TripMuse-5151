import React from 'react'
import { X, Check } from 'lucide-react'

type Props = {
  label: string
  selected?: boolean
  onClick?: () => void
  removable?: boolean
  onRemove?: () => void
}
export default function Chip({ label, selected, onClick, removable, onRemove }: Props) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-2xl border-2 text-sm font-medium flex items-center gap-2 shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-105
      ${selected 
        ? 'bg-gradient-to-r from-sky-500 to-blue-500 border-sky-400 text-white shadow-sky-200' 
        : 'bg-white/80 border-neutral-200 text-neutral-700 hover:border-sky-300 hover:text-sky-600'
      }`}
    >
      {selected && <Check className="w-4 h-4" />}
      <span className="capitalize">{label}</span>
      {removable && (
        <X 
          className="w-4 h-4 hover:bg-white/20 rounded-full p-0.5 transition-colors" 
          onClick={(e)=>{ e.stopPropagation(); onRemove?.(); }} 
        />
      )}
    </button>
  )
}
