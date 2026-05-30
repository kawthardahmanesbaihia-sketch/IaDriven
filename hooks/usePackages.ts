"use client";

import { useState, useEffect } from "react";
import type { Package } from "@/types/package";
import type { UserTaste } from "@/hooks/useTaste";

const STORAGE_KEY = "packages";

export const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPackages(parsed);
      }
    } catch (error) {
      console.error("Error loading packages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePackages = (packageList: Package[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(packageList));
      setPackages(packageList);
    } catch (error) {
      console.error("Error saving packages:", error);
    }
  };

  const addPackage = (packageData: Omit<Package, "id" | "createdAt" | "agencyId">, agencyId: string) => {
    const newPackage: Package = {
      ...packageData,
      id: Date.now().toString(),
      agencyId,
      createdAt: new Date().toISOString()
    };

    const updatedPackages = [...packages, newPackage];
    savePackages(updatedPackages);
    return newPackage;
  };

  const updatePackage = (id: string, updates: Partial<Package>) => {
    const updatedPackages = packages.map(pkg => 
      pkg.id === id ? { ...pkg, ...updates } : pkg
    );
    savePackages(updatedPackages);
  };

  const deletePackage = (id: string) => {
    const updatedPackages = packages.filter(pkg => pkg.id !== id);
    savePackages(updatedPackages);
  };

  const getAgencyPackages = (agencyId: string) => {
    return packages.filter(pkg => pkg.agencyId === agencyId);
  };

  return {
    packages,
    isLoading,
    addPackage,
    updatePackage,
    deletePackage,
    getAgencyPackages,
    loadPackages
  };
};

export const scorePackage = (pkg: Package, userPreferences: UserTaste): number => {
  let score = 0;

  pkg.tags.forEach(tag => {
    if (userPreferences[tag]) {
      score += userPreferences[tag];
    }
  });

  return score;
};

export const getTopMatches = (packages: Package[], userPreferences: UserTaste, limit: number = 3): Array<Package & { score: number }> => {
  const ranked = packages
    .map(pkg => ({
      ...pkg,
      score: scorePackage(pkg, userPreferences)
    }))
    .filter(pkg => pkg.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, limit);
};
