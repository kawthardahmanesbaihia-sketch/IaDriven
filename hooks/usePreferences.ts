"use client";

import { useState, useEffect } from "react";
import type { UserProfile, UserPreferences } from "@/types/preferences";

const STORAGE_KEY = "userPreferences";

export const usePreferences = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    likedImages: [],
    preferenceTags: []
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserProfile({
          likedImages: parsed.likedImages || [],
          preferenceTags: parsed.preferenceTags || []
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  const savePreferences = (profile: UserProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setUserProfile(profile);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const addToLikedImages = (imageId: string) => {
    setUserProfile(prev => {
      const newLikedImages = prev.likedImages.includes(imageId) 
        ? prev.likedImages 
        : [...prev.likedImages, imageId];
      
      const newProfile = {
        ...prev,
        likedImages: newLikedImages
      };
      
      savePreferences(newProfile);
      return newProfile;
    });
  };

  const removeFromLikedImages = (imageId: string) => {
    setUserProfile(prev => {
      const newLikedImages = prev.likedImages.filter(id => id !== imageId);
      const newProfile = {
        ...prev,
        likedImages: newLikedImages
      };
      
      savePreferences(newProfile);
      return newProfile;
    });
  };

  const addPreferenceTags = (tags: string[]) => {
    setUserProfile(prev => {
      const existingTags = new Set(prev.preferenceTags);
      tags.forEach(tag => existingTags.add(tag));
      
      const newProfile = {
        ...prev,
        preferenceTags: Array.from(existingTags)
      };
      
      savePreferences(newProfile);
      return newProfile;
    });
  };

  const isImageLiked = (imageId: string) => {
    return userProfile.likedImages.includes(imageId);
  };

  return {
    userProfile,
    addToLikedImages,
    removeFromLikedImages,
    addPreferenceTags,
    isImageLiked
  };
};
