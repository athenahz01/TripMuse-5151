# 🗺️ TripMuse

An AI-powered travel discovery platform that learns your vibe. Swipe through experiences, get personalized recommendations, and explore like a local — not a tourist.

**🌐 Live Demo:** [trinder-sigma.vercel.app](https://trinder-sigma.vercel.app/)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

### Problem Statement
Whether you're in Ithaca, Tokyo, or your own hometown — discovering places is broken. You're either drowning in generic tourist content or relying on that one friend who "knows spots." There's no app that learns what YOU actually like and finds it for you.

### Solution
TripMuse is an AI-powered travel discovery platform with swipe-based exploration. Every swipe teaches the algorithm your preferences — categories, price range, vibe. Ask the AI assistant anything ("What's good for a rainy day under $20?") and get instant, personalized recommendations. Build smart itineraries with real travel times.

### Why Ithaca First?
Ithaca is our MVP launchpad — a college town with 150+ waterfalls, world-class restaurants, and hidden gems that most people never discover. The vision? Every college town, every city, eventually everywhere.

### Target Users
- **Students**: Discovering new spots around campus and town
- **Visitors & Parents**: Planning trips for campus visits or graduation
- **Locals**: Finding new experiences in familiar territory
- **Travelers**: Exploring any city like a local

---

## Features

- 🎴 **Swipe-Based Discovery** — Tinder-style interface for exploring experiences
- 🤖 **AI Trip Assistant** — Ask anything, get personalized recommendations powered by Google Gemini
- 🧠 **Learning Algorithm** — Gets smarter with every swipe based on your preferences
- 📍 **Smart Itinerary Builder** — Plan your day with real travel times between spots
- 📸 **Photo Uploads** — Share and view community photos of venues
- ⭐ **Save Favorites** — Build a collection of places you want to visit
- 📱 **Mobile-First Design** — Optimized for on-the-go discovery

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **State Management** | React Hooks |
| **Styling** | Tailwind CSS |
| **Backend/Database** | Supabase |
| **AI/ML** | Google Gemini API |
| **Location Data** | Google Places API, Foursquare API |
| **Deployment** | Vercel |
| **Version Control** | Git, GitHub |

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) — [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) — Comes with Node.js
- **Git** — [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/athenahz01/tripmuse-ithaca.git
   cd tripmuse-ithaca
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Location APIs
VITE_GOOGLE_PLACES_KEY=your_google_places_api_key
VITE_FOURSQUARE_KEY=your_foursquare_api_key

# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI
VITE_GEMINI_API_KEY=your_gemini_api_key
```

#### How to Obtain API Keys

| API Key | How to Get It |
|---------|---------------|
| **Google Places API** | [Google Cloud Console](https://console.cloud.google.com/) → Create project → Enable Places API → Create credentials |
| **Foursquare API** | [Foursquare Developers](https://developer.foursquare.com/) → Create app → Get API key |
| **Supabase** | [supabase.com](https://supabase.com/) → Create project → Settings → API → Copy URL and anon key |
| **Google Gemini API** | [Google AI Studio](https://makersuite.google.com/app/apikey) → Create API key |

> ⚠️ **Security Note:** Never commit your `.env` file to version control.

### Running Locally

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

3. **Build for production** (optional)
   ```bash
   npm run build
   ```

4. **Preview production build** (optional)
   ```bash
   npm run preview
   ```

---

## Project Structure

```
tripmuse-ithaca/
├── public/                     # Static assets
│   └── ...                     # Images, icons, favicon
├── src/                        # Source code
│   ├── components/             # React components
│   │   ├── AIAssistant.jsx     # AI chat interface
│   │   ├── ProfileScreen.jsx   # User profile & preferences
│   │   ├── VenueDetailModal.jsx# Venue details popup
│   │   ├── WelcomeScreen.jsx   # Onboarding flow
│   │   └── ...                 # Other components
│   ├── config/                 # Configuration files
│   ├── services/               # API services
│   │   ├── aiAssistant.js      # Gemini AI integration
│   │   ├── googlePlaces.js     # Google Places API
│   │   ├── supabase.js         # Supabase client
│   │   └── photos.js           # Photo upload service
│   ├── App.jsx                 # Main application component
│   ├── index.css               # Global styles
│   └── main.jsx                # Application entry point
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── eslint.config.js            # ESLint configuration
├── index.html                  # HTML entry point
├── package.json                # Project dependencies
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── vite.config.js              # Vite build configuration
└── README.md                   # Project documentation
```

---

## API Documentation

### Services

#### AI Assistant (`src/services/aiAssistant.js`)
Handles communication with Google Gemini API for personalized recommendations.

```javascript
// Example usage
const response = await getAIRecommendation({
  query: "Best sunset spot for a date?",
  userPreferences: ["nature", "romantic"],
  previousLikes: [...venues]
});
```

#### Supabase (`src/services/supabase.js`)
Manages user data, swipe history, and saved venues.

```javascript
// Log a swipe
await supabase.logSwipe(venueId, 'like');

// Get user's saved venues
const saved = await supabase.getSavedVenues(userId);
```

#### Google Places (`src/services/googlePlaces.js`)
Fetches venue data and photos from Google Places API.

---

## Deployment

### Deploying to Vercel (Recommended)

1. **Connect your GitHub repository** to [Vercel](https://vercel.com)

2. **Add environment variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file

3. **Deploy!** Vercel auto-deploys on every push to `main`

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with ❤️ for travelers everywhere
- Powered by Google Gemini AI, Supabase, and Google Places
- Launching from Ithaca, scaling to the world 🌎

---

## Contact

**Athena Zhang** — Cornell M.Eng Systems Engineering

- GitHub: [@athenahz01](https://github.com/athenahz01)
- Live App: [trinder-sigma.vercel.app](https://trinder-sigma.vercel.app/)
- Repository: [github.com/athenahz01/tripmuse-ithaca](https://github.com/athenahz01/tripmuse-ithaca)