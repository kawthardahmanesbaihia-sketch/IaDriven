/**
 * Country-Specific Activities Generator
 * Generates realistic activities based on country, user preferences, and local culture
 */

export interface EnhancedActivity {
  name: string;
  description: string;
  duration: string;
  estimatedBudget: string;
  category: 'cultural' | 'nature' | 'adventure' | 'food' | 'hidden-gems' | 'day' | 'night';
  image?: string;
  rating?: number;
}

// Country-specific activity databases
const countryActivities: Record<string, {
  cultural: Array<{ name: string; description: string; duration: string; budget: string }>;
  nature: Array<{ name: string; description: string; duration: string; budget: string }>;
  adventure: Array<{ name: string; description: string; duration: string; budget: string }>;
  food: Array<{ name: string; description: string; duration: string; budget: string }>;
  hiddenGems: Array<{ name: string; description: string; duration: string; budget: string }>;
  day: Array<{ name: string; description: string; duration: string; budget: string }>;
  night: Array<{ name: string; description: string; duration: string; budget: string }>;
}> = {
  'France': {
    cultural: [
      { name: 'Louvre Museum Skip-the-Line Tour', description: 'Bypass crowds with early access to the world-famous museum and see the Mona Lisa, Venus de Milo, and other masterpieces', duration: '3 hours', budget: '€€25-35' },
      { name: 'Eiffel Tower Summit Experience', description: 'Climb the iconic Eiffel Tower for breathtaking views of Paris and learn about its fascinating history from expert guides', duration: '2 hours', budget: '€€30-50' },
      { name: 'Seine River Dinner Cruise', description: 'Romantic evening cruise along the Seine with traditional French cuisine and live music', duration: '3 hours', budget: '€€60-90' },
      { name: 'Montmartre Art District Walking Tour', description: 'Explore the bohemian neighborhood where Picasso, Van Gogh, and other famous artists lived and worked', duration: '2.5 hours', budget: '€€20-30' },
    ],
    nature: [
      { name: 'Versailles Gardens & Palace', description: 'Day trip to magnificent palace gardens and opulent royal palace, easily accessible from Paris', duration: 'Full day', budget: '€€25-40' },
      { name: 'Giverny Day Trip', description: 'Visit the charming medieval town and its impressive limestone caves for wine tasting and castle exploration', duration: 'Full day', budget: '€€40-60' },
      { name: 'Loire Valley Castles Tour', description: 'Explore magnificent Renaissance castles along the beautiful Loire River with expert commentary', duration: 'Full day', budget: '€€45-70' },
    ],
    adventure: [
      { name: 'Hot Air Balloon over Paris', description: 'Sunrise or sunset flight over Paris in a traditional hot air balloon with champagne toast', duration: '3 hours', budget: '€€150-250' },
      { name: 'Normandy D-Day Beaches Tour', description: 'Historical tour of the D-Day landing beaches, American cemeteries, and Pointe du Hoc with expert guide', duration: 'Full day', budget: '€€70-100' },
      { name: 'French Alps Day Hiking', description: 'Guided hiking trip in Chamonix with stunning Alpine views and mountain picnic', duration: 'Full day', budget: '€€80-120' },
    ],
    food: [
      { name: 'French Pastry & Chocolate Workshop', description: 'Learn to make croissants and macarons from a master patissier in a intimate Parisian workshop', duration: '3 hours', budget: '€€45-65' },
      { name: 'Bordeaux Wine Region Tour', description: 'Visit prestigious vineyards, enjoy wine tastings, and have a gourmet lunch at a château', duration: 'Full day', budget: '€€120-180' },
      { name: 'Provence Olive Oil & Truffle Farm Visit', description: 'Visit a family farm to learn about olive oil production and hunt for truffles with traditional lunch', duration: '4 hours', budget: '€€60-85' },
    ],
    hiddenGems: [
      { name: 'Sainte-Chapelle Enamel Art Workshop', description: 'Create your own enamel artwork in a traditional workshop in the medieval artists\' quarter', duration: '2.5 hours', budget: '€€30-45' },
      { name: 'Canal Saint-Martin Neighborhood Walk', description: 'Explore the charming historic canal district with its houseboats, artists\' studios, and local cafés', duration: '2 hours', budget: '€€15-25' },
      { name: 'Covered Passages of Paris Underground Tour', description: 'Secret passages and tunnels used by resistance and spies during World War II with fascinating stories', duration: '2 hours', budget: '€€20-30' },
    ],
    day: [
      { name: 'Luxembourg Gardens Picnic', description: 'Relax in beautiful gardens with fresh baguette, cheese, and wine from local specialty shops', duration: '3 hours', budget: '€€25-40' },
      { name: 'Seine River Banks Bike Ride', description: 'Cycle along the scenic Seine with stops at iconic bridges and riverside cafés', duration: '4 hours', budget: '€€30-45' },
      { name: 'Le Marais Market & Food Tour', description: 'Explore historic Jewish quarter with its medieval architecture, trendy boutiques, and diverse food stalls', duration: '3 hours', budget: '€€35-55' },
    ],
    night: [
      { name: 'Moulin Rouge Cabaret Show', description: 'Spectacular dinner show with can-can dancers, live music, and classic French entertainment', duration: '3 hours', budget: '€€80-150' },
      { name: 'Jazz Club Caveau du Soleil', description: 'Experience authentic Parisian jazz in a historic cellar club with intimate atmosphere', duration: '3 hours', budget: '€€25-40' },
      { name: 'Seine River Illuminations Cruise', description: 'Evening cruise to see Paris monuments beautifully lit up with commentary and champagne', duration: '2.5 hours', budget: '€€45-75' },
    ],
  },
  'Italy': {
    cultural: [
      { name: 'Vatican Museums VIP Tour', description: 'Skip-the-line access to Vatican Museums with expert guide including Sistine Chapel and St. Peter\'s Basilica', duration: '4 hours', budget: '€€80-120' },
      { name: 'Colosseum Underground & Arena', description: 'Explore the underground levels and gladiator school of the Colosseum with skip-the-line arena access', duration: '3 hours', budget: '€€25-35' },
      { name: 'Florence Uffizi Gallery & Palazzo Vecchio', description: 'Guided tour of Renaissance art gallery and historic town hall with panoramic city views', duration: '3 hours', budget: '€€30-45' },
      { name: 'Venice Glass Blowing Workshop', description: 'Learn traditional Venetian glassblowing techniques and create your own glass souvenir', duration: '2 hours', budget: '€€35-50' },
    ],
    nature: [
      { name: 'Amalfi Coast Scenic Drive', description: 'Drive along stunning Mediterranean coastline with stops in Positano, Amalfi, and Ravello', duration: 'Full day', budget: '€€60-90' },
      { name: 'Cinque Terre Hiking Adventure', description: 'Hike the spectacular five cliffside villages connected by scenic trails with local guide', duration: 'Full day', budget: '€€40-60' },
      { name: 'Tuscany Hot Air Balloon', description: 'Sunrise flight over rolling hills, vineyards, and medieval towns with champagne breakfast', duration: '3 hours', budget: '€€120-180' },
    ],
    adventure: [
      { name: 'Pompeii & Mount Vesuvius Tour', description: 'Explore ancient Roman city buried by volcanic ash with expert archaeological guide', duration: 'Full day', budget: '€€70-100' },
      { name: 'Sicily Mount Etna Excursion', description: 'Hike Europe\'s most active volcano with safety equipment and local geologist guide', duration: 'Full day', budget: '€€80-120' },
      { name: 'Italian Alps Ski Day', description: 'Ski or snowboard in the Dolomites with equipment rental and mountain lunch', duration: 'Full day', budget: '€€100-150' },
    ],
    food: [
      { name: 'Rome Food & Wine Walking Tour', description: 'Taste authentic Roman cuisine and local wines in historic trattorias with expert sommelier', duration: '4 hours', budget: '€€60-85' },
      { name: 'Bologna Cooking Class', description: 'Learn to make fresh pasta and mortadella from Bolognese nonna in a historic palazzo', duration: '4 hours', budget: '€€50-70' },
      { name: 'Tuscany Farm-to-Table Experience', description: 'Visit family farm for seasonal ingredients, cooking demonstration, and gourmet meal with wine pairing', duration: '5 hours', budget: '€€70-95' },
    ],
    hiddenGems: [
      { name: 'Trastevere Neighborhood Food Tour', description: 'Explore authentic Roman neighborhood away from tourist crowds with local food specialties and family-run businesses', duration: '3 hours', budget: '€€35-50' },
      { name: 'Orvieto Day Trip', description: 'Visit well-preserved medieval hill town with underground city, historic buildings, and local wine tasting', duration: 'Full day', budget: '€€40-60' },
      { name: 'Appian Way Cycling', description: 'Bike the ancient Roman road with stops along aqueducts and ancient tombs with picnic lunch', duration: 'Full day', budget: '€€45-65' },
    ],
    day: [
      { name: 'Spanish Steps Rome Gathering', description: 'Join locals at the iconic Spanish Steps for aperitivo and people-watching in the heart of Rome', duration: '2 hours', budget: '€€20-35' },
      { name: 'Villa Borghese Gardens & Lake', description: 'Relax in beautiful gardens with lake views, rent rowboat, and enjoy picnic supplies', duration: '4 hours', budget: '€€30-50' },
      { name: 'Testaccio Market Visit', description: 'Explore authentic local market with fresh produce, street food, and artisan crafts in a working-class neighborhood', duration: '2.5 hours', budget: '€€15-25' },
    ],
    night: [
      { name: 'Rooftop Bar Aperitivo', description: 'Enjoy sunset drinks and Roman skyline views from a stylish rooftop bar near the Spanish Steps', duration: '2.5 hours', budget: '€€30-50' },
      { name: 'Trastevere Wine Bar Evening', description: 'Experience authentic Roman neighborhood nightlife with local wines and bar snacks in family-run enoteca', duration: '3 hours', budget: '€€25-40' },
      { name: 'Tiber River Night Cruise', description: 'Romantic cruise with live music, dinner, and illuminated Rome monuments', duration: '3 hours', budget: '€€60-90' },
    ],
  },
  'Japan': {
    cultural: [
      { name: 'Senso-ji Temple Morning Visit', description: 'Experience serene Buddhist temple with morning prayers, traditional architecture, and zen garden meditation', duration: '2 hours', budget: '¥¥2000-3000' },
      { name: 'Tea Ceremony Experience', description: 'Participate in authentic tea ceremony with master tea practitioner in traditional tatami room', duration: '1.5 hours', budget: '¥¥3000-5000' },
      { name: 'Samurai Sword Fighting Demonstration', description: 'Watch traditional samurai martial arts demonstration and learn about katana sword crafting', duration: '2 hours', budget: '¥¥2500-4000' },
    ],
    nature: [
      { name: 'Mount Fuji Day Trip', description: 'Climb Japan\'s sacred mountain with guide, equipment rental, and sunrise viewing from summit', duration: 'Full day', budget: '¥¥8000-15000' },
      { name: 'Aokigahara Bamboo Grove', description: 'Walk through mystical bamboo forest and visit nearby temples in this traditional craft village', duration: 'Half day', budget: '¥¥1500-3000' },
      { name: 'Nikko National Park Tour', description: 'Explore hot springs, wild monkeys, and traditional onsen with mountain scenery and local lunch', duration: 'Full day', budget: '¥¥5000-8000' },
    ],
    adventure: [
      { name: 'Tokyo Skytree Walking Experience', description: 'Walk across the world\'s tallest tower with transparent glass floor and city views from 450m high', duration: '2 hours', budget: '¥¥3000-4000' },
      { name: 'Osaka Castle Universal Studios Japan', description: 'Full day at theme park with Super Nintendo World, The Wizarding World, and exciting rides', duration: 'Full day', budget: '¥¥12000-18000' },
      { name: 'Hiroshima Peace Memorial & Miyajima Island', description: 'Visit memorial park, museum, and take ferry to sacred island with its famous shrine and torii gate', duration: 'Full day', budget: '¥¥8000-12000' },
    ],
    food: [
      { name: 'Tsukiji Fish Market Breakfast Tour', description: 'Early morning visit to world\'s largest fish market with fresh sushi breakfast and tuna auction viewing', duration: '3 hours', budget: '¥¥3000-5000' },
      { name: 'Ramen Making Workshop in Tokyo', description: 'Learn to make authentic ramen from noodle pulling to broth preparation with ramen master', duration: '3 hours', budget: '¥¥4000-6000' },
      { name: 'Kyoto Kaiseki Dining Experience', description: 'Traditional multi-course Japanese dinner in historic restaurant with seasonal ingredients and tea ceremony', duration: '2.5 hours', budget: '¥¥8000-15000' },
    ],
    hiddenGems: [
      { name: 'Yanaka Ginza District Walking', description: 'Explore upscale shopping district with art galleries, traditional crafts, and exclusive department stores', duration: '3 hours', budget: '¥¥3000-5000' },
      { name: 'Shibuya Crossing Scramble', description: 'Experience world\'s busiest intersection during rush hour with local guide and street food tasting', duration: '2 hours', budget: '¥¥2000-3000' },
      { name: 'Gion Corner Kyoto Evening', description: 'Walk through historic geisha district with chance to spot geishas and visit traditional tea houses', duration: '2 hours', budget: '¥¥2500-4000' },
    ],
    day: [
      { name: 'Ueno Park Cherry Blossom Picnic', description: 'Enjoy seasonal hanami picnic with bento box, sake, and traditional music under cherry trees', duration: '3 hours', budget: '¥¥3000-5000' },
      { name: 'Shibuya Karaoke Experience', description: 'Private karaoke room with current J-pop hits, drinks, and Japanese snacks in entertainment district', duration: '2.5 hours', budget: '¥¥4000-6000' },
      { name: 'Tokyo Bay Ferry Ride', description: 'Scenic ferry ride across Tokyo Bay with views of Rainbow Bridge and city skyline', duration: '1 hour', budget: '¥¥500-1000' },
    ],
    night: [
      { name: 'Golden Gai Bar & Club Night', description: 'Experience Tokyo nightlife with multiple floors of entertainment, live DJs, and city views from observation decks', duration: '4 hours', budget: '¥¥5000-10000' },
      { name: 'Kabukicho Night Food Stalls', description: 'Explore tiny district with amazing street food, tiny bars, and neon signs in the heart of Tokyo', duration: '3 hours', budget: '¥¥3000-6000' },
      { name: 'Tokyo Tower Night Illumination', description: 'See Tokyo Tower lit up with seasonal light shows and city views from observation deck', duration: '2 hours', budget: '¥¥2000-3000' },
    ],
  },
  'United States': {
    cultural: [
      { name: 'Statue of Liberty & Ellis Island Tour', description: 'Ferry to Liberty Island with early access to Statue of Liberty and immigration museum', duration: '4 hours', budget: '$80-120' },
      { name: 'Metropolitan Museum of Art VIP Tour', description: 'Skip-the-line access to world-class art collection including Egyptian Temple and American Wing', duration: '3 hours', budget: '$75-100' },
      { name: 'Broadway Show Experience', description: 'See a top Broadway musical with prime seats and pre-show dinner in Times Square', duration: '3 hours', budget: '$150-300' },
    ],
    nature: [
      { name: 'Grand Canyon Helicopter Tour', description: 'Aerial tour of one of the world\'s seven natural wonders with pilot commentary and landing', duration: '3 hours', budget: '$250-400' },
      { name: 'Yellowstone Geysers & Wildlife Safari', description: 'See Old Faithful geyser eruption and spot bison, elk, and bears with naturalist guide', duration: 'Full day', budget: '$150-250' },
      { name: 'Yosemite Valley Hiking Adventure', description: 'Guided hike to Half Dome and Yosemite Falls with park ranger and picnic lunch', duration: 'Full day', budget: '$120-200' },
    ],
    adventure: [
      { name: 'Las Vegas Indoor Skydiving', description: 'Experience the thrill of indoor skydiving with professional instructors and video of your jump', duration: '4 hours', budget: '$300-500' },
      { name: 'New Orleans Swamp Airboat Tour', description: 'High-speed airboat ride through Louisiana bayous with alligator spotting and Cajun culture', duration: '2 hours', budget: '$60-90' },
      { name: 'Alaska Dog Sledding Adventure', description: 'Mush through snowy wilderness with team of sled dogs and experienced musher guide', duration: 'Full day', budget: '$200-350' },
    ],
    food: [
      { name: 'New Orleans Creole Cooking Class', description: 'Learn to make gumbo, jambalaya, and beignets from local chef in historic French Quarter', duration: '4 hours', budget: '$80-120' },
      { name: 'Napa Valley Wine & Dine Tour', description: 'Visit prestigious vineyards, enjoy wine tastings, and have gourmet lunch at renowned restaurant', duration: 'Full day', budget: '$200-350' },
      { name: 'Texas BBQ & Smokehouse Experience', description: 'Learn authentic Texas barbecue techniques and enjoy slow-smoked meats with local pitmaster', duration: '4 hours', budget: '$60-90' },
    ],
    hiddenGems: [
      { name: 'Charleston Historic Market Food Tour', description: 'Explore historic market with local food vendors, artisan crafts, and Gullah culture with expert guide', duration: '3 hours', budget: '$50-80' },
      { name: 'Savannah Historic District Walk', description: 'Walk through beautiful squares with Spanish moss, historic homes, and local ghost stories', duration: '2.5 hours', budget: '$30-50' },
      { name: 'Blue Ridge Parkway Scenic Drive', description: 'Drive through stunning mountain scenery with stops at overlooks, hiking trails, and mountain towns', duration: 'Full day', budget: '$40-60' },
    ],
    day: [
      { name: 'Central Park Picnic & Concert', description: 'Enjoy afternoon picnic with local food trucks and free concert in the heart of Manhattan', duration: '4 hours', budget: '$40-80' },
      { name: 'Miami Beach Art Deco Historic Tour', description: 'Walk through colorful Art Deco district with pastel buildings, vintage hotels, and beachfront promenade', duration: '3 hours', budget: '$50-75' },
      { name: 'San Francisco Fisherman\'s Wharf Seafood Lunch', description: 'Fresh seafood lunch with sourdough bread and sea lion viewing at historic wharf', duration: '2.5 hours', budget: '$60-100' },
    ],
    night: [
      { name: 'New Orleans Jazz Clubs on Frenchmen Street', description: 'Experience authentic jazz in historic clubs with live music and local atmosphere', duration: '4 hours', budget: '$50-100' },
      { name: 'Las Vegas Strip Casino Night', description: 'Visit world-famous casinos with shows, fine dining, and entertainment on the Strip', duration: '5 hours', budget: '$100-300' },
      { name: 'Chicago Architecture River Cruise', description: 'Evening architectural cruise with city skyline views, dinner, and commentary on famous buildings', duration: '2.5 hours', budget: '$75-125' },
    ],
  }
};

