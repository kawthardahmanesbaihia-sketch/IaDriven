export interface ItineraryHotel {
  name: string;
  price?: string;
  description?: string;
  image?: string;
}

export interface ItineraryRestaurant {
  name: string;
  cuisine?: string;
  price?: string;
  description?: string;
  image?: string;
}

export interface ItineraryActivity {
  name: string;
  duration?: string;
  description?: string;
  image?: string;
}

export interface ItinerarySlot {
  time: 'Morning' | 'Afternoon' | 'Evening' | 'Overnight';
  label: string;
  detail: string;
  type: 'activity' | 'food' | 'hotel';
  tag?: string;
}

export interface GeneratedDay {
  dayNumber: number;
  date: string;
  theme: string;
  slots: ItinerarySlot[];
}

const PREFERENCE_THEMES: Record<string, string> = {
  culture: 'Culture & History',
  adventure: 'Adventure Day',
  food: 'Food & Flavors',
  relaxation: 'Relaxation & Wellness',
};

const FALLBACK_THEMES = [
  'Arrival & Exploration',
  'Culture & History',
  'Adventure Day',
  'Food & Flavors',
  'Relaxation & Wellness',
  'Local Experiences',
  'Hidden Gems',
];

function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function buildItineraryFromDestination(params: {
  destinationName: string;
  hotels: ItineraryHotel[];
  restaurants: ItineraryRestaurant[];
  activities: ItineraryActivity[];
  startDate: string;
  endDate: string;
  preferences: string[];
  budget: string;
}): GeneratedDay[] {
  const { hotels, restaurants, activities, startDate, endDate, preferences, destinationName } = params;

  const dates = getDatesBetween(startDate, endDate);
  if (dates.length === 0) return [];

  // Build theme list: user-chosen preferences first, then generic fallbacks
  const themeList: string[] = [
    ...preferences.map(p => PREFERENCE_THEMES[p.toLowerCase()] ?? p),
    ...FALLBACK_THEMES,
  ];

  // Deterministic fallbacks so we never hit empty arrays
  const safeActivities: ItineraryActivity[] = activities.length > 0
    ? activities
    : [{ name: `Explore ${destinationName}`, description: 'Discover local sights and culture', duration: '3 hours' }];

  const safeRestaurants: ItineraryRestaurant[] = restaurants.length > 0
    ? restaurants
    : [{ name: 'Local Restaurant', cuisine: 'Local Cuisine', price: '$$' }];

  const safeHotels: ItineraryHotel[] = hotels.length > 0
    ? hotels
    : [{ name: `${destinationName} Hotel`, description: 'Comfortable accommodation' }];

  // Index-based cycling — fully deterministic, no Math.random()
  return dates.map((date, dayIdx) => {
    const morning = safeActivities[dayIdx % safeActivities.length];
    const afternoon = safeActivities[(dayIdx + 1) % safeActivities.length];
    const restaurant = safeRestaurants[dayIdx % safeRestaurants.length];
    const hotel = safeHotels[dayIdx % safeHotels.length];
    const theme = themeList[dayIdx % themeList.length];

    return {
      dayNumber: dayIdx + 1,
      date,
      theme,
      slots: [
        {
          time: 'Morning',
          label: morning.name,
          detail: morning.description ?? 'Start the day with this activity',
          type: 'activity',
          tag: morning.duration,
        },
        {
          time: 'Afternoon',
          label: afternoon.name,
          detail: afternoon.description ?? 'Afternoon exploration',
          type: 'activity',
          tag: afternoon.duration,
        },
        {
          time: 'Evening',
          label: `Dinner at ${restaurant.name}`,
          detail: restaurant.cuisine ? `${restaurant.cuisine} cuisine` : 'Local dining experience',
          type: 'food',
          tag: restaurant.price,
        },
        {
          time: 'Overnight',
          label: `Stay at ${hotel.name}`,
          detail: hotel.description ?? 'Comfortable accommodation',
          type: 'hotel',
          tag: hotel.price,
        },
      ],
    };
  });
}
