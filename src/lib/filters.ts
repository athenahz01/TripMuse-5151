import { Experience } from '@/data/experiences'

export function personalize(
  all: Experience[],
  destination: string,
  traits: string[]
): Experience[] {
  const normDest = destination.trim().toLowerCase()
  const base = all.filter(e => e.destination.includes(normDest))
  // Simple score: +1 for each tag in selected traits
  const scored = base.map(e => ({
    item: e,
    score: e.tags.reduce((acc,t)=> acc + (traits.includes(t) ? 1 : 0), 0)
  }))
  scored.sort((a,b)=> b.score - a.score)
  return scored.map(s => s.item)
}
