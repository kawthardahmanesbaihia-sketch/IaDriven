/**
 * Destination content generation utilities
 * Minimal replacements for deleted functions
 */

export function getDestinationNegatives(countryName: string): string[] {
  // Return some common travel considerations
  return [
    "Weather can be unpredictable",
    "Tourist areas may be crowded",
    "Local customs may differ from home country"
  ];
}

export function getHotelImage(priceLevel: string): string {
  // Generate hotel images based on price level
  const priceMap: Record<string, string> = {
    "$": "https://source.unsplash.com/800x600/?budget,hotel",
    "$$": "https://source.unsplash.com/800x600/?mid-range,hotel", 
    "$$$": "https://source.unsplash.com/800x600/?luxury,hotel",
    "budget": "https://source.unsplash.com/800x600/?budget,hotel",
    "mid-range": "https://source.unsplash.com/800x600/?mid-range,hotel",
    "luxury": "https://source.unsplash.com/800x600/?luxury,hotel"
  };
  
  return priceMap[priceLevel] || "https://source.unsplash.com/800x600/?hotel";
}

export function getRestaurantImage(): string {
  return "https://source.unsplash.com/800x600/?restaurant,dining";
}
