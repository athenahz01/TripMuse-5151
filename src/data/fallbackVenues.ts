import { Venue } from '../store/useTaste'

export const FALLBACK_NYC_VENUES: Venue[] = [
  {
    id: 'fallback-1',
    name: 'Central Park',
    category: 'Park',
    description: 'Iconic urban park in the heart of Manhattan with beautiful landscapes, lakes, and activities.',
    location: {
      lat: 40.7829,
      lng: -73.9654,
      address: 'New York, NY 10024'
    },
    price_level: 1,
    rating: 4.8,
    photos: ['https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800'],
    tags: ['Park', 'Nature', 'Outdoor', 'Family-Friendly']
  },
  {
    id: 'fallback-2',
    name: 'Statue of Liberty',
    category: 'Landmark',
    description: 'World-famous symbol of freedom and democracy, gift from France to the United States.',
    location: {
      lat: 40.6892,
      lng: -74.0445,
      address: 'New York, NY 10004'
    },
    price_level: 2,
    rating: 4.7,
    photos: ['https://images.unsplash.com/photo-1543716618-4b0d1b985ab3?w=800'],
    tags: ['Landmark', 'History', 'Tourist Attraction', 'Iconic']
  },
  {
    id: 'fallback-3',
    name: 'Empire State Building',
    category: 'Landmark',
    description: 'Iconic Art Deco skyscraper with observation decks offering panoramic city views.',
    location: {
      lat: 40.7484,
      lng: -73.9857,
      address: '20 W 34th St, New York, NY 10001'
    },
    price_level: 3,
    rating: 4.6,
    photos: ['https://images.unsplash.com/photo-1546436836-07a91091f160?w=800'],
    tags: ['Landmark', 'Architecture', 'Views', 'Tourist Attraction']
  },
  {
    id: 'fallback-4',
    name: 'Metropolitan Museum of Art',
    category: 'Museum',
    description: "One of the world's largest and finest art museums with over 2 million works.",
    location: {
      lat: 40.7794,
      lng: -73.9632,
      address: '1000 5th Ave, New York, NY 10028'
    },
    price_level: 3,
    rating: 4.8,
    photos: ['https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800'],
    tags: ['Museum', 'Art', 'Culture', 'Historic']
  },
  {
    id: 'fallback-5',
    name: 'Times Square',
    category: 'Tourist Attraction',
    description: 'Bustling entertainment hub with bright lights, Broadway theaters, and endless energy.',
    location: {
      lat: 40.7580,
      lng: -73.9855,
      address: 'Manhattan, NY 10036'
    },
    price_level: 1,
    rating: 4.4,
    photos: ['https://images.unsplash.com/photo-1560105033-5c0a52646da4?w=800'],
    tags: ['Entertainment', 'Shopping', 'Nightlife', 'Tourist Attraction']
  },
  {
    id: 'fallback-6',
    name: 'Brooklyn Bridge',
    category: 'Landmark',
    description: 'Historic suspension bridge connecting Manhattan and Brooklyn with stunning views.',
    location: {
      lat: 40.7061,
      lng: -73.9969,
      address: 'New York, NY 10038'
    },
    price_level: 1,
    rating: 4.8,
    photos: ['https://images.unsplash.com/photo-1543716618-4b0d1b985ab3?w=800'],
    tags: ['Landmark', 'Architecture', 'Outdoor', 'Photography']
  },
  {
    id: 'fallback-7',
    name: 'Museum of Modern Art (MoMA)',
    category: 'Museum',
    description: 'Influential modern art museum with works by Van Gogh, Picasso, and Warhol.',
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: '11 W 53rd St, New York, NY 10019'
    },
    price_level: 3,
    rating: 4.7,
    photos: ['https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800'],
    tags: ['Museum', 'Art', 'Modern', 'Culture']
  },
  {
    id: 'fallback-8',
    name: 'High Line',
    category: 'Park',
    description: 'Elevated park built on historic freight rail line with gardens, art, and city views.',
    location: {
      lat: 40.7480,
      lng: -74.0048,
      address: 'New York, NY 10011'
    },
    price_level: 1,
    rating: 4.6,
    photos: ['https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800'],
    tags: ['Park', 'Art', 'Outdoor', 'Photography']
  },
  {
    id: 'fallback-9',
    name: 'One World Observatory',
    category: 'Tourist Attraction',
    description: 'Observation deck at the top of One World Trade Center with 360-degree views.',
    location: {
      lat: 40.7127,
      lng: -74.0134,
      address: '117 West St, New York, NY 10007'
    },
    price_level: 4,
    rating: 4.6,
    photos: ['https://images.unsplash.com/photo-1546436836-07a91091f160?w=800'],
    tags: ['Tourist Attraction', 'Views', 'Architecture']
  },
  {
    id: 'fallback-10',
    name: '9/11 Memorial & Museum',
    category: 'Museum',
    description: 'Moving tribute to victims of 9/11 attacks with memorial pools and artifacts.',
    location: {
      lat: 40.7115,
      lng: -74.0134,
      address: '180 Greenwich St, New York, NY 10007'
    },
    price_level: 3,
    rating: 4.8,
    photos: ['https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800'],
    tags: ['Museum', 'History', 'Memorial', 'Educational']
  },
  {
    id: 'fallback-11',
    name: 'Chelsea Market',
    category: 'Food',
    description: 'Indoor food hall and shopping mall in a former factory building.',
    location: {
      lat: 40.7425,
      lng: -74.0061,
      address: '75 9th Ave, New York, NY 10011'
    },
    price_level: 2,
    rating: 4.5,
    photos: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'],
    tags: ['Food', 'Shopping', 'Market', 'Indoor']
  },
  {
    id: 'fallback-12',
    name: 'Broadway Theater District',
    category: 'Entertainment',
    description: 'World-renowned theater district with spectacular shows and performances.',
    location: {
      lat: 40.7590,
      lng: -73.9845,
      address: 'Broadway, New York, NY 10036'
    },
    price_level: 4,
    rating: 4.7,
    photos: ['https://images.unsplash.com/photo-1503095396549-807759245b35?w=800'],
    tags: ['Entertainment', 'Theater', 'Culture', 'Nightlife']
  },
  {
    id: 'fallback-13',
    name: 'Bryant Park',
    category: 'Park',
    description: 'Public park with lawn, carousel, seasonal activities, and surrounded by skyscrapers.',
    location: {
      lat: 40.7536,
      lng: -73.9832,
      address: 'New York, NY 10018'
    },
    price_level: 1,
    rating: 4.6,
    photos: ['https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800'],
    tags: ['Park', 'Outdoor', 'Events', 'Family-Friendly']
  },
  {
    id: 'fallback-14',
    name: 'American Museum of Natural History',
    category: 'Museum',
    description: 'World-class natural history museum with dinosaur fossils and planetarium.',
    location: {
      lat: 40.7813,
      lng: -73.9740,
      address: '200 Central Park West, New York, NY 10024'
    },
    price_level: 3,
    rating: 4.8,
    photos: ['https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800'],
    tags: ['Museum', 'Science', 'Educational', 'Family-Friendly']
  },
  {
    id: 'fallback-15',
    name: 'Rockefeller Center',
    category: 'Tourist Attraction',
    description: 'Famous complex with observation deck, ice rink, and iconic Christmas tree.',
    location: {
      lat: 40.7587,
      lng: -73.9787,
      address: '45 Rockefeller Plaza, New York, NY 10111'
    },
    price_level: 3,
    rating: 4.7,
    photos: ['https://images.unsplash.com/photo-1546436836-07a91091f160?w=800'],
    tags: ['Tourist Attraction', 'Shopping', 'Entertainment', 'Iconic']
  },
  {
    id: 'fallback-16',
    name: 'Grand Central Terminal',
    category: 'Landmark',
    description: 'Historic train station with beautiful architecture and celestial ceiling.',
    location: {
      lat: 40.7527,
      lng: -73.9772,
      address: '89 E 42nd St, New York, NY 10017'
    },
    price_level: 1,
    rating: 4.6,
    photos: ['https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800'],
    tags: ['Architecture', 'Historic', 'Transportation', 'Photography']
  },
  {
    id: 'fallback-17',
    name: 'SoHo Shopping District',
    category: 'Shopping',
    description: 'Trendy neighborhood with upscale boutiques, art galleries, and cast-iron architecture.',
    location: {
      lat: 40.7233,
      lng: -74.0030,
      address: 'SoHo, New York, NY 10012'
    },
    price_level: 3,
    rating: 4.5,
    photos: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'],
    tags: ['Shopping', 'Fashion', 'Art', 'Architecture']
  },
  {
    id: 'fallback-18',
    name: 'Chinatown',
    category: 'Neighborhood',
    description: 'Vibrant neighborhood with authentic Chinese food, shops, and culture.',
    location: {
      lat: 40.7157,
      lng: -73.9970,
      address: 'Chinatown, New York, NY 10013'
    },
    price_level: 1,
    rating: 4.4,
    photos: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'],
    tags: ['Food', 'Culture', 'Shopping', 'International']
  },
  {
    id: 'fallback-19',
    name: 'Greenwich Village',
    category: 'Neighborhood',
    description: 'Historic bohemian neighborhood with charming streets, cafes, and nightlife.',
    location: {
      lat: 40.7336,
      lng: -74.0027,
      address: 'Greenwich Village, New York, NY 10014'
    },
    price_level: 2,
    rating: 4.6,
    photos: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'],
    tags: ['Neighborhood', 'Culture', 'Food', 'Nightlife']
  },
  {
    id: 'fallback-20',
    name: 'Prospect Park',
    category: 'Park',
    description: 'Large Brooklyn park with meadows, forests, lake, and recreational facilities.',
    location: {
      lat: 40.6602,
      lng: -73.9690,
      address: 'Brooklyn, NY 11225'
    },
    price_level: 1,
    rating: 4.7,
    photos: ['https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800'],
    tags: ['Park', 'Nature', 'Outdoor', 'Family-Friendly']
  }
]