// Get activities for a specific country
export function generateCountrySpecificActivities(
  countryName: string,
  userPreferences: string[] = [],
  budget: string = 'mid-range'
): EnhancedActivity[] {
  const countryData = countryActivities[countryName];
  
  if (!countryData) {
    // Fallback to generic activities
    return generateGenericActivities(countryName, budget);
  }

  const activities: EnhancedActivity[] = [];
  
  // Always include all activities from every category for variety across multi-day trips
  activities.push(...countryData.cultural.map((a, i) => ({ ...a, estimatedBudget: a.budget, category: 'cultural' as const, rating: 4.5 + i * 0.05 })));
  activities.push(...countryData.nature.map((a, i)   => ({ ...a, estimatedBudget: a.budget, category: 'nature'   as const, rating: 4.3 + i * 0.05 })));
  activities.push(...countryData.adventure.map((a, i) => ({ ...a, estimatedBudget: a.budget, category: 'adventure' as const, rating: 4.4 + i * 0.05 })));
  activities.push(...countryData.food.map((a, i)      => ({ ...a, estimatedBudget: a.budget, category: 'food'      as const, rating: 4.2 + i * 0.05 })));
  activities.push(...countryData.hiddenGems.map((a, i)=> ({ ...a, estimatedBudget: a.budget, category: 'hidden-gems' as const, rating: 4.6 + i * 0.05 })));
  activities.push(...countryData.day.map((a, i)       => ({ ...a, estimatedBudget: a.budget, category: 'day'       as const, rating: 4.1 + i * 0.05 })));
  activities.push(...countryData.night.map((a, i)     => ({ ...a, estimatedBudget: a.budget, category: 'night'     as const, rating: 4.3 + i * 0.05 })));

  // Prioritise preference-matching categories by moving them to the front
  const preferred: typeof activities = [];
  const rest: typeof activities = [];
  for (const act of activities) {
    const cat = act.category;
    const matches =
      (userPreferences.includes('culture')    && cat === 'cultural') ||
      (userPreferences.includes('nature')     && (cat === 'nature' || cat === 'adventure')) ||
      (userPreferences.includes('adventure')  && cat === 'adventure') ||
      (userPreferences.includes('food')       && cat === 'food');
    if (matches) preferred.push(act); else rest.push(act);
  }

  return [...preferred, ...rest].slice(0, 21); // up to 21 = 7 days × 3 activities
}

