"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, MapPin, Calendar } from "lucide-react";
import type { DayPlan } from "@/types/itinerary";

interface DayCardProps {
  dayPlan: DayPlan;
  destination: string;
}

export function DayCard({ dayPlan, destination }: DayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Day Header with Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={dayPlan.imageUrl}
            alt={`${destination} - ${dayPlan.title}`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';
            }}
          />
          
          {/* Day Number Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5" />
              <h3 className="text-2xl font-bold">{dayPlan.title}</h3>
            </div>
            <p className="text-white/90 text-sm mt-1">{dayPlan.date}</p>
          </div>

          {/* Cost Badge */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">${dayPlan.estimatedCost}</span>
            </div>
          </div>
        </div>

        {/* Activities */}
        <div className="p-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-primary">Activities</h4>
            
            {dayPlan.activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-3 bg-muted/50 rounded-lg"
              >
                {/* Activity Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={activity.imageUrl}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&q=80';
                    }}
                  />
                </div>

                {/* Activity Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h5 className="font-medium text-sm">{activity.title}</h5>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {activity.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {activity.cost}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Day Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{destination}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">${dayPlan.estimatedCost}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
