import type { UserInput, Activity, DayPlan, Itinerary } from "@/types/itinerary";

// Activity templates based on preferences and budget
const ACTIVITY_TEMPLATES: Record<string, Activity[]> = {
  beach: [
    {
      id: "beach-relax",
      title: "Beach Relaxation",
      description: "Enjoy the sun, sand, and sea at the beautiful beach",
      duration: "3 hours",
      cost: "Free",
      category: "beach",
      imageUrl: "https://source.unsplash.com/800x600/?beach,relax"
    },
    {
      id: "beach-sports",
      title: "Water Sports",
      description: "Try exciting water activities like snorkeling or paddleboarding",
      duration: "2 hours",
      cost: "$50-100",
      category: "beach",
      imageUrl: "https://source.unsplash.com/800x600/?water,sports"
    }
  ],
  nature: [
    {
      id: "nature-hike",
      title: "Nature Hike",
      description: "Explore scenic trails and enjoy breathtaking views",
      duration: "4 hours",
      cost: "Free",
      category: "nature",
      imageUrl: "https://source.unsplash.com/800x600/?hiking,nature"
    },
    {
      id: "nature-park",
      title: "National Park Visit",
      description: "Discover local wildlife and natural wonders",
      duration: "5 hours",
      cost: "$20-40",
      category: "nature",
      imageUrl: "https://source.unsplash.com/800x600/?national,park"
    }
  ],
  luxury: [
    {
      id: "luxury-spa",
      title: "Luxury Spa Treatment",
      description: "Indulge in premium spa services and wellness treatments",
      duration: "3 hours",
      cost: "$150-300",
      category: "luxury",
      imageUrl: "https://source.unsplash.com/800x600/?spa,luxury"
    },
    {
      id: "luxury-dining",
      title: "Fine Dining Experience",
      description: "Enjoy a gourmet meal at a top-rated restaurant",
      duration: "2 hours",
      cost: "$100-200",
      category: "luxury",
      imageUrl: "https://source.unsplash.com/800x600/?fine,dining"
    }
  ],
  culture: [
    {
      id: "culture-museum",
      title: "Museum Visit",
      description: "Explore local history and art collections",
      duration: "2 hours",
      cost: "$15-30",
      category: "culture",
      imageUrl: "https://source.unsplash.com/800x600/?museum,art"
    },
    {
      id: "culture-tour",
      title: "Historical City Tour",
      description: "Discover the rich heritage and landmarks",
      duration: "3 hours",
      cost: "$25-50",
      category: "culture",
      imageUrl: "https://source.unsplash.com/800x600/?historical,tour"
    }
  ],
  adventure: [
    {
      id: "adventure-zipline",
      title: "Zipline Adventure",
      description: "Experience thrilling zipline through scenic landscapes",
      duration: "3 hours",
      cost: "$80-150",
      category: "adventure",
      imageUrl: "https://source.unsplash.com/800x600/?zipline,adventure"
    },
    {
      id: "adventure-kayaking",
      title: "Kayaking Expedition",
      description: "Navigate through beautiful waterways",
      duration: "4 hours",
      cost: "$60-120",
      category: "adventure",
      imageUrl: "https://source.unsplash.com/800x600/?kayaking,water"
    }
  ],
  urban: [
    {
      id: "urban-shopping",
      title: "Shopping District",
      description: "Explore local markets and shopping areas",
      duration: "3 hours",
      cost: "$30-100",
      category: "urban",
      imageUrl: "https://source.unsplash.com/800x600/?shopping,city"
    },
    {
      id: "urban-nightlife",
      title: "City Nightlife",
      description: "Experience vibrant bars and entertainment venues",
      duration: "4 hours",
      cost: "$40-80",
      category: "urban",
      imageUrl: "https://source.unsplash.com/800x600/?nightlife,city"
    }
  ],
  relax: [
    {
      id: "relax-garden",
      title: "Botanical Garden",
      description: "Peaceful stroll through beautiful gardens",
      duration: "2 hours",
      cost: "$10-20",
      category: "relax",
      imageUrl: "https://source.unsplash.com/800x600/?botanical,garden"
    },
    {
      id: "relax-cafe",
      title: "Local Café Experience",
      description: "Enjoy coffee and local cuisine",
      duration: "1.5 hours",
      cost: "$15-30",
      category: "relax",
      imageUrl: "https://source.unsplash.com/800x600/?cafe,relax"
    }
  ]
};

