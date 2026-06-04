// Country image fetching using Unsplash API

// Country-specific query keywords for better image matching
const countryKeywords: Record<string, string[]> = {
  'France': ['Eiffel Tower', 'Paris landmark', 'Louvre Museum', 'French architecture'],
  'Italy': ['Rome Colosseum', 'Venice canals', 'Italian architecture', 'Florence cathedral'],
  'Japan': ['Tokyo skyline', 'Mount Fuji', 'Japanese temple', 'Kyoto gardens'],
  'United States': ['New York skyline', 'Statue of Liberty', 'Golden Gate Bridge', 'US landmark'],
  'Algeria': ['Algiers skyline', 'Casbah of Algiers', 'Sahara Desert Algeria', 'Constantine bridges'],
  'Spain': ['Barcelona Sagrada Familia', 'Madrid plaza', 'Spanish architecture', 'Ibiza beach'],
  'United Kingdom': ['London Tower Bridge', 'Big Ben', 'British landmark', 'Scotland castle'],
  'Germany': ['Berlin Brandenburg Gate', 'Neuschwanstein Castle', 'German architecture', 'Munich'],
  'Australia': ['Sydney Opera House', 'Great Barrier Reef', 'Australian beach', 'Melbourne'],
  'Canada': ['Toronto skyline', 'Niagara Falls', 'Canadian Rockies', 'Vancouver'],
  'Brazil': ['Rio de Janeiro Christ', 'Brazilian beach', 'Amazon rainforest', 'São Paulo'],
  'Mexico': ['Mexico City cathedral', 'Mayan ruins', 'Mexican beach', 'Cancun'],
  'India': ['Taj Mahal', 'Indian temple', 'Mumbai skyline', 'Goa beach'],
  'China': ['Great Wall of China', 'Shanghai skyline', 'Forbidden City', 'Chinese architecture'],
  'Thailand': ['Bangkok temple', 'Thai beach', 'Phuket', 'Chiang Mai'],
  'Greece': ['Athens Acropolis', 'Santorini', 'Greek islands', 'Parthenon'],
  'Turkey': ['Istanbul Hagia Sophia', 'Turkish architecture', 'Cappadocia', 'Bodrum'],
  'Egypt': ['Cairo pyramids', 'Egyptian Sphinx', 'Luxor temple', 'Red Sea'],
  'Morocco': ['Marrakech market', 'Moroccan architecture', 'Casablanca', 'Fez Medina'],
  'South Africa': ['Cape Town', 'Table Mountain', 'South African safari', 'Johannesburg'],
  'Argentina': ['Buenos Aires', 'Patagonia', 'Argentine tango', 'Mendoza wine'],
  'Chile': ['Santiago skyline', 'Chilean mountains', 'Easter Island', 'Valparaíso'],
  'Peru': ['Machu Picchu', 'Lima', 'Peruvian ruins', 'Cusco'],
  'Colombia': ['Bogotá', 'Colombian coffee', 'Cartagena', 'Medellín'],
  'Netherlands': ['Amsterdam canal', 'Dutch windmill', 'Rotterdam', 'Keukenhof'],
  'Belgium': ['Brussels Grand Place', 'Bruges canal', 'Belgian architecture', 'Antwerp'],
  'Switzerland': ['Swiss Alps', 'Zurich', 'Geneva lake', 'Swiss village'],
  'Austria': ['Vienna palace', 'Austrian mountains', 'Salzburg', 'Hallstatt'],
  'Sweden': ['Stockholm', 'Swedish archipelago', 'Gothenburg', 'Northern Lights'],
  'Norway': ['Oslo fjord', 'Norwegian fjords', 'Bergen', 'Northern Lights Norway'],
  'Denmark': ['Copenhagen', 'Danish architecture', 'Tivoli Gardens', 'Legoland'],
  'Finland': ['Helsinki', 'Finnish Lapland', 'Northern Lights Finland', 'Finnish lakes'],
  'Poland': ['Warsaw', 'Krakow', 'Polish architecture', 'Baltic Sea Poland'],
  'Czech Republic': ['Prague castle', 'Czech architecture', 'Charles Bridge', 'Brno'],
  'Hungary': ['Budapest parliament', 'Hungarian architecture', 'Danube river', 'Thermal baths'],
  'Romania': ['Bucharest', 'Transylvania castle', 'Romanian architecture', 'Black Sea'],
  'Bulgaria': ['Sofia', 'Bulgarian mountains', 'Black Sea Bulgaria', 'Plovdiv'],
  'Croatia': ['Dubrovnik', 'Croatian coast', 'Split', 'Plitvice Lakes'],
  'Portugal': ['Lisbon', 'Portuguese coast', 'Porto', 'Sintra'],
  'Ireland': ['Dublin', 'Irish castle', 'Cliffs of Moher', 'Irish countryside'],
  'Iceland': ['Reykjavik', 'Icelandic volcanoes', 'Northern Lights Iceland', 'Blue Lagoon'],
  'New Zealand': ['Auckland skyline', 'New Zealand mountains', 'Queenstown', 'Milford Sound'],
  'Fiji': ['Fijian beach', 'tropical island Fiji', 'coral reef', 'Suva'],
  'Maldives': ['Maldives resort', 'tropical island Maldives', 'overwater bungalow', 'Indian Ocean'],
  'Indonesia': ['Bali temple', 'Jakarta skyline', 'Indonesian beach', 'Yogyakarta'],
  'Malaysia': ['Kuala Lumpur', 'Petronas Towers', 'Malaysian beach', 'Penang'],
  'Singapore': ['Singapore skyline', 'Marina Bay Sands', 'Gardens by the Bay', 'Sentosa'],
  'Philippines': ['Manila skyline', 'Philippine beach', 'Boracay', 'Cebu'],
  'Vietnam': ['Hanoi', 'Vietnamese beach', 'Ha Long Bay', 'Ho Chi Minh City'],
  'UAE': ['Dubai skyline', 'Burj Khalifa', 'Abu Dhabi', 'UAE desert'],
  'Saudi Arabia': ['Riyadh', 'Mecca', 'Saudi Arabian desert', 'Jeddah'],
  'Russia': ['Moscow Red Square', 'St Petersburg', 'Russian architecture', 'Siberia'],
  'Ukraine': ['Kyiv', 'Ukrainian architecture', 'Lviv', 'Black Sea Ukraine'],
  'South Korea': ['Seoul skyline', 'Korean palace', 'Busan', 'Jeju Island'],
  'Taiwan': ['Taipei 101', 'Taiwanese temple', 'Kaohsiung', 'Taroko Gorge']
};


