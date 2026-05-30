import type { UserTaste } from "@/hooks/useTaste";
import type { Package } from "@/types/package";

export type MarketTrends = {
  mostLikedDestinations: Array<{ destination: string; count: number; percentage: number }>;
  mostCommonTags: Array<{ tag: string; count: number; percentage: number }>;
  budgetDistribution: {
    low: number;
    medium: number;
    premium: number;
    total: number;
  };
  weeklyTrends: {
    thisWeek: number;
    lastWeek: number;
    growth: number;
  };
  packagePerformance: Array<{
    packageName: string;
    views: number;
    leads: number;
    conversionRate: number;
  }>;
};

// Get all user tastes from localStorage
export const getAllUserTastes = (): UserTaste[] => {
  try {
    const allKeys = Object.keys(localStorage);
    const tasteKeys = allKeys.filter(key => key.startsWith("userTaste_"));
    
    const tastes: UserTaste[] = [];
    tasteKeys.forEach(key => {
      try {
        const taste = JSON.parse(localStorage.getItem(key) || "{}");
        if (Object.keys(taste).length > 0) {
          tastes.push(taste);
        }
      } catch (error) {
        console.error(`Error parsing taste for key ${key}:`, error);
      }
    });

    // Also check main userTaste key
    const mainTaste = localStorage.getItem("userTaste");
    if (mainTaste) {
      try {
        const parsed = JSON.parse(mainTaste);
        if (Object.keys(parsed).length > 0) {
          tastes.push(parsed);
        }
      } catch (error) {
        console.error("Error parsing main userTaste:", error);
      }
    }

    return tastes;
  } catch (error) {
    console.error("Error getting all user tastes:", error);
    return [];
  }
};

// Extract destination preferences from user tastes
export const getMostLikedDestinations = (limit: number = 10): Array<{ destination: string; count: number; percentage: number }> => {
  const userTastes = getAllUserTastes();
  const destinationCounts: Record<string, number> = {};

  // Count destination mentions from session data
  const sessionData = sessionStorage.getItem("analysisResults");
  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      if (parsed.countries) {
        parsed.countries.forEach((country: any) => {
          destinationCounts[country.name] = (destinationCounts[country.name] || 0) + 1;
        });
      }
    } catch (error) {
      console.error("Error parsing session data:", error);
    }
  }

  const total = Object.values(destinationCounts).reduce((sum, count) => sum + count, 0);

  return Object.entries(destinationCounts)
    .map(([destination, count]) => ({
      destination,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

// Get most common tags from user preferences
export const getMostCommonTags = (limit: number = 10): Array<{ tag: string; count: number; percentage: number }> => {
  const userTastes = getAllUserTastes();
  const tagCounts: Record<string, number> = {};

  userTastes.forEach(taste => {
    Object.entries(taste).forEach(([tag, score]) => {
      if (score > 50) { // Only count tags with >50% preference
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    });
  });

  const total = Object.values(tagCounts).reduce((sum, count) => sum + count, 0);

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({
      tag,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

// Get budget distribution from user preferences
export const getBudgetDistribution = () => {
  const userTastes = getAllUserTastes();
  const distribution = { low: 0, medium: 0, premium: 0 };

  userTastes.forEach(taste => {
    const luxuryScore = taste.luxury || 0;
    const highBudgetScore = taste["high-budget"] || 0;
    
    if (luxuryScore > 70 || highBudgetScore > 70) {
      distribution.premium++;
    } else if (luxuryScore > 40 || highBudgetScore > 40) {
      distribution.medium++;
    } else {
      distribution.low++;
    }
  });

  const total = distribution.low + distribution.medium + distribution.premium;

  return {
    ...distribution,
    total,
    low: total > 0 ? Math.round((distribution.low / total) * 100) : 0,
    medium: total > 0 ? Math.round((distribution.medium / total) * 100) : 0,
    premium: total > 0 ? Math.round((distribution.premium / total) * 100) : 0
  };
};

// Get weekly trends
export const getWeeklyTrends = () => {
  const userTastes = getAllUserTastes();
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  let thisWeek = 0;
  let lastWeek = 0;

  // This is a simplified version - in production, you'd track creation timestamps
  userTastes.forEach(taste => {
    const createdAt = taste.createdAt || new Date().toISOString();
    const createdDate = new Date(createdAt);
    
    if (createdDate >= oneWeekAgo) {
      thisWeek++;
    } else if (createdDate >= twoWeeksAgo && createdDate < oneWeekAgo) {
      lastWeek++;
    }
  });

  const growth = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

  return {
    thisWeek,
    lastWeek,
    growth
  };
};

// Get package performance metrics
export const getPackagePerformance = (packages: Package[]): Array<{
  packageName: string;
  views: number;
  leads: number;
  conversionRate: number;
}> => {
  // Mock performance data - in production, this would come from analytics
  return packages.map(pkg => ({
    packageName: pkg.title,
    views: Math.floor(Math.random() * 1000) + 100,
    leads: Math.floor(Math.random() * 50) + 5,
    conversionRate: Math.random() * 10 + 2
  })).sort((a, b) => b.leads - a.leads);
};

// Get complete market trends
export const getMarketTrends = (): MarketTrends => {
  const mostLikedDestinations = getMostLikedDestinations();
  const mostCommonTags = getMostCommonTags();
  const budgetDistribution = getBudgetDistribution();
  const weeklyTrends = getWeeklyTrends();
  
  const packages = JSON.parse(localStorage.getItem("packages") || "[]");
  const packagePerformance = getPackagePerformance(packages);

  return {
    mostLikedDestinations,
    mostCommonTags,
    budgetDistribution,
    weeklyTrends,
    packagePerformance
  };
};
