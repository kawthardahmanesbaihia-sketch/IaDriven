import { NextRequest, NextResponse } from "next/server"
import { fetchHotels, fetchRestaurants } from "@/lib/foursquare-client"
import { fetchEnhancedHotels, fetchEnhancedRestaurants, generateMapMarkers } from "@/lib/enhanced-places-api"
import { generateDestinationSummary, generateActivities } from "@/lib/gemini-client"
import { generateCountrySpecificActivities } from "@/lib/country-activities-generator"
import {
  getDestinationNegatives,
  getHotelImage,
  getRestaurantImage,
} from "@/lib/destination-content-generator"
import {
  getDestinationImage,
  getCountryFlagUrl,
} from "@/lib/destination-image-generator"
import {
  generateSeed,
  shuffleArrayWithSeed,
} from "@/lib/seed-randomizer"
import {
  generateDynamicHotels,
  generateDynamicRestaurants,
  generateDynamicActivities,
} from "@/lib/dynamic-data-generator"

// Force dynamic rendering - disable caching
export const dynamic = "force-dynamic"
export const revalidate = 0

interface DestinationRequest {
  countryCode: string
  countryName: string
  city?: string
  climate: string
  activities: string[]
  userPreferences: string[]
  budget?: string
  squad?: string
}

function getDefaultActivities(
  countryName: string,
  userPreferences: string[],
  seed: number
): Array<{ title: string; description: string; duration: string }> {
  return generateDynamicActivities(countryName, seed, 3) || [
    {
      title: "Cultural Immersion",
      description: "Experience local culture, traditions, and way of life",
      duration: "Half day",
    },
    {
      title: "Natural Attractions",
      description: "Explore scenic landscapes and natural wonders",
      duration: "Full day",
    },
    {
      title: "Local Cuisine Experience",
      description:
        "Taste authentic local dishes and visit traditional restaurants",
      duration: "2-3 hours",
    },
  ]
}

