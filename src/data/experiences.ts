export type Experience = {
    id: string
    destination: string
    title: string
    subtitle?: string
    tags: string[]
  }
  
  export const EXPERIENCES: Experience[] = [
    { id:'la_1', destination:'los angeles', title:'Malibu Overlook', subtitle:'Sunset pull-off with ocean cliffs', tags:['ocean-view','photography']},
    { id:'la_2', destination:'los angeles', title:'Arts District Stroll', subtitle:'Murals, galleries, coffee', tags:['art','coffee','photography']},
    { id:'la_3', destination:'los angeles', title:'Griffith Twilight Hike', subtitle:'City lights + trail', tags:['hiking','mountains']},
  
    { id:'nyc_1', destination:'new york', title:'DUMBO Bridge Shot', subtitle:'Iconic skyline photo spot', tags:['photography','art']},
    { id:'nyc_2', destination:'new york', title:'Hidden Jazz Cellar', subtitle:'Late-night small venue', tags:['nightlife']},
    { id:'nyc_3', destination:'new york', title:'Chelsea Market Bites', subtitle:'Global eats in one hall', tags:['foodie']},
  
    { id:'sf_1', destination:'san francisco', title:'Battery Spencer Vista', subtitle:'Golden Gate sunrise view', tags:['photography','ocean-view']},
    { id:'sf_2', destination:'san francisco', title:'Lands End Trail', subtitle:'Coastal hike to Sutro Baths', tags:['hiking','ocean-view']},
    { id:'sf_3', destination:'san francisco', title:'Third Wave Crawl', subtitle:'Roasters in SoMa/Mission', tags:['coffee','foodie']},
  ]
  