'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mountain,
  Building2,
  Activity,
  UtensilsCrossed,
  Waves,
  Landmark,
  Loader2,
  Check,
} from 'lucide-react';
import { useMultiplayer } from '@/contexts/multiplayer-context';
import { useSingleMode } from '@/contexts/single-mode-context';
import type { ImageTemplateTags } from '@/lib/image-templates';

interface ImageItem {
  url: string;
  thumbUrl: string;
  source: 'ai';
  selected?: boolean;
  templateId: string;
  tags: ImageTemplateTags;
  category: string;
}

interface AIImageCategory {
  id: string;
  name: string;
  icon: typeof Mountain;
  color: string;
}

interface ImageSelectorProps {
  mode?: 'multiplayer' | 'single';
}

export function ImageSelector({ mode = 'multiplayer' }: ImageSelectorProps) {
  const multiplayerContext = useMultiplayer();
  const singleModeContext = useSingleMode();

  const { preferences, updatePreferences } =
    mode === 'single' && singleModeContext
      ? singleModeContext
      : multiplayerContext;

  const [categoryImages, setCategoryImages] = useState<Record<string, ImageItem[]>>({});
  const [loadingCategories, setLoadingCategories] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const lastSyncedImagesRef = useRef<string[]>([]);

  const categories: AIImageCategory[] = [
    { id: 'nature',     name: 'Nature',     icon: Mountain,       color: 'from-green-400 to-emerald-600' },
    { id: 'city',       name: 'City Style', icon: Building2,      color: 'from-blue-400 to-blue-600' },
    { id: 'activities', name: 'Activities', icon: Activity,       color: 'from-orange-400 to-red-600' },
    { id: 'food',       name: 'Food',       icon: UtensilsCrossed,color: 'from-pink-400 to-rose-600' },
    { id: 'beaches',    name: 'Beaches',    icon: Waves,          color: 'from-cyan-400 to-blue-500' },
    { id: 'culture',    name: 'Culture',    icon: Landmark,       color: 'from-amber-400 to-amber-600' },
  ];

  const generateCategoryImages = async (categoryId: string) => {
    if (loadingCategories[categoryId]) return;
    setLoadingCategories((prev) => ({ ...prev, [categoryId]: true }));

    try {
      const res = await fetch(`/api/image-templates?category=${categoryId}&count=10`);
      if (!res.ok) throw new Error('Failed to fetch template images');

      const data = await res.json();
      const fetchedImages: any[] = data.images ?? [];

      const newImages: ImageItem[] = fetchedImages.map((img: any) => ({
        url: img.imageUrl,
        thumbUrl: img.thumbUrl ?? img.imageUrl,
        source: 'ai',
        selected: false,
        templateId: img.templateId,
        tags: img.tags as ImageTemplateTags,
        category: categoryId,
      }));

      setCategoryImages((prev) => ({ ...prev, [categoryId]: newImages }));
    } catch (error) {
      console.error('Error fetching template images:', error);
    } finally {
      setLoadingCategories((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  const toggleImageSelection = (categoryId: string, imageIndex: number) => {
    setCategoryImages((prev) => {
      const category = prev[categoryId] || [];
      const updated = [...category];
      updated[imageIndex] = {
        ...updated[imageIndex],
        selected: !updated[imageIndex].selected,
      };
      return { ...prev, [categoryId]: updated };
    });
  };

  useEffect(() => {
    const selectedObjects = Object.values(categoryImages)
      .flatMap((images) => images.filter((img) => img.selected));

    const selectedImages = selectedObjects.map((img) => img.url);

    if (JSON.stringify(lastSyncedImagesRef.current) !== JSON.stringify(selectedImages)) {
      lastSyncedImagesRef.current = selectedImages;

      const selectedImageMetadata = selectedObjects.map((img) => ({
        tags:           [img.tags.vibe, ...img.tags.interests, img.tags.tripStyle],
        mood:           img.tags.vibe,
        climate:        img.tags.climate,
        environment:    img.tags.environment,
        activity_level: tripStyleToActivityLevel(img.tags.tripStyle),
        food_style:     img.tags.foodStyle,
        budget:         img.tags.budget,
        travelers:      img.tags.travelers,
        templateId:     img.templateId,
        templateTags:   img.tags,
        category:       img.category,
      }));

      updatePreferences({ selectedImages, selectedImageMetadata });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryImages]);

  useEffect(() => {
    if (preferences?.selectedImages && preferences.selectedImages.length > 0) {
      lastSyncedImagesRef.current = preferences.selectedImages;
      setCategoryImages((prev) => {
        const updated = { ...prev };
        Object.entries(updated).forEach(([categoryId, images]) => {
          updated[categoryId] = images.map((img) => ({
            ...img,
            selected: preferences.selectedImages?.includes(img.url) || false,
          }));
        });
        return updated;
      });
    }
  }, [preferences?.selectedImages]);

  return (
    <Card className="border-2 bg-card/50 backdrop-blur-sm p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-2">Select Images You Like</h2>
        <p className="text-sm text-muted-foreground">
          Browse and select images that match your travel style. Your selections sync with other players in real-time.
        </p>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const hasImages = (categoryImages[category.id] || []).length > 0;

          return (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveCategory(category.id);
                generateCategoryImages(category.id);
              }}
              className={`relative group transition-all w-full min-w-0 ${
                activeCategory === category.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div
                className={`p-3 rounded-lg bg-gradient-to-br ${category.color} text-white text-center cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col items-center justify-center gap-1`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate text-xs font-semibold">{category.name}</span>
                {hasImages && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {(categoryImages[category.id] || []).length}
                  </Badge>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {activeCategory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {categories.find((c) => c.id === activeCategory)?.name}
            </h3>
            <Button size="sm" variant="ghost" onClick={() => setActiveCategory(null)}>
              Close
            </Button>
          </div>

          {loadingCategories[activeCategory] ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              {(categoryImages[activeCategory] || []).map((image, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleImageSelection(activeCategory, idx)}
                  className={`relative group rounded-lg overflow-hidden border-2 ${
                    image.selected
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.tags.vibe}
                    className="h-32 w-full object-cover"
                  />

                  {image.selected && (
                    <motion.div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                      <Check className="h-6 w-6 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );
}

function tripStyleToActivityLevel(tripStyle: ImageTemplateTags["tripStyle"]): "low" | "medium" | "high" {
  if (tripStyle === "adventure") return "high"
  if (tripStyle === "party") return "high"
  if (tripStyle === "relaxed" || tripStyle === "wellness") return "low"
  return "medium"
}
