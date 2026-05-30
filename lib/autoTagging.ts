// Auto-tagging system for uploaded images based on title and description
export type AutoTagResult = {
  tags: string[];
  confidence: number;
};

// Tag mapping keywords
const TAG_KEYWORDS: Record<string, string[]> = {
  beach: [
    "beach", "coast", "shore", "ocean", "sea", "sand", "waves", 
    "sunbathing", "swimming", "surfing", "tropical", "island"
  ],
  mountain: [
    "mountain", "alps", "peak", "summit", "hiking", "climbing", 
    "trail", "elevation", "rocky", "snow", "skiing"
  ],
  nature: [
    "nature", "forest", "park", "wildlife", "animals", "birds", 
    "trees", "green", "outdoor", "natural", "environment"
  ],
  luxury: [
    "luxury", "premium", "5-star", "resort", "spa", "villa", 
    "exclusive", "high-end", "deluxe", "upscale", "elegant"
  ],
  urban: [
    "city", "urban", "downtown", "metropolitan", "skyline", 
    "buildings", "architecture", "streets", "traffic", "modern"
  ],
  culture: [
    "culture", "museum", "art", "history", "historic", "monument", 
    "temple", "church", "gallery", "traditional", "heritage"
  ],
  adventure: [
    "adventure", "extreme", "thrill", "exciting", "adrenaline", 
    "sports", "activity", "challenge", "outdoor", "action"
  ],
  relax: [
    "relax", "relaxation", "peaceful", "calm", "serene", 
    "quiet", "rest", "vacation", "leisure", "comfortable"
  ],
  desert: [
    "desert", "sahara", "dunes", "arid", "dry", "sand dunes", 
    "oasis", "camel", "safari", "dry climate", "hot"
  ],
  cold: [
    "cold", "snow", "ice", "winter", "frozen", "arctic", 
    "chilly", "freezing", "glacier", "polar", "cold climate"
  ],
  tropical: [
    "tropical", "jungle", "rainforest", "exotic", "paradise", 
    "palm trees", "humid", "warm climate", "island life"
  ],
  food: [
    "food", "cuisine", "dining", "restaurant", "meal", "cooking", 
    "culinary", "dish", "flavor", "taste", "gastronomy"
  ],
  shopping: [
    "shopping", "mall", "market", "store", "retail", "boutique", 
    "souvenir", "brands", "fashion", "clothes", "products"
  ]
};

// Budget-related keywords
const BUDGET_KEYWORDS = {
  "low-budget": [
    "budget", "cheap", "affordable", "economy", "low cost", 
    "inexpensive", "value", "deal", "discount", "saving"
  ],
  "mid-budget": [
    "moderate", "reasonable", "standard", "mid-range", "average", 
    "fair price", "balanced", "normal", "typical"
  ],
  "high-budget": [
    "expensive", "premium", "luxury", "high-end", "upscale", 
    "deluxe", "exclusive", "5-star", "first class", "vip"
  ]
};

// Duration-related keywords
const DURATION_KEYWORDS = {
  "short": ["day", "weekend", "short", "quick", "brief", "mini"],
  "medium": ["week", "7 days", "extended", "longer", "full"],
  "long": ["two weeks", "14 days", "extended", "long", "comprehensive"]
};

export function autoTag(title: string, description?: string): AutoTagResult {
  const combinedText = `${title} ${description || ""}`.toLowerCase();
  const foundTags: string[] = [];
  let totalMatches = 0;

  // Check each tag category
  Object.entries(TAG_KEYWORDS).forEach(([tag, keywords]) => {
    const matches = keywords.filter(keyword => 
      combinedText.includes(keyword.toLowerCase())
    ).length;
    
    if (matches > 0) {
      foundTags.push(tag);
      totalMatches += matches;
    }
  });

  // Check budget indicators
  Object.entries(BUDGET_KEYWORDS).forEach(([budgetTag, keywords]) => {
    const matches = keywords.filter(keyword => 
      combinedText.includes(keyword.toLowerCase())
    ).length;
    
    if (matches > 0) {
      foundTags.push(budgetTag);
      totalMatches += matches;
    }
  });

  // Calculate confidence based on keyword matches
  const maxPossibleMatches = Object.keys(TAG_KEYWORDS).length + 
                             Object.keys(BUDGET_KEYWORDS).length;
  const confidence = maxPossibleMatches > 0 ? 
    Math.min((totalMatches / maxPossibleMatches) * 100, 100) : 0;

  return {
    tags: [...new Set(foundTags)], // Remove duplicates
    confidence
  };
}

export function suggestTagsFromDestination(destination: string): string[] {
  const destinationLower = destination.toLowerCase();
  const suggestedTags: string[] = [];

  // Destination-based tag suggestions
  const destinationMappings: Record<string, string[]> = {
    "maldives": ["beach", "tropical", "luxury", "relax"],
    "switzerland": ["mountain", "nature", "adventure", "cold"],
    "dubai": ["luxury", "urban", "modern", "desert"],
    "thailand": ["beach", "tropical", "culture", "food"],
    "iceland": ["nature", "cold", "adventure", "northern-lights"],
    "japan": ["culture", "urban", "modern", "food"],
    "morocco": ["desert", "culture", "adventure", "traditional"],
    "italy": ["culture", "food", "relax", "history"],
    "spain": ["beach", "culture", "relax", "urban"],
    "france": ["culture", "luxury", "urban", "food"],
    "canada": ["nature", "adventure", "outdoor", "wildlife"],
    "usa": ["urban", "culture", "adventure", "diverse"],
    "brazil": ["beach", "tropical", "culture", "adventure"],
    "egypt": ["desert", "culture", "history", "adventure"],
    "greece": ["beach", "culture", "history", "relax"],
    "portugal": ["beach", "culture", "relax", "food"]
  };

  // Check for exact destination match
  if (destinationMappings[destinationLower]) {
    suggestedTags.push(...destinationMappings[destinationLower]);
  }

  // Check for partial matches
  Object.entries(destinationMappings).forEach(([dest, tags]) => {
    if (dest.includes(destinationLower) || destinationLower.includes(dest)) {
      suggestedTags.push(...tags);
    }
  });

  return [...new Set(suggestedTags)]; // Remove duplicates
}

export function enhanceTagsWithAuto(
  manualTags: string[], 
  title: string, 
  description?: string
): string[] {
  const autoResult = autoTag(title, description);
  const destinationTags = suggestTagsFromDestination(title);
  
  // Combine manual tags with auto-generated tags
  const allTags = [
    ...manualTags,
    ...autoResult.tags,
    ...destinationTags
  ];

  // Remove duplicates and return
  return [...new Set(allTags)];
}

export function validateTags(tags: string[]): { valid: string[]; invalid: string[] } {
  const validTags: string[] = [];
  const invalidTags: string[] = [];

  const allValidTags = [
    ...Object.keys(TAG_KEYWORDS),
    ...Object.keys(BUDGET_KEYWORDS),
    "low-budget", "mid-budget", "high-budget"
  ];

  tags.forEach(tag => {
    if (allValidTags.includes(tag)) {
      validTags.push(tag);
    } else {
      invalidTags.push(tag);
    }
  });

  return { valid: validTags, invalid: invalidTags };
}