// Cache for storing fetched country images
const countryImageCache = new Map<string, string>();

export async function fetchCountryImage(countryName: string): Promise<string> {
  // Check cache first
  if (countryImageCache.has(countryName)) {
    return countryImageCache.get(countryName)!;
  }

  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
      console.warn('[country-image-generator] UNSPLASH_ACCESS_KEY not set, using fallback image');
      return getFallbackImage(countryName);
    }

    // Get country-specific keywords or use generic ones
    const keywords = countryKeywords[countryName] || [
      `${countryName} landmark`,
      `${countryName} travel`,
      `${countryName} famous places`,
      `${countryName} architecture`,
      `${countryName} city`
    ];

    // Try each keyword until we find an image
    for (const keyword of keywords) {
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=10&page=${Math.floor(
            Math.random() * 10
          ) + 1}&client_id=${accessKey}`
        );

        // 429 = rate limit exceeded — stop trying, use fallback immediately
        if (response.status === 429) {
          console.warn('[Unsplash] Rate limit exceeded, using fallback image');
          return getFallbackImage(countryName);
        }

        if (!response.ok) {
          console.warn(`[Unsplash] HTTP ${response.status} for keyword "${keyword}"`);
          continue;
        }

        const text = await response.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          console.warn(`[Unsplash] Non-JSON response for keyword "${keyword}":`, text.slice(0, 100));
          continue;
        }

        if (data.results && data.results.length > 0) {
          const imageUrl = data.results[0].urls.regular || data.results[0].urls.small;

          // Cache the image
          countryImageCache.set(countryName, imageUrl);

          return imageUrl;
        }
      } catch (error) {
        console.warn(`[Unsplash] Failed to fetch image for keyword "${keyword}":`, error);
        // Continue to next keyword
      }
    }

    // If all keywords fail, use fallback
    console.warn(`No images found for ${countryName}, using fallback`);
    return getFallbackImage(countryName);
  } catch (error) {
    console.error('Error fetching country image:', error);
    return getFallbackImage(countryName);
  }
}

function getFallbackImage(countryName: string): string {
  // Generate a consistent fallback image based on country name
  const seed = countryName.toLowerCase().replace(/\s+/g, '');
  return `https://picsum.photos/seed/${seed}/800/600.jpg`;
}

// Preload images for multiple countries
export async function fetchCountryImages(countryNames: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  // Fetch images in parallel
  const imagePromises = countryNames.map(async (countryName) => {
    const imageUrl = await fetchCountryImage(countryName);
    return { countryName, imageUrl };
  });

  const imageResults = await Promise.all(imagePromises);
  
  imageResults.forEach(({ countryName, imageUrl }) => {
    results[countryName] = imageUrl;
  });

  return results;
}

// Clear cache (useful for testing or refresh)
export function clearCountryImageCache(): void {
  countryImageCache.clear();
}
