'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ImageTemplateTags } from '@/lib/image-templates';

// In-memory image record shared between context and ImageSelector.
// NOT persisted to localStorage — these are ephemeral per page-load Unsplash URLs.
// Stored in context so the image grid survives tab switches (Radix TabsContent unmounts
// inactive panels, which destroys component-local state).
export interface CategoryImage {
  url:        string
  thumbUrl:   string
  source:     'ai'
  selected?:  boolean
  templateId: string
  tags:       ImageTemplateTags
  category:   string
}

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
  preferences:       SingleModePreferences;
  updatePreferences: (updates: Partial<SingleModePreferences>) => void;
  // In-memory category image state — survives tab navigation within the same page session.
  categoryImages:    Record<string, CategoryImage[]>;
  setCategoryImages: React.Dispatch<React.SetStateAction<Record<string, CategoryImage[]>>>;
}

const SingleModeContext = createContext<SingleModeContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: SingleModePreferences = {
  selectedImages: [],
  budget: '',
  interests: [],
};

export function SingleModeProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<SingleModePreferences>(DEFAULT_PREFERENCES);
  // In-memory category image state. Never written to localStorage.
  const [categoryImages, setCategoryImages] = useState<Record<string, CategoryImage[]>>({});

  // Load persisted preferences after mount (client-only).
  // selectedImages are ephemeral Unsplash URLs — they point to a specific batch
  // fetched in a prior session and will never match fresh images in a new session.
  // Restoring them causes stale URLs to survive into the analyze payload even after
  // the user thinks they deselected everything. Only non-ephemeral fields are restored.
  useEffect(() => {
    try {
      const stored = localStorage.getItem('single_mode_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({
          selectedImages: [],
          selectedImageMetadata: [],
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
        // Exclude image selections from persistence — ephemeral Unsplash URLs that
        // will never match the next fresh category load.
        const { selectedImages: _si, selectedImageMetadata: _sim, ...persistable } = updated;
        localStorage.setItem('single_mode_preferences', JSON.stringify(persistable));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  }, []);

  return (
    <SingleModeContext.Provider value={{ preferences, updatePreferences, categoryImages, setCategoryImages }}>
      {children}
    </SingleModeContext.Provider>
  );
}

export function useSingleMode() {
  return useContext(SingleModeContext);
}