// Budget multipliers for activity costs
const BUDGET_MULTIPLIERS = {
  low: 0.7,      // 70% of standard cost
  medium: 1.0,   // Standard cost
  premium: 1.5   // 150% of standard cost (premium experiences)
};

export function getDaysBetweenDates(startDate: string, endDate: string): Date[] {
  const days: Date[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

export function generateActivities(
  preferences: Record<string, number>,
  budget: "low" | "medium" | "premium",
  maxActivities: number = 3
): Activity[] {
  const activities: Activity[] = [];
  const threshold = 50; // Minimum preference score to consider
  
  // Sort preferences by score (highest first)
  const sortedPrefs = Object.entries(preferences)
    .filter(([_, score]) => score >= threshold)
    .sort(([, a], [, b]) => b - a);
  
  // Generate activities based on top preferences
  for (const [category, score] of sortedPrefs) {
    if (activities.length >= maxActivities) break;
    
    const categoryActivities = ACTIVITY_TEMPLATES[category];
    if (!categoryActivities) continue;
    
    // Select activities appropriate for budget
    const suitableActivities = categoryActivities.filter(activity => {
      if (budget === "low" && activity.cost !== "Free") return false;
      if (budget === "premium" && activity.cost === "Free") return false;
      return true;
    });
    
    if (suitableActivities.length > 0) {
      // Select random activity from suitable ones
      const selectedActivity = suitableActivities[
        Math.floor(Math.random() * suitableActivities.length)
      ];
      
      // Adjust cost based on budget
      let adjustedCost = selectedActivity.cost;
      if (selectedActivity.cost !== "Free") {
        const multiplier = BUDGET_MULTIPLIERS[budget];
        const costRange = selectedActivity.cost.replace(/[^0-9-]/g, "").split("-").map(Number);
        if (costRange.length === 2) {
          const minCost = Math.round(costRange[0] * multiplier);
          const maxCost = Math.round(costRange[1] * multiplier);
          adjustedCost = budget === "premium" ? `$${maxCost}` : `$${minCost}`;
        }
      }
      
      activities.push({
        ...selectedActivity,
        cost: adjustedCost
      });
    }
  }
  
  // Add a default activity if none generated
  if (activities.length === 0) {
    activities.push({
      id: "default-explore",
      title: "City Exploration",
      description: "Discover the local area and find hidden gems",
      duration: "3 hours",
      cost: "Free",
      category: "urban",
      imageUrl: `https://source.unsplash.com/800x600/?city,exploration`
    });
  }
  
  return activities;
}

export function generateItinerary(input: UserInput): Itinerary {
  const days = getDaysBetweenDates(input.startDate, input.endDate);
  
  const dayPlans: DayPlan[] = days.map((day, index) => {
    const activities = generateActivities(input.preferences, input.budget);
    const dayNumber = index + 1;
    
    return {
      day: dayNumber,
      title: `Day ${dayNumber}`,
      date: day.toISOString().split('T')[0],
      activities,
      imageUrl: `https://source.unsplash.com/800x600/?${input.destination},travel,day${dayNumber}`,
      estimatedCost: activities.reduce((total, activity) => {
        if (activity.cost === "Free") return total;
        const cost = parseInt(activity.cost.replace(/[^0-9]/g, ""));
        return total + cost;
      }, 0)
    };
  });
  
  const totalEstimatedCost = dayPlans.reduce((total, day) => total + day.estimatedCost, 0);
  
  return {
    id: Date.now().toString(),
    destination: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    totalDays: days.length,
    budget: input.budget,
    days: dayPlans,
    totalEstimatedCost,
    createdAt: new Date().toISOString()
  };
}

export function estimateDailyBudget(budget: string, days: number): number {
  const baseDailyBudgets: Record<string, number> = {
    low: 50,
    medium: 150,
    premium: 400
  };
  
  return (baseDailyBudgets[budget] || 150) * days;
}
