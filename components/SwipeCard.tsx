"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Heart } from "lucide-react";
import type { TravelImage } from "@/lib/images";

interface SwipeCardProps {
  image: TravelImage;
  onLike: (image: TravelImage) => void;
  onDislike: (image: TravelImage) => void;
  isActive: boolean;
}

export function SwipeCard({ image, onLike, onDislike, isActive }: SwipeCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, 200], [0.5, 0.5]);

  const handlePanEnd = (event: any, info: PanInfo) => {
    if (isAnimating) return;

    const { offset, velocity } = info;
    const swipeThreshold = 50;
    const velocityThreshold = 500;

    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
      setIsAnimating(true);
      
      if (offset.x > 0) {
        // Swipe right - like
        x.set(offset.x + 200);
        setTimeout(() => onLike(image), 300);
      } else {
        // Swipe left - dislike
        x.set(offset.x - 200);
        setTimeout(() => onDislike(image), 300);
      }
    } else {
      // Snap back to center
      x.set(0);
    }
  };

  const handleLikeClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    x.set(200);
    setTimeout(() => onLike(image), 300);
  };

  const handleDislikeClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    x.set(-200);
    setTimeout(() => onDislike(image), 300);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        className="absolute w-full h-full"
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handlePanEnd}
        animate={isActive ? { scale: 1 } : { scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className="w-full h-full overflow-hidden shadow-2xl">
          <div className="relative h-[60%]">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            
            {/* Like/Dislike indicators */}
            <motion.div
              className="absolute top-8 left-8 bg-green-500 text-white px-4 py-2 rounded-full font-bold"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: x.get() > 50 ? 1 : 0, scale: x.get() > 50 ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Heart className="h-6 w-6" />
            </motion.div>
            
            <motion.div
              className="absolute top-8 right-8 bg-red-500 text-white px-4 py-2 rounded-full font-bold"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: x.get() < -50 ? 1 : 0, scale: x.get() < -50 ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          </div>
          
          <div className="p-6 h-[40%] flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
              <p className="text-lg text-muted-foreground mb-4">{image.location}</p>
              
              <div className="flex flex-wrap gap-2">
                {image.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 mt-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={handleDislikeClick}
                disabled={isAnimating}
              >
                <X className="h-5 w-5 mr-2" />
                No
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-green-200 hover:bg-green-50 hover:border-green-300"
                onClick={handleLikeClick}
                disabled={isAnimating}
              >
                <Heart className="h-5 w-5 mr-2" />
                Yes
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
