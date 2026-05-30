'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMultiplayer } from '@/contexts/multiplayer-context';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DestinationHeroSection } from '@/components/destination-hero-section';

// Compute shared results from all players' preferences
function computeSharedResults(players: any[], analysisResults: any) {
  if (!players || players.length === 0 || !analysisResults?.countries) {
    return analysisResults?.countries || [];
  }

  // Collect all player preferences
  const allPlayerInterests: string[] = [];
  const allPlayerBudgets: string[] = [];
  const allPlayerClimates: string[] = [];

  players.forEach(player => {
    if (player.preferences?.interests) {
      allPlayerInterests.push(...player.preferences.interests);
    }
    if (player.preferences?.budget) {
      allPlayerBudgets.push(player.preferences.budget);
    }
    if (player.preferences?.climate) {
      allPlayerClimates.push(player.preferences.climate);
    }
  });

  // Get unique values
  const uniqueInterests = [...new Set(allPlayerInterests)];
  const uniqueBudgets = [...new Set(allPlayerBudgets)];
  const uniqueClimates = [...new Set(allPlayerClimates)];

  // Score each country based on how well it matches shared preferences
  const scoredCountries = analysisResults.countries.map((country: any) => {
    let score = country.matchPercentage || 0;
    let matches = 0;

    // Check interest matches
    if (country.tags && uniqueInterests.length > 0) {
      const interestMatches = country.tags.filter((tag: string) =>
        uniqueInterests.some(interest =>
          tag.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(tag.toLowerCase())
        )
      ).length;
      matches += interestMatches;
    }

    // Check climate match
    if (country.climate && uniqueClimates.length > 0) {
      const climateMatch = uniqueClimates.some(climate =>
        country.climate.toLowerCase().includes(climate.toLowerCase()) ||
        climate.toLowerCase().includes(country.climate.toLowerCase())
      );
      if (climateMatch) matches += 2;
    }

    // Check budget compatibility
    if (country.budgetLevel && uniqueBudgets.length > 0) {
      const budgetCompatibility = uniqueBudgets.some(budget => {
        const budgetLevel = budget.toLowerCase();
        const countryBudget = country.budgetLevel?.toLowerCase() || 'medium';
        return budgetLevel === countryBudget ||
          (budgetLevel === 'low' && countryBudget === 'budget') ||
          (budgetLevel === 'standard' && countryBudget === 'budget') ||
          (budgetLevel === 'premium' && countryBudget === 'mid-range') ||
          (budgetLevel === 'luxury' && countryBudget === 'luxury');
      });
      if (budgetCompatibility) matches += 1;
    }

    // Calculate collaborative score
    const playerCount = players.length;
    const collaborationBonus = (matches / Math.max(uniqueInterests.length + 3, 1)) * (playerCount * 5);

    return {
      ...country,
      sharedMatchScore: score + collaborationBonus,
      sharedMatches: matches,
      totalPlayers: playerCount,
    };
  });

  // Sort by shared match score (highest first)
  scoredCountries.sort((a: any, b: any) => b.sharedMatchScore - a.sharedMatchScore);

  return scoredCountries;
}

export function AnalysisResults() {
  const { session, leaveCurrentSession, selectDestination, players } = useMultiplayer();
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<number>(0);

  if (!session?.analysisResults) {
    return null;
  }

  // Compute shared results with collaborative scoring
  const results = session.analysisResults;
  const countries = useMemo(() =>
    computeSharedResults(players, results),
    [players, results]
  );

  return (
    <div>
      {/* Hero — full-width, starts immediately at top, matches single mode exactly */}
      <div className="relative z-10">
        <DestinationHeroSection
          countries={countries}
          selectedCountry={selectedCountry}
          onCountrySelect={setSelectedCountry}
          renderExploreButton={(country, index) => (
            <motion.div whileHover={{ x: 6 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-full px-8"
                onClick={async (e) => {
                  e.stopPropagation();
                  setSelectedCountry(index);
                  await selectDestination(country.name, index);
                  router.push(`/multiplayer/session/${session?.sessionId}/destination`);
                }}
              >
                <span className="flex items-center gap-3">
                  Explore
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>
            </motion.div>
          )}
        />
      </div>

      {/* Below-hero content — constrained width */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* AI Summary */}
        {results.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-2 bg-gradient-to-br from-primary/10 via-card/50 to-card/50 p-8 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Why These Destinations?</h3>
                  <p className="text-pretty leading-relaxed text-muted-foreground">{results.summary}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    These destinations were ranked based on {players.length} squad members&apos; combined preferences,
                    prioritizing locations that match the most shared interests and budgets.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4"
        >
          <Button
            size="lg"
            className="flex-1"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Our Squad Trip Results',
                  text: `Check out these destinations perfect for our group of ${players.length}!`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied!');
              }
            }}
          >
            Share with Squad
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={async () => {
              if (session?.sessionId) {
                await leaveCurrentSession();
                router.push('/multiplayer');
              } else {
                router.push('/single');
              }
            }}
          >
            New Analysis
          </Button>
        </motion.div>
      </div>
    </div>
  );
}