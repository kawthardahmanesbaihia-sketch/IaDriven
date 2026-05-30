export type NationalEvent = {
  id: string;
  name: string;
  date: string;
  type: "holiday" | "festival" | "cultural" | "religious" | "national";
  country: string;
  description: string;
  recurring: boolean;
  impact: "low" | "medium" | "high";
};

// Mock national events data for different countries
export const NATIONAL_EVENTS: NationalEvent[] = [
  // Islamic Holidays
  {
    id: "eid-al-fitr-2024",
    name: "Eid al-Fitr",
    date: "2024-04-10",
    type: "religious",
    country: "Morocco, Algeria, Tunisia, Egypt, UAE, Saudi Arabia",
    description: "End of Ramadan, celebration with family and feasts",
    recurring: true,
    impact: "high"
  },
  {
    id: "eid-al-adha-2024",
    name: "Eid al-Adha",
    date: "2024-06-17",
    type: "religious",
    country: "Morocco, Algeria, Tunisia, Egypt, UAE, Saudi Arabia",
    description: "Feast of Sacrifice, important Islamic celebration",
    recurring: true,
    impact: "high"
  },

  // European Holidays
  {
    id: "christmas-2024",
    name: "Christmas Day",
    date: "2024-12-25",
    type: "religious",
    country: "Spain, France, Italy, Germany, Netherlands",
    description: "Christian celebration of the birth of Jesus Christ",
    recurring: true,
    impact: "high"
  },
  {
    id: "new-year-2025",
    name: "New Year's Day",
    date: "2025-01-01",
    type: "national",
    country: "All countries",
    description: "First day of the Gregorian calendar year",
    recurring: true,
    impact: "medium"
  },

  // Asian Festivals
  {
    id: "chinese-new-year-2025",
    name: "Chinese New Year",
    date: "2025-01-29",
    type: "cultural",
    country: "Japan, Thailand, Malaysia, Singapore, China",
    description: "Lunar New Year celebration with dragon dances and fireworks",
    recurring: true,
    impact: "high"
  },

  {
    id: "diwali-2024",
    name: "Diwali",
    date: "2024-11-01",
    type: "religious",
    country: "India, Malaysia, Singapore",
    description: "Festival of Lights, Hindu celebration of good over evil",
    recurring: true,
    impact: "high"
  },

  // National Days
  {
    id: "independence-day-india",
    name: "Independence Day",
    date: "2024-08-15",
    type: "national",
    country: "India",
    description: "India's independence from British rule in 1947",
    recurring: true,
    impact: "high"
  },
  {
    id: "independence-day-usa",
    name: "Independence Day",
    date: "2024-07-04",
    type: "national",
    country: "USA",
    description: "American independence from British rule",
    recurring: true,
    impact: "high"
  },
  {
    id: "bastille-day-france",
    name: "Bastille Day",
    date: "2024-07-14",
    type: "national",
    country: "France",
    description: "French National Day, storming of the Bastille prison",
    recurring: true,
    impact: "medium"
  },

  // Cultural Events
  {
    id: "oktoberfest-2024",
    name: "Oktoberfest",
    date: "2024-09-21",
    type: "festival",
    country: "Germany",
    description: "World's largest beer festival in Munich",
    recurring: true,
    impact: "medium"
  },
  {
    id: "carnival-rio-2025",
    name: "Rio Carnival",
    date: "2025-03-03",
    type: "festival",
    country: "Brazil",
    description: "Famous carnival with samba parades and celebrations",
    recurring: true,
    impact: "high"
  },

  // Middle Eastern Events
  {
    id: "ramadan-start-2024",
    name: "Ramadan Start",
    date: "2024-03-11",
    type: "religious",
    country: "Morocco, Algeria, Tunisia, Egypt, UAE, Saudi Arabia",
    description: "Beginning of Islamic holy month of fasting",
    recurring: true,
    impact: "medium"
  },

  // African Events
  {
    id: "heritage-day-south-africa",
    name: "Heritage Day",
    date: "2024-09-24",
    type: "national",
    country: "South Africa",
    description: "Celebration of diverse cultural heritage",
    recurring: true,
    impact: "low"
  },

  // North American Events
  {
    id: "thanksgiving-usa",
    name: "Thanksgiving",
    date: "2024-11-28",
    type: "national",
    country: "USA",
    description: "Harvest festival and family gathering",
    recurring: true,
    impact: "medium"
  },
  {
    id: "canada-day",
    name: "Canada Day",
    date: "2024-07-01",
    type: "national",
    country: "Canada",
    description: "Canadian national celebration",
    recurring: true,
    impact: "medium"
  },

  // Oceanian Events
  {
    id: "anzac-day",
    name: "ANZAC Day",
    date: "2024-04-25",
    type: "national",
    country: "Australia, New Zealand",
    description: "Remembrance day for Australian and New Zealand forces",
    recurring: true,
    impact: "medium"
  },

  // South American Events
  {
    id: "independence-day-argentina",
    name: "Independence Day",
    date: "2024-07-09",
    type: "national",
    country: "Argentina",
    description: "Argentina's independence from Spain",
    recurring: true,
    impact: "high"
  },

  // Additional Religious Events
  {
    id: "easter-2024",
    name: "Easter Sunday",
    date: "2024-03-31",
    type: "religious",
    country: "Spain, France, Italy, Germany, Netherlands",
    description: "Christian celebration of resurrection",
    recurring: true,
    impact: "medium"
  },

  // Summer Events
  {
    id: "summer-solstice",
    name: "Summer Solstice",
    date: "2024-06-21",
    type: "cultural",
    country: "Sweden, Norway, Denmark",
    description: "Longest day of the year, traditional celebrations",
    recurring: true,
    impact: "low"
  }
];

