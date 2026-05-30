export type TravelImage = {
  id: string;
  url: string;
  title: string;
  location: string;
  tags: string[];
};

export const travelImages: TravelImage[] = [
  {
    id: "1",
    url: "https://source.unsplash.com/800x600/?beach",
    title: "Beach Escape",
    location: "Maldives",
    tags: ["beach", "nature", "relax", "low-budget", "tropical"]
  },
  {
    id: "2",
    url: "https://source.unsplash.com/800x600/?mountains",
    title: "Mountain Adventure",
    location: "Swiss Alps",
    tags: ["mountain", "adventure", "hiking", "nature", "high-budget", "outdoor"]
  },
  {
    id: "3",
    url: "https://source.unsplash.com/800x600/?luxury-hotel",
    title: "Luxury Stay",
    location: "Dubai",
    tags: ["luxury", "hotel", "premium", "comfort", "high-budget", "urban"]
  },
  {
    id: "4",
    url: "https://source.unsplash.com/800x600/?city-lights",
    title: "Urban Explorer",
    location: "Tokyo",
    tags: ["city", "urban", "night", "modern", "culture", "mid-budget"]
  },
  {
    id: "5",
    url: "https://source.unsplash.com/800x600/?countryside",
    title: "Countryside Retreat",
    location: "Tuscany",
    tags: ["countryside", "rural", "relax", "nature", "low-budget", "traditional"]
  },
  {
    id: "6",
    url: "https://source.unsplash.com/800x600/?desert-safari",
    title: "Desert Safari",
    location: "Sahara",
    tags: ["desert", "safari", "adventure", "wildlife", "nature", "high-budget"]
  },
  {
    id: "7",
    url: "https://source.unsplash.com/800x600/?northern-lights",
    title: "Northern Lights",
    location: "Iceland",
    tags: ["northern-lights", "nature", "adventure", "cold", "photography", "high-budget"]
  },
  {
    id: "8",
    url: "https://source.unsplash.com/800x600/?tropical-island",
    title: "Island Paradise",
    location: "Bora Bora",
    tags: ["island", "tropical", "beach", "relax", "luxury", "high-budget"]
  }
];

export const getImageById = (id: string): TravelImage | undefined => {
  return travelImages.find(img => img.id === id);
};

export const getImagesByTags = (tags: string[]): TravelImage[] => {
  return travelImages.filter(img => 
    tags.some(tag => img.tags.includes(tag))
  );
};
