import type { UserTaste } from "@/hooks/useTaste";
import type { GroupPreferences } from "@/lib/leastMisery";

export type Destination = {
  name: string;
  code: string;
  tags: string[];
  description?: string;
};

export const destinations: Destination[] = [
  {
    name: "Spain",
    code: "ES",
    tags: ["beach", "relax", "culture", "urban", "mid-budget"],
    description: "Beautiful beaches, rich culture, and vibrant cities"
  },
  {
    name: "Thailand",
    code: "TH",
    tags: ["beach", "tropical", "nature", "low-budget", "relax"],
    description: "Tropical paradise with stunning beaches and temples"
  },
  {
    name: "Switzerland",
    code: "CH",
    tags: ["mountain", "nature", "adventure", "high-budget", "hiking"],
    description: "Alpine beauty and world-class hiking trails"
  },
  {
    name: "Canada",
    code: "CA",
    tags: ["nature", "adventure", "outdoor", "mid-budget", "wildlife"],
    description: "Vast wilderness and outdoor adventures"
  },
  {
    name: "Dubai",
    code: "AE",
    tags: ["luxury", "urban", "modern", "high-budget", "desert"],
    description: "Modern luxury with desert adventures"
  },
  {
    name: "France",
    code: "FR",
    tags: ["culture", "luxury", "urban", "traditional", "mid-budget"],
    description: "Art, cuisine, and timeless elegance"
  },
  {
    name: "Italy",
    code: "IT",
    tags: ["culture", "traditional", "relax", "mid-budget", "urban"],
    description: "History, art, and Mediterranean charm"
  },
  {
    name: "Japan",
    code: "JP",
    tags: ["urban", "modern", "culture", "high-budget", "traditional"],
    description: "Modern innovation meets ancient traditions"
  },
  {
    name: "Iceland",
    code: "IS",
    tags: ["nature", "adventure", "northern-lights", "high-budget", "cold"],
    description: "Dramatic landscapes and northern lights"
  },
  {
    name: "Maldives",
    code: "MV",
    tags: ["beach", "tropical", "luxury", "relax", "high-budget"],
    description: "Ultimate tropical luxury and relaxation"
  },
  {
    name: "Morocco",
    code: "MA",
    tags: ["desert", "culture", "traditional", "low-budget", "adventure"],
    description: "Exotic culture and desert adventures"
  },
  {
    name: "New Zealand",
    code: "NZ",
    tags: ["nature", "adventure", "outdoor", "mid-budget", "hiking"],
    description: "Adventure capital with stunning landscapes"
  }
];

/**
 * Calculate match score between user preferences and destination
 */
export function calculateDestinationScore(
  destination: Destination,
  preferences: UserTaste | GroupPreferences
): number {
  let totalScore = 0;
  let matchedTags = 0;

  Object.entries(preferences).forEach(([tag, weight]) => {
    if (destination.tags.includes(tag)) {
      totalScore += weight as number;
      matchedTags++;
    }
  });

  // Normalize by number of matched tags
  return matchedTags > 0 ? totalScore / matchedTags : 0;
}

/**
 * Suggest destinations based on user preferences
 */
export function suggestDestinations(
  preferences: UserTaste | GroupPreferences,
  limit: number = 3
): Array<{ destination: Destination; score: number }> {
  const scoredDestinations = destinations
    .map(destination => ({
      destination,
      score: calculateDestinationScore(destination, preferences)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredDestinations.slice(0, limit);
}

/**
 * Get destinations by tag
 */
export function getDestinationsByTag(tag: string): Destination[] {
  return destinations.filter(dest => dest.tags.includes(tag));
}

/**
 * Get all available tags
 */
export function getAllTags(): string[] {
  const allTags = new Set<string>();
  destinations.forEach(dest => {
    dest.tags.forEach(tag => allTags.add(tag));
  });
  return Array.from(allTags).sort();
}

/**
 * Explain why a destination was suggested
 */
export function getSuggestionExplanation(
  destination: Destination,
  preferences: UserTaste | GroupPreferences
): string[] {
  const matchedTags = destination.tags.filter(tag => preferences[tag] && preferences[tag] > 0);
  
  return matchedTags.map(tag => {
    const score = preferences[tag];
    return `${tag} (${score}% match)`;
  });
}

/**
 * Get budget-friendly destinations
 */
export function getBudgetFriendlyDestinations(budget: string): Destination[] {
  return destinations.filter(dest => dest.tags.includes(budget));
}

/**
 * Get destinations by travel type
 */
export function getDestinationsByTravelType(travelType: string): Destination[] {
  return destinations.filter(dest => dest.tags.includes(travelType));
}
