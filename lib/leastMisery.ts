import type { UserTaste } from "@/hooks/useTaste";

export type GroupPreferences = {
  [tag: string]: number; // minimum preference score for each tag
};

/**
 * Least Misery Algorithm for group preference aggregation
 * Takes the minimum preference score for each tag across all users
 */
export function leastMisery(userPreferences: UserTaste[]): GroupPreferences {
  if (userPreferences.length === 0) {
    return {};
  }

  const allTags = new Set<string>();
  userPreferences.forEach(pref => {
    Object.keys(pref).forEach(tag => allTags.add(tag));
  });

  const groupPreferences: GroupPreferences = {};

  allTags.forEach(tag => {
    // Get the minimum preference score for this tag across all users
    const scores = userPreferences
      .map(pref => pref[tag] || 0)
      .filter(score => score > 0);

    if (scores.length > 0) {
      groupPreferences[tag] = Math.min(...scores);
    }
  });

  return groupPreferences;
}

/**
 * Normalize preferences to 0-100 scale
 */
export function normalizePreferences(preferences: UserTaste | GroupPreferences): UserTaste {
  const values = Object.values(preferences).filter(v => v > 0);
  
  if (values.length === 0) {
    return {};
  }

  const max = Math.max(...values);
  const normalized: UserTaste = {};

  Object.entries(preferences).forEach(([tag, value]) => {
    if (value > 0) {
      normalized[tag] = Math.round((value / max) * 100);
    }
  });

  return normalized;
}

/**
 * Calculate group satisfaction score
 */
export function calculateGroupSatisfaction(
  userPreferences: UserTaste[],
  groupPreferences: GroupPreferences
): number {
  if (userPreferences.length === 0) {
    return 0;
  }

  let totalSatisfaction = 0;
  let validUsers = 0;

  userPreferences.forEach(userPref => {
    let userSatisfaction = 0;
    let validTags = 0;

    Object.entries(userPref).forEach(([tag, userScore]) => {
      const groupScore = groupPreferences[tag] || 0;
      if (userScore > 0) {
        // Satisfaction = min(userScore, groupScore) / userScore
        userSatisfaction += Math.min(userScore, groupScore) / userScore;
        validTags++;
      }
    });

    if (validTags > 0) {
      totalSatisfaction += userSatisfaction / validTags;
      validUsers++;
    }
  });

  return validUsers > 0 ? (totalSatisfaction / validUsers) * 100 : 0;
}

/**
 * Get top group preferences
 */
export function getTopGroupPreferences(
  groupPreferences: GroupPreferences,
  limit: number = 5
): Array<{ tag: string; score: number }> {
  return Object.entries(groupPreferences)
    .map(([tag, score]) => ({ tag, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