function getDefaultSummary(
  countryName: string,
  userPreferences: string[]
): {
  whyMatch: string
  pros: string[]
  cons: string[]
  bestFor: string
  recommendations: string[]
} {
  return {
    whyMatch: `${countryName} is a wonderful destination that matches your travel interests. With diverse experiences ranging from cultural landmarks to natural wonders, you'll find plenty to explore and enjoy.`,
    pros: [
      "Rich cultural heritage and historical sites",
      "Diverse natural landscapes and scenic beauty",
      "Excellent local cuisine and dining",
      "Warm and welcoming local community",
      "Well-developed tourism infrastructure",
    ],
    cons: [
      "Can be crowded during peak season",
      "Language barriers in some areas",
    ],
    bestFor:
      "Travelers seeking a balance of culture, nature, and adventure",
    recommendations: [
      "Visit local markets for authentic souvenirs",
      "Try traditional local cuisine",
      "Hire a local guide for cultural insights",
      "Respect local customs and traditions",
      "Plan activities based on weather and season",
    ],
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: DestinationRequest & { seed?: number } = await request.json()

    const {
      countryCode,
      countryName,
      city,
      climate,
      activities,
      userPreferences,
      budget,
      seed,
      squad,
    } = body

    // Build squad-aware preferences for AI prompts
    const squadContext = squad && squad !== "solo" ? `${squad} travel` : "solo travel"
    const enhancedPreferences = [squadContext, ...(userPreferences || [])]

    const requestSeed = seed || generateSeed()

    console.log(
      "[v0] Fetching destination details for:",
      countryName,
      "with seed:",
      requestSeed
    )

    const [
      hotels,
      restaurants,
      geminiSummary,
      generatedActivities,
      destinationImg,
    ] = await Promise.allSettled([
      fetchEnhancedHotels(countryCode, countryName, budget || 'mid-range', city),
      fetchEnhancedRestaurants(countryCode, countryName, budget || 'mid-range', city),
      generateDestinationSummary(
        countryName,
        enhancedPreferences,
        climate,
        activities
      ),
      generateActivities(
        countryName,
        enhancedPreferences,
        climate
      ),
      getDestinationImage(countryName),
    ])

    const hotelsList =
      hotels.status === "fulfilled" &&
      hotels.value &&
      hotels.value.length > 0
        ? hotels.value
        : generateDynamicHotels(countryName, requestSeed, 5)

    const restaurantsList =
      restaurants.status === "fulfilled" &&
      restaurants.value &&
      restaurants.value.length > 0
        ? restaurants.value
        : generateDynamicRestaurants(countryName, requestSeed, 5)

    const activitiesList =
      generatedActivities.status === "fulfilled" &&
      generatedActivities.value &&
      generatedActivities.value.length > 0
        ? generatedActivities.value
        : generateCountrySpecificActivities(
            countryName,
            userPreferences,
            budget || 'mid-range'
          )

    const summaryData =
      geminiSummary.status === "fulfilled" &&
      geminiSummary.value
        ? geminiSummary.value
        : getDefaultSummary(
            countryName,
            userPreferences
          )

    const destinationImageUrl =
      destinationImg.status === "fulfilled" &&
      destinationImg.value
        ? destinationImg.value
        : "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"

    const dynamicHotels = generateDynamicHotels(
      countryName,
      requestSeed,
      5
    )

    const dynamicRestaurants = generateDynamicRestaurants(
      countryName,
      requestSeed,
      5
    )

    const shuffledHotels = hotelsList as any[]

    const shuffledRestaurants = restaurantsList as any[]

    const shuffledActivities = activitiesList as any[]

    // FIXED typo here: shuffleArrayWithSeed
    const finalHotels = shuffleArrayWithSeed(
      shuffledHotels,
      requestSeed
    ).slice(0, 3)

    const finalRestaurants = shuffleArrayWithSeed(
      shuffledRestaurants,
      requestSeed
    ).slice(0, 3)

    const finalActivities = shuffleArrayWithSeed(
      shuffledActivities,
      requestSeed
    ).slice(0, 3).map((activity: any) => ({
      title: activity.name,
      description: activity.description,
      duration: activity.duration,
      rating: activity.rating || 4.0
    }))

    const hotelsWithImages = finalHotels.map((h: any) => ({
      name: h.name,
      rating: h.rating || 4.0,
      price: h.price || '$$$',
      priceLevel: h.priceLevel || 'luxury',
      address: h.address || 'Unknown Address',
      amenities: h.amenities || [],
      image: h.image || getHotelImage(h.price_level || "$$$"),
      location: h.location || { lat: 0, lng: 0 },
      description: h.description || 'Great accommodation'
    }))

    const restaurantsWithImages = finalRestaurants.map((r: any) => ({
      name: r.name,
      rating: r.rating || 4.0,
      cuisine: r.cuisine || 'International',
      priceLevel: r.priceLevel || 'mid-range',
      price: r.price || '$$',
      address: r.address || 'Unknown Address',
      image: r.image || getRestaurantImage(),
      location: r.location || { lat: 0, lng: 0 },
      description: r.description || 'Great dining experience'
    }))

    const negatives = getDestinationNegatives(countryName)

    // Generate map markers for interactive map
    const mapMarkers = generateMapMarkers(hotelsWithImages, restaurantsWithImages, countryName);

    const result = {
      seed: requestSeed,
      countryCode,
      countryName,
      hotels: hotelsWithImages,
      restaurants: restaurantsWithImages,
      activities: finalActivities,
      negatives,
      destinationImage: destinationImageUrl,
      summary: summaryData,
      flagUrl: getCountryFlagUrl(countryName),
      mapMarkers: mapMarkers,
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, max-age=0",
      },
    })
  } catch (error) {
    console.error(
      "[v0] Error fetching destination details:",
      error
    )

    return NextResponse.json(
      {
        error: "Failed to fetch destination details",
      },
      {
        status: 500,
      }
    )
  }
}