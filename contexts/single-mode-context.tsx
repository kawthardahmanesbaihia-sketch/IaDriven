'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SingleModePreferences {
  selectedImages: string[];
  budget: string;
  interests: string[];
  dateRange?: { start: string; end: string };
  travelCompanion?: "solo" | "couple" | "friends" | "family";
  selectedImageMetadata?: Array<{
    tags: string[];
    mood?: string;
    climate?: string;
    environment?: string;
    activity_level?: string;
    food_style?: string;
    category?: string;
  }>;
}

interface SingleModeContextType {
  preferences: SingleModePreferences;
  updatePreferences: (updates: Partial<SingleModePreferences>) => void;
}

const SingleModeContext = createContext<SingleModeContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: SingleModePreferences = {
  selectedImages: [],
  budget: '',
  interests: [],
};

export function SingleModeProvider({ children }: { children: React.ReactNode }) {
  // Start with safe defaults — no localStorage access during SSR
  const [preferences, setPreferences] = useState<SingleModePreferences>(DEFAULT_PREFERENCES);

  // Load persisted preferences after mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('single_mode_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({
          selectedImages: parsed.selectedImages || [],
          budget: parsed.budget || '',
          interests: parsed.interests || [],
          dateRange: parsed.dateRange,
          travelCompanion: parsed.travelCompanion,
        });
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const updatePreferences = useCallback((updates: Partial<SingleModePreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('single_mode_preferences', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  }, []);

  return (
    <SingleModeContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </SingleModeContext.Provider>
  );
}

export function useSingleMode() {
  return useContext(SingleModeContext);
}
