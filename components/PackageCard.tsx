"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, MapPin, Heart, Phone, Mail, Building2, ChevronDown, ChevronUp } from "lucide-react";
import type { Package } from "@/types/package";

interface PackageCardProps {
  package: Package & { score?: number };
  showMatchScore?: boolean;
  onBook?: (pkg: Package) => void;
}

export function PackageCard({ package: pkg, showMatchScore = false, onBook }: PackageCardProps) {
  const [showContact, setShowContact] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={pkg.image}
            alt={pkg.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
            }}
          />

          {showMatchScore && pkg.score && (
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
              {Math.round(pkg.score)}% Match
            </div>
          )}

          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {pkg.agencyName || "Travel Agency"}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">{pkg.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {pkg.destination}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {pkg.description}
          </p>

          <div className="flex flex-wrap gap-1">
            {pkg.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {pkg.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{pkg.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Price, Duration, Book */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm">
                <DollarSign className="h-4 w-4 mr-1" />
                <span className="font-semibold">${pkg.price}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {pkg.duration}
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => onBook?.(pkg)}
              className="text-xs"
            >
              Book Now
            </Button>
          </div>

          {showMatchScore && pkg.score && pkg.score > 70 && (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              <Heart className="h-3 w-3 fill-current" />
              Perfect match for your preferences
            </div>
          )}

          {/* Contact Agency toggle */}
          <div className="border-t pt-3">
            <button
              type="button"
              onClick={() => setShowContact(v => !v)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline w-full text-left"
            >
              {showContact ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Contact Agency
            </button>

            {showContact && (
              <div className="mt-2 space-y-1 text-sm text-muted-foreground pl-1">
                <p className="font-medium text-foreground">{pkg.agencyName || "Travel Agency"}</p>
                {pkg.contactEmail ? (
                  <a href={`mailto:${pkg.contactEmail}`} className="flex items-center gap-2 hover:text-primary">
                    <Mail className="h-4 w-4" />
                    {pkg.contactEmail}
                  </a>
                ) : null}
                {pkg.contactPhone ? (
                  <a href={`tel:${pkg.contactPhone}`} className="flex items-center gap-2 hover:text-primary">
                    <Phone className="h-4 w-4" />
                    {pkg.contactPhone}
                  </a>
                ) : null}
                {!pkg.contactEmail && !pkg.contactPhone && (
                  <p className="italic text-xs">No contact info provided.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
