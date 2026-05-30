import type { UserTaste } from "@/hooks/useTaste";
import type { Package } from "@/types/package";

export type MatchResult = Package & {
  score: number;
  matchPercentage: number;
  matchedTags: string[];
  unmatchedTags: string[];
};

export type MatchingInsights = {
  totalPackages: number;
  matchedPackages: number;
  averageScore: number;
  topMatchedTags: Array<{ tag: string; frequency: number }>;
  budgetAlignment: {
    userBudget: string;
    packageBudgets: Record<string, number>;
  };
};

// Enhanced matching algorithm with multiple scoring factors
export function calculateMatchScore(pkg: Package, userPreferences: UserTaste): number {
  let score = 0;
  let matchedTags: string[] = [];

  pkg.tags.forEach(tag => {
    const preferenceScore = userPreferences[tag] || 0;
    if (preferenceScore > 0) {
      score += preferenceScore;
      matchedTags.push(tag);
    }
  });

  return score;
}

// Calculate match percentage relative to maximum possible score
export function calculateMatchPercentage(score: number, maxPossibleScore: number): number {
  return maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 0;
}

// Get maximum possible score for a user
export function getMaxPossibleScore(userPreferences: UserTaste): number {
  return Object.values(userPreferences)
    .filter(score => score > 0)
    .reduce((sum, score) => sum + score, 0);
}

// Enhanced smart matching with detailed results
export function smartMatch(
  packages: Package[], 
  userPreferences: UserTaste,
  options: {
    minScore?: number;
    maxResults?: number;
    includeUnmatched?: boolean;
  } = {}
): MatchResult[] {
  const {
    minScore = 30,
    maxResults = 10,
    includeUnmatched = true
  } = options;

  const maxPossibleScore = getMaxPossibleScore(userPreferences);
  
  const results = packages
    .map(pkg => {
      const score = calculateMatchScore(pkg, userPreferences);
      const matchPercentage = calculateMatchPercentage(score, maxPossibleScore);
      
      const matchedTags = pkg.tags.filter(tag => userPreferences[tag] && userPreferences[tag] > 0);
      const unmatchedTags = pkg.tags.filter(tag => !userPreferences[tag] || userPreferences[tag] === 0);

      return {
        ...pkg,
        score,
        matchPercentage,
        matchedTags,
        unmatchedTags
      };
    })
    .filter(result => includeUnmatched ? result.score >= minScore : result.matchedTags.length > 0)
    .sort((a, b) => b.score - a.score);

  return results.slice(0, maxResults);
}

// Get top matches with enhanced filtering
export function getTopMatches(
  packages: Package[],
  userPreferences: UserTaste,
  limit: number = 3
): MatchResult[] {
  const matches = smartMatch(packages, userPreferences, { maxResults: limit * 2 });
  
  // Prioritize packages with higher match percentages and more matched tags
  return matches
    .sort((a, b) => {
      // Primary sort: match percentage
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      // Secondary sort: number of matched tags
      return b.matchedTags.length - a.matchedTags.length;
    })
    .slice(0, limit);
}

// Analyze matching patterns and insights
export function getMatchingInsights(
  packages: Package[],
  userPreferences: UserTaste
): MatchingInsights {
  const matches = smartMatch(packages, userPreferences);
  const totalPackages = packages.length;
  const matchedPackages = matches.length;
  
  // Calculate average score
  const averageScore = matchedPackages > 0 
    ? Math.round(matches.reduce((sum, match) => sum + match.score, 0) / matchedPackages)
    : 0;

  // Find most frequently matched tags
  const tagFrequency: Record<string, number> = {};
  matches.forEach(match => {
    match.matchedTags.forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });

  const topMatchedTags = Object.entries(tagFrequency)
    .map(([tag, frequency]) => ({ tag, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  // Analyze budget alignment
  const userBudget = determineUserBudget(userPreferences);
  const packageBudgets: Record<string, number> = {
    low: 0,
    medium: 0,
    premium: 0
  };

  packages.forEach(pkg => {
    const pkgBudget = determinePackageBudget(pkg);
    if (pkgBudget && packageBudgets[pkgBudget] !== undefined) {
      packageBudgets[pkgBudget]++;
    }
  });

  return {
    totalPackages,
    matchedPackages,
    averageScore,
    topMatchedTags,
    budgetAlignment: {
      userBudget,
      packageBudgets
    }
  };
}

// Determine user budget from preferences
export function determineUserBudget(userPreferences: UserTaste): string {
  const luxuryScore = userPreferences.luxury || 0;
  const highBudgetScore = userPreferences["high-budget"] || 0;
  
  if (luxuryScore > 70 || highBudgetScore > 70) return "premium";
  if (luxuryScore > 40 || highBudgetScore > 40) return "medium";
  return "low";
}

// Determine package budget from tags and price
export function determinePackageBudget(pkg: Package): string | null {
  const hasLuxury = pkg.tags.includes("luxury");
  const hasHighBudget = pkg.tags.includes("high-budget");
  const hasLowBudget = pkg.tags.includes("low-budget");
  
  if (hasLuxury || hasHighBudget) return "premium";
  if (hasLowBudget) return "low";
  
  // Estimate from price (assuming average package costs)
  if (pkg.price > 3000) return "premium";
  if (pkg.price > 1000) return "medium";
  if (pkg.price > 0) return "low";
  
  return null;
}

// Get recommendations for different user segments
export function getRecommendationsBySegment(
  packages: Package[],
  userPreferences: UserTaste
): {
  budget: MatchResult[];
  adventure: MatchResult[];
  luxury: MatchResult[];
  family: MatchResult[];
} {
  const allMatches = smartMatch(packages, userPreferences, { maxResults: 50 });
  
  return {
    budget: allMatches.filter(m => m.tags.includes("low-budget") || m.price < 1500).slice(0, 3),
    adventure: allMatches.filter(m => m.tags.includes("adventure") || m.tags.includes("nature")).slice(0, 3),
    luxury: allMatches.filter(m => m.tags.includes("luxury") || m.price > 2500).slice(0, 3),
    family: allMatches.filter(m => m.tags.includes("relax") || m.tags.includes("beach")).slice(0, 3)
  };
}

// Explain why a package matches
export function getMatchExplanation(match: MatchResult): string[] {
  const explanations: string[] = [];
  
  if (match.matchPercentage >= 80) {
    explanations.push("Excellent match - highly aligned with your preferences");
  } else if (match.matchPercentage >= 60) {
    explanations.push("Good match - several preferences align");
  } else if (match.matchPercentage >= 40) {
    explanations.push("Moderate match - some preferences align");
  } else {
    explanations.push("Basic match - limited preference alignment");
  }

  // Tag-specific explanations
  match.matchedTags.forEach(tag => {
    switch (tag) {
      case "beach":
        explanations.push("Perfect for beach lovers and tropical destinations");
        break;
      case "mountain":
        explanations.push("Ideal for mountain adventures and hiking");
        break;
      case "luxury":
        explanations.push("Premium experience with high-end amenities");
        break;
      case "culture":
        explanations.push("Rich cultural experiences and historical sites");
        break;
      case "adventure":
        explanations.push("Exciting activities and thrilling experiences");
        break;
      case "relax":
        explanations.push("Peaceful and relaxing environment");
        break;
      case "urban":
        explanations.push("City exploration and urban experiences");
        break;
      case "nature":
        explanations.push("Natural beauty and outdoor activities");
        break;
    }
  });

  return explanations;
}
