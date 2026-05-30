import type { UserTaste } from "@/hooks/useTaste";
import type { Package } from "@/types/package";

export type AnalyticsData = {
  totalUsers: number;
  totalSessions: number;
  topTags: Array<{ tag: string; count: number; percentage: number }>;
  topDestinations: Array<{ destination: string; count: number }>;
  packageStats: {
    totalPackages: number;
    averagePrice: number;
    popularDurations: Array<{ duration: string; count: number }>;
  };
};

export const getAllUserTastes = (): UserTaste[] => {
  try {
    // In a real app, this would fetch from a database
    // For MVP, we'll use localStorage to collect user taste data
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

    // Also check the main userTaste key
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

export const getTopTags = (userTastes: UserTaste[]): Array<{ tag: string; count: number; percentage: number }> => {
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
    .slice(0, 10);
};

export const getExploredDestinations = (): string[] => {
  try {
    const stored = localStorage.getItem("exploredDestinations");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const getTopDestinations = (packages: Package[]): Array<{ destination: string; count: number }> => {
  const destinationCounts: Record<string, number> = {};

  // Count from user explore activity (heavier weight)
  getExploredDestinations().forEach(dest => {
    destinationCounts[dest] = (destinationCounts[dest] || 0) + 2;
  });

  // Count from agency packages
  packages.forEach(pkg => {
    destinationCounts[pkg.destination] = (destinationCounts[pkg.destination] || 0) + 1;
  });

  return Object.entries(destinationCounts)
    .map(([destination, count]) => ({ destination, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

export const getPackageStats = (packages: Package[]): AnalyticsData["packageStats"] => {
  const totalPackages = packages.length;
  
  if (totalPackages === 0) {
    return {
      totalPackages: 0,
      averagePrice: 0,
      popularDurations: []
    };
  }

  const totalPrice = packages.reduce((sum, pkg) => sum + pkg.price, 0);
  const averagePrice = totalPrice / totalPackages;

  const durationCounts: Record<string, number> = {};
  packages.forEach(pkg => {
    durationCounts[pkg.duration] = (durationCounts[pkg.duration] || 0) + 1;
  });

  const popularDurations = Object.entries(durationCounts)
    .map(([duration, count]) => ({ duration, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalPackages,
    averagePrice: Math.round(averagePrice),
    popularDurations
  };
};

export const getAnalyticsData = (): AnalyticsData => {
  const userTastes = getAllUserTastes();
  const packages = getPackagesFromStorage();

  const topTags = getTopTags(userTastes);
  const topDestinations = getTopDestinations(packages);
  const packageStats = getPackageStats(packages);

  return {
    totalUsers: userTastes.length,
    totalSessions: userTastes.length, // Simplified: 1 taste = 1 session
    topTags,
    topDestinations,
    packageStats
  };
};

export const getPackagesFromStorage = (): Package[] => {
  try {
    const stored = localStorage.getItem("packages");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting packages from storage:", error);
    return [];
  }
};
