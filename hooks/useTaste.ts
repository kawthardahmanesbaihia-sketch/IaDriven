"use client";

import { useState, useEffect } from "react";
import type { TravelImage } from "@/lib/images";

export type UserTaste = {
  [tag: string]: number; // percentage score for each tag
};

export const useTaste = () => {
  const [likedTags, setLikedTags] = useState<string[]>([]);
  const [dislikedTags, setDislikedTags] = useState<string[]>([]);
  const [tasteProfile, setTasteProfile] = useState<UserTaste>({});

  // Calculate taste profile from liked and disliked tags
  const calculatePreferences = (liked: string[], disliked: string[]): UserTaste => {
    const allTags = [...liked, ...disliked];
    const preferences: UserTaste = {};

    allTags.forEach(tag => {
      const likeCount = liked.filter(t => t === tag).length;
      const dislikeCount = disliked.filter(t => t === tag).length;
      const totalInteractions = likeCount + dislikeCount;
      
      if (totalInteractions > 0) {
        // Calculate percentage preference (0-100)
        const preferenceScore = (likeCount / totalInteractions) * 100;
        preferences[tag] = Math.round(preferenceScore);
      }
    });

    return preferences;
  };

  // Add liked tags from image
  const addLikedTags = (image: TravelImage) => {
    setLikedTags(prev => [...prev, ...image.tags]);
  };

  // Add disliked tags from image
  const addDislikedTags = (image: TravelImage) => {
    setDislikedTags(prev => [...prev, ...image.tags]);
  };

  // Get final taste profile
  const getTasteProfile = (): UserTaste => {
    const profile = calculatePreferences(likedTags, dislikedTags);
    setTasteProfile(profile);
    return profile;
  };

  // Save taste profile to localStorage
  const saveTasteProfile = () => {
    const profile = getTasteProfile();
    try {
      localStorage.setItem("userTaste", JSON.stringify(profile));
    } catch (error) {
      console.error("Error saving taste profile:", error);
    }
  };

  // Load taste profile from localStorage
  const loadTasteProfile = (): UserTaste | null => {
    try {
      const stored = localStorage.getItem("userTaste");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error loading taste profile:", error);
      return null;
    }
  };

  // Get top preferences
  const getTopPreferences = (limit: number = 3): Array<{ tag: string; percentage: number }> => {
    const profile = tasteProfile || loadTasteProfile() || {};
    
    return Object.entries(profile)
      .map(([tag, percentage]) => ({ tag, percentage }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, limit);
  };

  // Reset taste profile
  const resetTaste = () => {
    setLikedTags([]);
    setDislikedTags([]);
    setTasteProfile({});
    try {
      localStorage.removeItem("userTaste");
    } catch (error) {
      console.error("Error removing taste profile:", error);
    }
  };

  return {
    likedTags,
    dislikedTags,
    tasteProfile,
    addLikedTags,
    addDislikedTags,
    getTasteProfile,
    saveTasteProfile,
    loadTasteProfile,
    getTopPreferences,
    resetTaste
  };
};
