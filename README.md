# TripMuse MVP (Cursor-ready)

A minimal React + TypeScript (Vite) MVP for TripMuse:
**Onboarding → Interests → Traits (avatar) → Destination → Discover (swipe deck)**

**Scope:** Up to *Swipe & Personalized Recommendations* (no itinerary generation, no pricing).

## Tech
- React + TypeScript (Vite)
- Tailwind CSS
- Zustand (global state)
- React Router
- Framer Motion (swipe deck)
- Live data:
  - Photos: Unsplash (with key) or fallback to Wikipedia thumbnails
  - Info: Wikipedia REST 1–2 sentence summary

## Quick Start
```bash
pnpm install   # or: npm install
pnpm dev       # or: npm run dev
