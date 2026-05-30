"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import type { TravelImage } from "@/lib/images";
import { usePreferences } from "@/hooks/usePreferences";

interface ImageCardProps {
  image: TravelImage;
}

export function ImageCard({ image }: ImageCardProps) {
  const { isImageLiked, addToLikedImages, removeFromLikedImages } = usePreferences();

  const handleLike = () => {
    if (isImageLiked(image.id)) {
      removeFromLikedImages(image.id);
    } else {
      addToLikedImages(image.id);
    }
  };

  const isLiked = isImageLiked(image.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image.url}
            alt={image.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Like Button */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm hover:bg-white/30"
            onClick={handleLike}
          >
            <Heart 
              className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`}
            />
          </Button>

          {/* Image Info */}
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="text-white font-semibold text-sm">{image.title}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {image.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
