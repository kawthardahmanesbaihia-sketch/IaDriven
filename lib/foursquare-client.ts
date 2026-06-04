/**
 * Foursquare has been removed from this project.
 *
 * FOURSQUARE_API_KEY is absent from the environment and all calling code
 * has been migrated to:
 *   hotels      → lib/hotelbeds-client.ts  (HotelBeds Content API)
 *   restaurants → lib/google-places.ts     (Google Places Text Search)
 *
 * These stubs are kept temporarily so TypeScript compilation does not break
 * for any file that still imports from here.  They return empty arrays and
 * must be removed once all import sites are updated.
 */

export interface Hotel {
  name: string
  rating: number
  location: string
  image?: string
  category: string
  price_level?: string
}

export interface Restaurant {
  name: string
  rating: number
  cuisine: string
  image?: string
  location: string
  category: string
}

export async function fetchHotels(): Promise<Hotel[]> {
  console.warn("[foursquare-client] REMOVED — use lib/hotelbeds-client.ts instead")
  return []
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
  console.warn("[foursquare-client] REMOVED — use lib/google-places.ts instead")
  return []
}