// Generate generic activities for countries not in database
function generateGenericActivities(
  countryName: string,
  budget: string
): EnhancedActivity[] {
  const budgetSymbol = getBudgetSymbol(budget);
  
  return [
    {
      name: `${countryName} Cultural Immersion`,
      description: `Experience local culture, traditions, and way of life in ${countryName}`,
      duration: 'Half day',
      estimatedBudget: `${budgetSymbol}50-100`,
      category: 'cultural',
      rating: 4.5
    },
    {
      name: `${countryName} Natural Attractions`,
      description: `Explore scenic landscapes and natural wonders in ${countryName}`,
      duration: 'Full day',
      estimatedBudget: `${budgetSymbol}40-80`,
      category: 'nature',
      rating: 4.3
    },
    {
      name: `${countryName} Local Cuisine Experience`,
      description: `Taste authentic local dishes and visit traditional restaurants in ${countryName}`,
      duration: '2-3 hours',
      estimatedBudget: `${budgetSymbol}30-60`,
      category: 'food',
      rating: 4.2
    },
    {
      name: `${countryName} Adventure Activity`,
      description: `Exciting outdoor adventure in ${countryName}`,
      duration: 'Full day',
      estimatedBudget: `${budgetSymbol}60-120`,
      category: 'adventure',
      rating: 4.4
    },
    {
      name: `${countryName} Hidden Gem Discovery`,
      description: `Discover off-the-beaten-path locations and local secrets in ${countryName}`,
      duration: 'Half day',
      estimatedBudget: `${budgetSymbol}20-50`,
      category: 'hidden-gems',
      rating: 4.6
    },
    {
      name: `${countryName} Day Exploration`,
      description: `Explore the city and surroundings during daylight hours in ${countryName}`,
      duration: '4 hours',
      estimatedBudget: `${budgetSymbol}30-70`,
      category: 'day',
      rating: 4.1
    },
    {
      name: `${countryName} Night Experience`,
      description: `Experience nightlife and evening entertainment in ${countryName}`,
      duration: '3 hours',
      estimatedBudget: `${budgetSymbol}40-100`,
      category: 'night',
      rating: 4.3
    }
  ];
}

function getBudgetSymbol(budget: string): string {
  switch (budget.toLowerCase()) {
    case 'budget':
    case 'low':
      return '$';
    case 'mid-range':
    case 'medium':
      return '$$';
    case 'luxury':
    case 'high':
      return '$$$';
    default:
      return '$$';
  }
}
