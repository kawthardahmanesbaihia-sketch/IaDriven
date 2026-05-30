"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SwipeCard } from "@/components/SwipeCard";
import { ProgressBar } from "@/components/ProgressBar";
import { travelImages } from "@/lib/images";
import { useTaste } from "@/hooks/useTaste";
import { suggestDestinations } from "@/lib/suggestionEngine";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function SwipePage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedImages, setSwipedImages] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  const { 
    addLikedTags, 
    addDislikedTags, 
    saveTasteProfile, 
    getTasteProfile,
    getTopPreferences 
  } = useTaste();

  const currentImage = travelImages[currentIndex];
  const progress = currentIndex + 1;

  useEffect(() => {
    if (currentIndex >= travelImages.length && !isCompleted) {
      handleSwipeComplete();
    }
  }, [currentIndex, travelImages.length, isCompleted]);

  const handleSwipeComplete = () => {
    setIsCompleted(true);
    
    // Save taste profile
    saveTasteProfile();
    
    // Get taste profile and suggestions
    const profile = getTasteProfile();
    const destinationSuggestions = suggestDestinations(profile, 3);
    setSuggestions(destinationSuggestions);
  };

  const handleLike = (image: any) => {
    addLikedTags(image);
    setSwipedImages(prev => new Set([...prev, image.id]));
    setCurrentIndex(prev => prev + 1);
  };

  const handleDislike = (image: any) => {
    addDislikedTags(image);
    setSwipedImages(prev => new Set([...prev, image.id]));
    setCurrentIndex(prev => prev + 1);
  };

  const handleContinue = () => {
    router.push("/results");
  };

  const topPreferences = getTopPreferences(3);

  if (isCompleted) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full"
            >
              <CheckCircle className="h-10 w-10 text-green-600" />
            </motion.div>
            
            <h1 className="text-4xl font-bold">Taste Profile Complete!</h1>
            <p className="text-lg text-muted-foreground">
              We've analyzed your preferences and found your perfect destinations
            </p>
          </div>

          {/* Top Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Your Travel Preferences</h2>
              <div className="space-y-3">
                {topPreferences.map((pref, index) => (
                  <motion.div
                    key={pref.tag}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="font-medium capitalize">{pref.tag}</span>
                    <span className="text-primary font-bold">{pref.percentage}%</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Destination Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Recommended Destinations</h2>
              <div className="grid gap-4">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.destination.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{suggestion.destination.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.destination.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-primary font-bold">
                          {Math.round(suggestion.score)}% Match
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {suggestion.destination.tags.slice(0, 2).join(", ")}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button 
              size="lg" 
              onClick={handleContinue}
              className="w-full max-w-xs"
            >
              Continue to Results
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold">Discover Your Travel Taste</h1>
          <p className="text-muted-foreground">
            Swipe right for destinations you like, left for ones you don't
          </p>
        </motion.div>

        {/* Progress Bar */}
        <ProgressBar current={progress} total={travelImages.length} />

        {/* Swipe Area */}
        <div className="relative h-[600px] w-full max-w-md mx-auto">
          <AnimatePresence>
            {currentImage && (
              <SwipeCard
                key={currentImage.id}
                image={currentImage}
                onLike={handleLike}
                onDislike={handleDislike}
                isActive={true}
              />
            )}
          </AnimatePresence>

          {/* Stack effect for next cards */}
          {travelImages.slice(currentIndex + 1, currentIndex + 3).map((image, index) => (
            <div
              key={image.id}
              className="absolute inset-0 w-full h-full"
              style={{
                transform: `scale(${1 - (index + 1) * 0.05}) translateY(${(index + 1) * 10}px)`,
                zIndex: -index,
                opacity: 0.3 - index * 0.1
              }}
            >
              <Card className="w-full h-full bg-muted" />
            </div>
          ))}
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>Swipe or use the buttons below to make your choice</p>
        </motion.div>
      </div>
    </div>
  );
}