export function getEventsByCountry(country: string, year: number = 2024): NationalEvent[] {
  return NATIONAL_EVENTS.filter(event => {
    // Check if the event applies to this country
    const countryList = event.country.split(", ").map(c => c.trim());
    const matchesCountry = countryList.some(c => 
      c.toLowerCase() === country.toLowerCase() || 
      c.toLowerCase() === "all countries"
    );
    
    // Check if the event is in the specified year
    const eventYear = parseInt(event.date.split("-")[0]);
    const matchesYear = eventYear === year;
    
    return matchesCountry && matchesYear;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getUpcomingEvents(country: string, days: number = 30): NationalEvent[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return getEventsByCountry(country)
    .filter(event => new Date(event.date) >= now && new Date(event.date) <= futureDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getEventsByType(type: NationalEvent["type"], country?: string): NationalEvent[] {
  let events = NATIONAL_EVENTS.filter(event => event.type === type);
  
  if (country) {
    events = events.filter(event => {
      const countryList = event.country.split(", ").map(c => c.trim());
      return countryList.some(c => c.toLowerCase() === country.toLowerCase());
    });
  }
  
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getHighImpactEvents(country: string): NationalEvent[] {
  return getEventsByCountry(country).filter(event => event.impact === "high");
}

export function getRecurringEvents(country: string): NationalEvent[] {
  return getEventsByCountry(country).filter(event => event.recurring);
}

export function getEventPlanningInsights(country: string): {
  upcomingEvents: NationalEvent[];
  highImpactEvents: NationalEvent[];
  bestTravelPeriods: Array<{ start: string; end: string; reason: string }>;
} {
  const upcomingEvents = getUpcomingEvents(country, 90); // Next 3 months
  const highImpactEvents = getHighImpactEvents(country);
  
  // Identify good travel periods (avoiding major holidays)
  const allEvents = getEventsByCountry(country);
  const highImpactDates = highImpactEvents.map(event => event.date);
  
  const bestTravelPeriods = [
    {
      start: "2024-01-15",
      end: "2024-02-15",
      reason: "Post-New Year, pre-spring travel window"
    },
    {
      start: "2024-04-20",
      end: "2024-05-20",
      reason: "Spring shoulder season, pleasant weather"
    },
    {
      start: "2024-09-15",
      end: "2024-10-15",
      reason: "Fall shoulder season, fewer crowds"
    }
  ];

  return {
    upcomingEvents,
    highImpactEvents,
    bestTravelPeriods
  };
}
