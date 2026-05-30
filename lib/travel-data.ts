// Central data store for the explore dashboard.
// All content is squad-aware: filter hotels/restaurants/activities by squadTags,
// and read squad-keyed objects (taglines, positives, itinerary, aiInsight) directly.

export type SquadType = 'solo' | 'couple' | 'friends' | 'family';

export interface Hotel {
  id: string;
  name: string;
  image: string;
  rating: number;
  price: string;
  priceLevel: 'budget' | 'mid-range' | 'luxury';
  address: string;
  amenities: string[];
  description: string;
  squadTags: SquadType[];
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  cuisine: string;
  description: string;
  price: string;
  priceLevel: 'budget' | 'mid-range' | 'luxury';
  address: string;
  tags: string[];
  squadTags: SquadType[];
}

export interface Activity {
  id: string;
  name: string;
  image: string;
  description: string;
  duration: string;
  rating: number;
  price: string;
  category: string;
  accentColor: string;
  squadTags: SquadType[];
}

export interface TravelEvent {
  id: string;
  name: string;
  category: string;
  date: string;
  matchPercentage: number;
  description: string;
  squadTags: SquadType[];
}

export interface ItineraryDay {
  day: number;
  theme: string;
  morning: string;
  afternoon: string;
  evening: string;
  icon: string;
}

export interface DestinationEntry {
  id: string;
  name: string;
  flag: string;
  heroImage: string;
  cardImage: string;
  taglines: Record<SquadType, string>;
  weather: { temp: string; condition: string; icon: string };
  matchPercentage: number;
  description: string;
  currency: string;
  language: string;
  timezone: string;
  positives: Record<SquadType, string[]>;
  negatives: Record<SquadType, string[]>;
  hotels: Hotel[];
  restaurants: Restaurant[];
  activities: Activity[];
  events: TravelEvent[];
  itinerary: Record<SquadType, ItineraryDay[]>;
  aiInsight: Record<SquadType, string>;
  mapCenter: { lat: number; lng: number };
}

// ─── Destinations ─────────────────────────────────────────────────────────────

export const DESTINATIONS: DestinationEntry[] = [
  {
    id: 'japan',
    name: 'Japan',
    flag: '🇯🇵',
    heroImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
    taglines: {
      solo:    'A peaceful solo adventure awaits',
      couple:  'A romantic cultural journey for two',
      friends: 'An unforgettable group experience',
      family:  'Memories the whole family will treasure',
    },
    weather: { temp: '15–25°C', condition: 'Comfortable', icon: '⛅' },
    matchPercentage: 87,
    description: 'A perfect blend of ancient temples, futuristic cities, and stunning nature.',
    currency: '¥ Yen',
    language: 'Japanese',
    timezone: 'UTC+9',
    positives: {
      solo:    ['Safe for solo travelers', 'Excellent public transport', 'Rich cultural experiences', 'Zen temples & meditation retreats', 'Quiet ryokan stays'],
      couple:  ['Romantic cherry blossom season', 'Intimate izakaya dining', 'Scenic ryokan with onsen', 'Couples tea ceremonies', 'Kyoto evening strolls'],
      friends: ['Vibrant nightlife in Tokyo', 'Group karaoke experiences', 'Street food tours', 'Theme parks & arcades', 'Mt. Fuji day trips'],
      family:  ['Very safe for children', 'Kid-friendly attractions', 'Amazing themed restaurants', 'Disneyland Tokyo', 'Pokemon centers everywhere'],
    },
    negatives: {
      solo:    ['Language barrier outside cities', 'Some restaurants prefer groups', 'Can feel lonely during festivals'],
      couple:  ['Hotels can be small', 'Cherry blossom crowds in April', 'Booking popular ryokans far in advance needed'],
      friends: ['Expensive for large groups', 'Accommodation size limits', 'Some areas are strict about noise'],
      family:  ['Long flights from most countries', 'Some attractions have age/height limits', 'Jet lag with young children'],
    },
    hotels: [
      {
        id: 'h1', name: 'Park Hyatt Tokyo', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
        rating: 4.9, price: '$450/night', priceLevel: 'luxury', address: 'Shinjuku, Tokyo',
        amenities: ['Infinity Pool', 'Spa', 'City Views', 'Michelin Restaurant'],
        description: 'Iconic luxury tower with breathtaking Tokyo skyline views. Featured in Lost in Translation.',
        squadTags: ['couple', 'solo'],
      },
      {
        id: 'h2', name: 'Hoshinoya Kyoto', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80',
        rating: 4.8, price: '$380/night', priceLevel: 'luxury', address: 'Arashiyama, Kyoto',
        amenities: ['Onsen', 'Private River Access', 'Garden Views', 'Tea Ceremony'],
        description: 'Only accessible by boat, this ryokan offers an exclusive retreat in Arashiyama forest.',
        squadTags: ['couple', 'solo'],
      },
      {
        id: 'h3', name: 'Cerulean Tower Tokyu', image: 'https://images.unsplash.com/photo-1551882547-ff40c4a49ce7?w=600&q=80',
        rating: 4.7, price: '$220/night', priceLevel: 'mid-range', address: 'Shibuya, Tokyo',
        amenities: ['Rooftop Bar', 'Jazz Club', 'Fitness Center', 'Group Dining'],
        description: 'Right in Shibuya\'s heart — perfect for friend groups exploring Tokyo\'s buzzing nightlife.',
        squadTags: ['friends'],
      },
      {
        id: 'h4', name: 'Tokyo Disneyland Hotel', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
        rating: 4.6, price: '$180/night', priceLevel: 'mid-range', address: 'Urayasu, Chiba',
        amenities: ['Kids Club', 'Disney Themes', 'Pool', 'Character Breakfast'],
        description: 'Step into a fairy tale — rooms themed after Disney characters, right at the park gates.',
        squadTags: ['family'],
      },
      {
        id: 'h5', name: 'Khaosan Tokyo Origami', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',
        rating: 4.3, price: '$60/night', priceLevel: 'budget', address: 'Asakusa, Tokyo',
        amenities: ['Common Room', 'Bike Rental', 'City Tours', 'Breakfast'],
        description: 'Social hostel in historic Asakusa, loved by solo travelers for its community feel.',
        squadTags: ['solo', 'friends'],
      },
    ],
    restaurants: [
      {
        id: 'r1', name: 'Narisawa', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
        rating: 4.9, cuisine: 'Innovative Japanese', description: 'Two Michelin stars, blending nature and gastronomy in an intimate 40-seat dining room.',
        price: '$250/person', priceLevel: 'luxury', address: 'Minami-Aoyama, Tokyo',
        tags: ['romantic', 'fine-dining', 'michelin'], squadTags: ['couple', 'solo'],
      },
      {
        id: 'r2', name: 'Gonpachi Nishi-Azabu', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
        rating: 4.6, cuisine: 'Izakaya', description: 'The iconic "Kill Bill" restaurant — lively, fun, perfect for groups to share yakitori and sake.',
        price: '$35/person', priceLevel: 'mid-range', address: 'Nishi-Azabu, Tokyo',
        tags: ['lively', 'group-friendly', 'iconic'], squadTags: ['friends', 'couple'],
      },
      {
        id: 'r3', name: 'Kura Sushi Family', image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&q=80',
        rating: 4.5, cuisine: 'Sushi Conveyor', description: 'Rotating sushi on a conveyor belt — kids love picking their favorites, parents love the prices.',
        price: '$20/person', priceLevel: 'budget', address: 'Multiple locations, Tokyo',
        tags: ['kid-friendly', 'fun', 'interactive'], squadTags: ['family'],
      },
      {
        id: 'r4', name: 'Ichiran Ramen', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
        rating: 4.7, cuisine: 'Ramen', description: 'Solo dining booths designed for full focus on your ramen — the ultimate solo food experience.',
        price: '$15/person', priceLevel: 'budget', address: 'Multiple locations, Japan',
        tags: ['solo-friendly', 'iconic', 'focused'], squadTags: ['solo'],
      },
      {
        id: 'r5', name: 'Ninja Restaurant', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80',
        rating: 4.4, cuisine: 'Japanese with Entertainment', description: 'Ninja-costumed servers, magic shows at the table, secret passages. Kids and friends go wild.',
        price: '$80/person', priceLevel: 'luxury', address: 'Akasaka, Tokyo',
        tags: ['entertainment', 'fun', 'themed'], squadTags: ['family', 'friends'],
      },
    ],
    activities: [
      {
        id: 'a1', name: 'Senso-ji Temple at Dawn', image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80',
        description: 'Experience the ancient Asakusa temple before the crowds arrive. Meditative and awe-inspiring.',
        duration: '2 hours', rating: 4.9, price: 'Free', category: 'Culture', accentColor: 'from-amber-500 to-orange-600',
        squadTags: ['solo', 'couple'],
      },
      {
        id: 'a2', name: 'Shibuya Crossing at Night', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
        description: 'Stand in the world\'s busiest intersection as thousands cross simultaneously under neon lights.',
        duration: '1 hour', rating: 4.8, price: 'Free', category: 'Urban', accentColor: 'from-purple-500 to-pink-600',
        squadTags: ['friends', 'couple', 'solo'],
      },
      {
        id: 'a3', name: 'Mt. Fuji Day Trip', image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&q=80',
        description: 'Hike or ride to the 5th station with panoramic views of Japan\'s iconic sacred mountain.',
        duration: 'Full day', rating: 4.9, price: '$50', category: 'Nature', accentColor: 'from-blue-500 to-cyan-600',
        squadTags: ['solo', 'friends', 'couple'],
      },
      {
        id: 'a4', name: 'Teamlab Borderless', image: 'https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=600&q=80',
        description: 'Immersive digital art museum where art moves freely between rooms. Mesmerizing for all ages.',
        duration: '3 hours', rating: 4.9, price: '$30', category: 'Art', accentColor: 'from-violet-500 to-indigo-600',
        squadTags: ['family', 'couple', 'friends'],
      },
      {
        id: 'a5', name: 'Robot Restaurant Show', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
        description: 'Over-the-top neon, robots, and performers — the most uniquely Tokyo experience possible.',
        duration: '2 hours', rating: 4.5, price: '$80', category: 'Entertainment', accentColor: 'from-red-500 to-rose-600',
        squadTags: ['friends', 'family'],
      },
      {
        id: 'a6', name: 'Arashiyama Bamboo Grove', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
        description: 'Walk through towering bamboo stalks at dawn for a deeply peaceful and photogenic experience.',
        duration: '2 hours', rating: 4.8, price: 'Free', category: 'Nature', accentColor: 'from-green-500 to-emerald-600',
        squadTags: ['couple', 'solo'],
      },
      {
        id: 'a7', name: 'Mario Kart Street Tour', image: 'https://images.unsplash.com/photo-1522158637959-30385a09e0da?w=600&q=80',
        description: 'Dress as Mario characters and race real go-karts through Tokyo\'s streets. Absolute chaos — the best kind.',
        duration: '3 hours', rating: 4.7, price: '$100', category: 'Adventure', accentColor: 'from-yellow-500 to-orange-600',
        squadTags: ['friends', 'family'],
      },
    ],
    events: [
      { id: 'e1', name: 'Hanami Cherry Blossom Festival', category: 'Festival', date: 'Apr 1–15', matchPercentage: 95, description: 'Japan\'s iconic cherry blossom viewing season.', squadTags: ['couple', 'solo', 'friends', 'family'] },
      { id: 'e2', name: 'Tokyo Game Show', category: 'Gaming', date: 'Sep 20–23', matchPercentage: 88, description: 'Asia\'s largest gaming expo with hundreds of previews.', squadTags: ['friends', 'solo'] },
      { id: 'e3', name: 'Obon Summer Festival', category: 'Cultural', date: 'Aug 13–16', matchPercentage: 82, description: 'Traditional lantern dances honoring ancestors.', squadTags: ['family', 'couple', 'solo'] },
      { id: 'e4', name: 'Awa Odori Dance Parade', category: 'Dance', date: 'Aug 12–15', matchPercentage: 78, description: 'Tokushima\'s famous street dance festival.', squadTags: ['friends', 'family'] },
      { id: 'e5', name: 'Tokyo Marathon', category: 'Sport', date: 'Mar 3', matchPercentage: 70, description: 'One of the six World Marathon Majors.', squadTags: ['solo', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Arrival & Asakusa', morning: 'Senso-ji Temple at dawn before crowds arrive', afternoon: 'Explore Nakamise Street & Akihabara electronics district', evening: 'Solo ramen at Ichiran — the ultimate solo dining ritual', icon: '🏛️' },
        { day: 2, theme: 'Zen & Nature', morning: 'Meiji Shrine & Yoyogi Park meditation walk', afternoon: 'Teamlab Borderless digital art museum', evening: 'Quiet sake bar in Golden Gai, Shinjuku', icon: '🌿' },
        { day: 3, theme: 'Day Trip to Kyoto', morning: 'Shinkansen to Kyoto', afternoon: 'Fushimi Inari shrine — hike the thousand torii gates alone', evening: 'Return to Tokyo, reflect over sushi omakase', icon: '🚄' },
      ],
      couple: [
        { day: 1, theme: 'Romantic Tokyo', morning: 'Tokyo Skytree sunrise view', afternoon: 'Couples tea ceremony in Hamarikyu Gardens', evening: 'Dinner at Narisawa (book months ahead)', icon: '🌸' },
        { day: 2, theme: 'Kyoto Romance', morning: 'Arashiyama bamboo grove at dawn', afternoon: 'Couples kimono rental & Gion stroll', evening: 'Kaiseki dinner in a lantern-lit restaurant', icon: '👘' },
        { day: 3, theme: 'Onsen Escape', morning: 'Hakone hot springs ryokan check-in', afternoon: 'Outdoor onsen with Mt. Fuji view', evening: 'Private multi-course kaiseki dinner', icon: '♨️' },
      ],
      friends: [
        { day: 1, theme: 'Tokyo Chaos', morning: 'Tsukiji outer market seafood breakfast', afternoon: 'Mario Kart street tour through Shibuya', evening: 'Karaoke in Shinjuku + Shibuya Crossing at night', icon: '🎮' },
        { day: 2, theme: 'Theme Parks', morning: 'Universal Studios Japan (Harry Potter World)', afternoon: 'More rides until closing', evening: 'Robot Restaurant dinner show', icon: '🎢' },
        { day: 3, theme: 'Mt. Fuji Adventure', morning: 'Early bus to Fuji 5th Station', afternoon: 'Hike & explore Fuji Five Lakes', evening: 'Izakaya feast in Gonpachi', icon: '🗻' },
      ],
      family: [
        { day: 1, theme: 'Disney Magic', morning: 'Tokyo Disneyland — arrive at opening', afternoon: 'Fantasyland & Tomorrowland attractions', evening: 'Disney parade & character dinner', icon: '🎡' },
        { day: 2, theme: 'Edo & Culture', morning: 'Edo-Tokyo Museum — interactive history for kids', afternoon: 'Teamlab Planets immersive art', evening: 'Ninja Restaurant performance dinner', icon: '⚔️' },
        { day: 3, theme: 'Nature & Science', morning: 'Ueno Zoo — giant pandas!', afternoon: 'National Museum of Nature & Science', evening: 'Kura Sushi conveyor belt dinner — kids\' favorite', icon: '🐼' },
      ],
    },
    aiInsight: {
      solo:    'Japan is a solo traveler\'s paradise. The culture of respecting personal space, the incredibly safe streets, and the meditative temple circuits make it ideal for self-discovery. The famous solo dining booths at Ichiran Ramen were literally designed for people like you.',
      couple:  'From cherry blossom picnics in Maruyama Park to candlelit ryokan dinners in Kyoto, Japan creates deeply romantic memories. The onsen tradition of communal hot spring bathing adds an intimate cultural ritual couples won\'t find anywhere else.',
      friends: 'Tokyo never sleeps and it\'s built for groups. Karaoke rooms, izakayas designed for sharing, Mario Kart street tours, theme parks — every corner of Japan offers something to laugh about together. Golden Gai in Shinjuku has 200+ tiny bars to explore.',
      family:  'Japan consistently ranks as one of the world\'s most family-friendly destinations. Tokyo Disneyland, Pokemon Centers, Studio Ghibli Museum, and the sheer novelty of vending machines on every corner keep children endlessly entertained while parents enjoy world-class cuisine.',
    },
    mapCenter: { lat: 35.6762, lng: 139.6503 },
  },

  {
    id: 'france',
    name: 'France',
    flag: '🇫🇷',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1431274172761-fcdab704f2e0?w=600&q=80',
    taglines: {
      solo:    'Discover yourself in the city of light',
      couple:  'The most romantic destination on Earth',
      friends: 'Wine, laughter and Parisian adventures',
      family:  'History, magic and croissants for everyone',
    },
    weather: { temp: '10–22°C', condition: 'Mild & Sunny', icon: '🌤️' },
    matchPercentage: 82,
    description: 'Art, gastronomy, fashion and romance woven into every cobblestone.',
    currency: '€ Euro',
    language: 'French',
    timezone: 'UTC+1',
    positives: {
      solo:    ['World-class museums to explore alone', 'Café culture perfect for solo lingering', 'Excellent train network', 'Welcoming solo travel hostels', 'Art scenes everywhere'],
      couple:  ['Most romantic city in the world', 'Eiffel Tower at night', 'Champagne & fine dining', 'Lavender fields in Provence', 'Seine river cruises'],
      friends: ['Amazing nightlife in Le Marais', 'Wine tastings in Bordeaux', 'Group cooking classes', 'Affordable wine & cheese', 'Versailles day trip'],
      family:  ['Disneyland Paris', 'Rich history for kids', 'Crepe stands everywhere', 'Easy family train travel', 'Louvre family tours'],
    },
    negatives: {
      solo:    ['Some locals can seem cold', 'French language useful to know', 'Some restaurants are pricey solo'],
      couple:  ['Very crowded in summer', 'Pickpockets in tourist areas', 'Accommodation is expensive'],
      friends: ['Expensive nightlife', 'Language barrier in smaller cities', 'Long queues at attractions'],
      family:  ['Heat in July/August', 'Museum queues with children', 'Cost adds up quickly'],
    },
    hotels: [
      { id: 'h1', name: 'Le Bristol Paris', image: 'https://images.unsplash.com/photo-1551882547-ff40c4a49ce7?w=600&q=80', rating: 4.9, price: '$650/night', priceLevel: 'luxury', address: 'Rue du Faubourg Saint-Honoré, Paris', amenities: ['Rooftop Pool', '3 Michelin Stars', 'Spa', 'Garden'], description: 'Palace hotel where celebrities and dignitaries have stayed since 1925. Ultimate Parisian luxury.', squadTags: ['couple', 'solo'] },
      { id: 'h2', name: 'Generator Paris', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$55/night', priceLevel: 'budget', address: 'Canal Saint-Martin, Paris', amenities: ['Rooftop Bar', 'Social Events', 'Tour Booking', 'Café'], description: 'Buzzing hostel with a legendary rooftop and social scene. The friend-group headquarters in Paris.', squadTags: ['friends', 'solo'] },
      { id: 'h3', name: 'Hôtel du Petit Moulin', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 4.7, price: '$280/night', priceLevel: 'luxury', address: 'Le Marais, Paris', amenities: ['Boutique Design', 'Wine Bar', 'Couples Packages', 'City Views'], description: 'Intimate designer hotel in Le Marais with rooms designed by Christian Lacroix. Utterly romantic.', squadTags: ['couple'] },
      { id: 'h4', name: 'Disneyland Hotel Paris', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.6, price: '$200/night', priceLevel: 'mid-range', address: 'Marne-la-Vallée, Paris', amenities: ['Disney Themes', 'Kids Pool', 'Character Meets', 'Park Access'], description: 'The pink castle hotel at the entrance of Disneyland Paris. Kids will never forget it.', squadTags: ['family'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Le Jules Verne', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.8, cuisine: 'French Gastronomic', description: 'Alain Ducasse restaurant on the second floor of the Eiffel Tower. Dining at 125 meters.', price: '$300/person', priceLevel: 'luxury', address: 'Eiffel Tower, Paris', tags: ['romantic', 'iconic', 'fine-dining'], squadTags: ['couple'] },
      { id: 'r2', name: 'Bouillon Chartier', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.6, cuisine: 'Traditional French', description: 'Classic 1896 Parisian brasserie with shared tables, marble counters and €12 steak frites. Legendary.', price: '$20/person', priceLevel: 'budget', address: '7 Rue du Faubourg Montmartre, Paris', tags: ['historic', 'communal', 'affordable'], squadTags: ['friends', 'solo', 'family'] },
      { id: 'r3', name: 'Septime', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.9, cuisine: 'Modern French', description: 'Reservation-only natural wine bistro, consistently rated Paris\'s best restaurant. Worth the wait.', price: '$90/person', priceLevel: 'luxury', address: 'Bastille, Paris', tags: ['trendy', 'natural-wine', 'creative'], squadTags: ['solo', 'couple'] },
    ],
    activities: [
      { id: 'a1', name: 'Louvre Museum', image: 'https://images.unsplash.com/photo-1499856374997-73a4db6e54eb?w=600&q=80', description: 'World\'s largest art museum housing 38,000 objects from prehistory to modern era including the Mona Lisa.', duration: '4 hours', rating: 4.8, price: '$22', category: 'Culture', accentColor: 'from-amber-500 to-orange-600', squadTags: ['solo', 'couple', 'family', 'friends'] },
      { id: 'a2', name: 'Versailles Palace & Gardens', image: 'https://images.unsplash.com/photo-1559656914-a30970c1affd?w=600&q=80', description: 'The Sun King\'s incomprehensible palace with 2,300 rooms and 800 hectares of garden.', duration: 'Full day', rating: 4.7, price: '$30', category: 'History', accentColor: 'from-yellow-500 to-amber-600', squadTags: ['family', 'couple', 'friends'] },
      { id: 'a3', name: 'Seine River Cruise', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80', description: 'Float past Notre-Dame, Eiffel Tower, and the Louvre at dusk with a glass of champagne.', duration: '1 hour', rating: 4.6, price: '$25', category: 'Romantic', accentColor: 'from-blue-500 to-indigo-600', squadTags: ['couple', 'friends', 'family'] },
      { id: 'a4', name: 'Montmartre Art Walk', image: 'https://images.unsplash.com/photo-1431274172761-fcdab704f2e0?w=600&q=80', description: 'Wander cobblestone streets where Picasso and van Gogh once lived. Street artists still work here daily.', duration: '3 hours', rating: 4.7, price: 'Free', category: 'Art', accentColor: 'from-rose-500 to-pink-600', squadTags: ['solo', 'couple', 'friends'] },
    ],
    events: [
      { id: 'e1', name: 'Bastille Day Celebrations', category: 'National', date: 'Jul 14', matchPercentage: 92, description: 'Military parade on the Champs-Élysées + massive fireworks over the Eiffel Tower.', squadTags: ['family', 'friends', 'couple', 'solo'] },
      { id: 'e2', name: 'Paris Fashion Week', category: 'Fashion', date: 'Sep 25 – Oct 3', matchPercentage: 85, description: 'The world\'s most prestigious fashion event. Shows by Chanel, Dior, and Saint Laurent.', squadTags: ['couple', 'solo'] },
      { id: 'e3', name: 'Nuit Blanche Art Night', category: 'Art', date: 'Oct 5', matchPercentage: 80, description: 'All-night contemporary art installations across the entire city. Free entry.', squadTags: ['friends', 'solo', 'couple'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Arrival & Montmartre', morning: 'Settle in, coffee at a corner café', afternoon: 'Montmartre art walk, Sacré-Cœur', evening: 'Solo wine bar in Le Marais', icon: '🎨' },
        { day: 2, theme: 'The Great Museums', morning: 'Louvre — Mona Lisa, Venus de Milo, Winged Victory', afternoon: 'Musée d\'Orsay Impressionists', evening: 'Seine walk at sunset', icon: '🖼️' },
        { day: 3, theme: 'Day Trip', morning: 'Train to Versailles', afternoon: 'Palace and gardens exploration', evening: 'Return for a bistro dinner and reflection', icon: '🏰' },
      ],
      couple: [
        { day: 1, theme: 'Iconic Romance', morning: 'Eiffel Tower at opening hour (no crowds)', afternoon: 'Picnic in Champ de Mars with champagne', evening: 'Dinner at Le Jules Verne inside the tower', icon: '🗼' },
        { day: 2, theme: 'Art & Strolling', morning: 'Musée Rodin — The Kiss, The Thinker', afternoon: 'Stroll along the Seine, bookstall browsing', evening: 'Evening Seine cruise with wine', icon: '🌹' },
        { day: 3, theme: 'Versailles Escape', morning: 'Versailles Palace — Hall of Mirrors', afternoon: 'Row a boat in the Grand Canal', evening: 'Candlelit dinner in a classic Parisian bistro', icon: '🕯️' },
      ],
      friends: [
        { day: 1, theme: 'Food & Markets', morning: 'Marché d\'Aligre food market breakfast', afternoon: 'Louvre highlights tour (focus on the best bits)', evening: 'Bouillon Chartier dinner + Le Marais bar crawl', icon: '🍷' },
        { day: 2, theme: 'Versailles & Picnic', morning: 'Versailles day trip', afternoon: 'Group picnic in the palace gardens', evening: 'Back to Paris — rooftop bar sunset drinks', icon: '🧺' },
        { day: 3, theme: 'Nightlife', morning: 'Sleep in, brunch in Bastille', afternoon: 'Cooking class — croissants and crêpes', evening: 'Club night in Pigalle or Canal Saint-Martin', icon: '🎉' },
      ],
      family: [
        { day: 1, theme: 'Disneyland Paris', morning: 'Arrive at Disneyland at opening, beat the queues', afternoon: 'Fantasyland and Adventureland', evening: 'Parade & fireworks show', icon: '🏰' },
        { day: 2, theme: 'Paris Icons', morning: 'Eiffel Tower visit (kids love the lift)', afternoon: 'Boat tour on the Seine', evening: 'Crêpes for dinner near Notre-Dame', icon: '🗼' },
        { day: 3, theme: 'Discovery & Fun', morning: 'Cité des Sciences et de l\'Industrie (Science museum for kids)', afternoon: 'Luxembourg Gardens puppet show', evening: 'Bouillon Chartier — French classics the whole family will enjoy', icon: '🔬' },
      ],
    },
    aiInsight: {
      solo:    'Paris rewards the solo traveler who slows down. The café culture is practically designed for one — order a café au lait, open a notebook, and watch the city flow by. Every museum, every arrondissement offers hours of exploration without needing company.',
      couple:  'Paris earned its reputation as the world\'s most romantic city for a reason. Every element — the light, the architecture, the food, the language — conspires to create intimacy. Whether it\'s your first trip or your fifth, it feels new when shared with someone you love.',
      friends: 'French culture is built for shared pleasure. Wine is meant to be split, cheese boards are for discussion, and the French believe eating alone is a waste. Paris with friends is loud, joyful, and full of discoveries — from hidden jazz bars to all-night parties in the Pigalle.',
      family:  'Disneyland Paris alone makes this a legendary family destination. But the food, the history, the child-sized crêpe portions, the boat rides, and the sheer magic of the Eiffel Tower for a child who\'s never seen it — these moments are priceless.',
    },
    mapCenter: { lat: 48.8566, lng: 2.3522 },
  },

  {
    id: 'thailand',
    name: 'Thailand',
    flag: '🇹🇭',
    heroImage: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=600&q=80',
    taglines: {
      solo:    'Find your inner peace in the Land of Smiles',
      couple:  'Romance on turquoise waters',
      friends: 'The ultimate group adventure',
      family:  'Magical temples, beaches and elephant sanctuaries',
    },
    weather: { temp: '28–35°C', condition: 'Tropical & Warm', icon: '☀️' },
    matchPercentage: 91,
    description: 'Temples, beaches, street food, and world-class hospitality at an unbeatable price.',
    currency: '฿ Baht',
    language: 'Thai',
    timezone: 'UTC+7',
    positives: {
      solo:    ['One of the world\'s top solo destinations', 'Very safe and welcoming', 'Extremely budget-friendly', 'Yoga & meditation retreats', 'Easy island hopping'],
      couple:  ['Stunning beach resorts', 'Private island rentals possible', 'Romantic Thai massage for two', 'Beautiful temple atmospheres', 'Sunset boat tours'],
      friends: ['World-class party scene in Bangkok', 'Incredibly affordable', 'Group villa rentals', 'Muay Thai experiences', 'Night market feasts'],
      family:  ['Very family-friendly culture', 'Elephant sanctuaries', 'Warm, safe waters for swimming', 'Thai cooking classes for kids', 'Affordable luxury'],
    },
    negatives: {
      solo:    ['Occasional scams targeting tourists', 'Can be very hot', 'Some areas crowded'],
      couple:  ['Rainy season June-October', 'Some beaches very busy', 'Dress codes at temples'],
      friends: ['Party areas can be overwhelming', 'Haggling exhausting for some', 'Night buses not for everyone'],
      family:  ['Heat can overwhelm small children', 'Temple dress codes strict', 'Travel between islands time-consuming'],
    },
    hotels: [
      { id: 'h1', name: 'Soneva Kiri Koh Kood', image: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=600&q=80', rating: 5.0, price: '$800/night', priceLevel: 'luxury', address: 'Koh Kood Island', amenities: ['Private Pool Villa', 'Overwater Cinema', 'Organic Farm', 'Spa'], description: 'Barefoot luxury on a private island. Rooms come with personal butlers and hammocks over the sea.', squadTags: ['couple'] },
      { id: 'h2', name: 'Mad Monkey Bangkok', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$25/night', priceLevel: 'budget', address: 'Silom, Bangkok', amenities: ['Rooftop Pool', 'Bar', 'Tour Desk', 'Social Events'], description: 'Bangkok\'s most social hostel. Rooftop pool parties, pub crawls, and instant friendships.', squadTags: ['friends', 'solo'] },
      { id: 'h3', name: 'Anantara Riverside', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 4.8, price: '$180/night', priceLevel: 'mid-range', address: 'Chao Phraya, Bangkok', amenities: ['River Pool', 'Cooking Class', 'Kids Club', 'Elephant Camp Transfer'], description: 'Riverside resort with a world-class kids club and one of Bangkok\'s best cooking schools.', squadTags: ['family', 'couple'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Gaggan Anand', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 5.0, cuisine: 'Progressive Indian-Thai', description: 'Asia\'s best restaurant. 25-course emoji menu. A once-in-a-lifetime experience.', price: '$250/person', priceLevel: 'luxury', address: 'Ekkamai, Bangkok', tags: ['best-in-asia', 'experiential', 'emoji-menu'], squadTags: ['couple', 'solo'] },
      { id: 'r2', name: 'Or Tor Kor Market', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.7, cuisine: 'Thai Street Food', description: 'Bangkok\'s finest fresh market. Mangoes, curries, satay, and som tum fresh from the vendors.', price: '$5/person', priceLevel: 'budget', address: 'Chatuchak, Bangkok', tags: ['street-food', 'authentic', 'market'], squadTags: ['friends', 'family', 'solo'] },
    ],
    activities: [
      { id: 'a1', name: 'Elephant Nature Park', image: 'https://images.unsplash.com/photo-1551522435-a13afa10f103?w=600&q=80', description: 'Ethical elephant sanctuary in Chiang Mai. Bathe, feed, and walk with rescued elephants.', duration: 'Full day', rating: 5.0, price: '$80', category: 'Nature', accentColor: 'from-green-500 to-emerald-600', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'a2', name: 'Phi Phi Islands Snorkeling', image: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=600&q=80', description: 'Crystal clear waters, vibrant coral reefs, and the famous Maya Bay from The Beach (film).', duration: 'Full day', rating: 4.9, price: '$60', category: 'Water', accentColor: 'from-cyan-500 to-blue-600', squadTags: ['friends', 'couple', 'solo', 'family'] },
      { id: 'a3', name: 'Bangkok Night Markets', image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&q=80', description: 'Train Night Market, Jodd Fairs, Chatuchak — thousands of stalls of food, fashion and everything.', duration: '4 hours', rating: 4.7, price: 'Free', category: 'Shopping', accentColor: 'from-orange-500 to-red-600', squadTags: ['friends', 'family'] },
      { id: 'a4', name: 'Muay Thai Class', image: 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=600&q=80', description: 'Learn Thailand\'s national combat sport from world-class trainers at a real Bangkok gym.', duration: '2 hours', rating: 4.6, price: '$25', category: 'Sport', accentColor: 'from-red-500 to-rose-600', squadTags: ['friends', 'solo'] },
    ],
    events: [
      { id: 'e1', name: 'Songkran Water Festival', category: 'Festival', date: 'Apr 13–15', matchPercentage: 97, description: 'Thai New Year — the world\'s biggest water fight across every street in Thailand.', squadTags: ['friends', 'family', 'solo', 'couple'] },
      { id: 'e2', name: 'Yi Peng Lantern Festival', category: 'Cultural', date: 'Nov 15', matchPercentage: 94, description: 'Thousands of lanterns released into the Chiang Mai night sky. Breathtakingly beautiful.', squadTags: ['couple', 'solo', 'friends', 'family'] },
      { id: 'e3', name: 'Full Moon Party Koh Phangan', category: 'Nightlife', date: 'Monthly', matchPercentage: 89, description: 'The world\'s largest beach party — 30,000 people on Haad Rin beach every full moon.', squadTags: ['friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Bangkok Arrival', morning: 'Wat Pho temple — Buddha & traditional massage', afternoon: 'Grand Palace & Emerald Buddha', evening: 'Solo dinner at Or Tor Kor Market', icon: '🛕' },
        { day: 2, theme: 'Chiang Mai Retreat', morning: 'Fly to Chiang Mai, check into eco-lodge', afternoon: 'Doi Suthep temple hike', evening: 'Meditation class at a local temple', icon: '🧘' },
        { day: 3, theme: 'Elephant Sanctuary', morning: 'Full day at Elephant Nature Park', afternoon: 'Bathe and feed rescued elephants', evening: 'Night Bazaar in Chiang Mai', icon: '🐘' },
      ],
      couple: [
        { day: 1, theme: 'Bangkok Romance', morning: 'Floating market at dawn', afternoon: 'Thai cooking class for two', evening: 'Rooftop dinner with city views', icon: '🌅' },
        { day: 2, theme: 'Island Escape', morning: 'Fly/ferry to Koh Samui or Koh Lanta', afternoon: 'Check into beach villa, private sunset swim', evening: 'Beachside candlelit dinner', icon: '🏝️' },
        { day: 3, theme: 'Spa & Snorkeling', morning: 'Couples Thai massage (4 hands, 2 hours)', afternoon: 'Snorkeling trip to nearby coral reef', evening: 'Seafood BBQ on the beach', icon: '🧖' },
      ],
      friends: [
        { day: 1, theme: 'Bangkok Arrival', morning: 'Grand Palace + Muay Thai class', afternoon: 'Chatuchak Weekend Market', evening: 'Mad Monkey pub crawl', icon: '🥊' },
        { day: 2, theme: 'Phi Phi Islands', morning: 'Speedboat to Phi Phi Islands', afternoon: 'Snorkeling, cliff jumping, beach clubs', evening: 'Phi Phi nightlife (fire shows!)', icon: '🏄' },
        { day: 3, theme: 'Full Moon Prep', morning: 'Beach day on Koh Phangan', afternoon: 'Body paint and neon outfits shopping', evening: 'Full Moon Party all night', icon: '🌕' },
      ],
      family: [
        { day: 1, theme: 'Bangkok Highlights', morning: 'Grand Palace & Temple of the Emerald Buddha', afternoon: 'Or Tor Kor Market for food adventure', evening: 'Asiatique riverfront night market', icon: '🏯' },
        { day: 2, theme: 'Elephant Day', morning: 'Drive to elephant sanctuary near Bangkok', afternoon: 'Feed, walk and bathe with elephants', evening: 'Traditional Thai dinner with cultural show', icon: '🐘' },
        { day: 3, theme: 'Beach Family Day', morning: 'Ferry to Koh Samui or Koh Chang', afternoon: 'Calm waters swimming, sand castles', evening: 'Beachside family BBQ', icon: '🏖️' },
      ],
    },
    aiInsight: {
      solo:    'Thailand tops every solo travel poll for good reason: it\'s safe, remarkably affordable, the people are genuinely warm, and there\'s an entire infrastructure of hostels, meditation retreats, and cooking schools designed around the solo traveler experience.',
      couple:  'From the overwater villas of Koh Kood to the candlelit temples of Chiang Mai, Thailand is engineered for romance. The golden hour on any Thai beach, with warm water and a coconut in hand, is simply one of the most beautiful settings in the world.',
      friends: 'Thailand is the friend group destination. The Full Moon Party on Koh Phangan, $3 cocktail buckets on the beach, speedboats to limestone cliffs, muay thai classes, street food tours for $5 — it\'s the best value adventure trip your group will ever take.',
      family:  'Thai people genuinely love children and it shows in every interaction. The ethical elephant experiences, the calm warm beach waters, the fascinating temple culture, and the fact that a family of four can eat well for $20 makes Thailand extraordinarily family-friendly.',
    },
    mapCenter: { lat: 13.7563, lng: 100.5018 },
  },

  {
    id: 'italy',
    name: 'Italy',
    flag: '🇮🇹',
    heroImage: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=600&q=80',
    taglines: {
      solo:    'La dolce vita is best savored alone',
      couple:  'Love was invented here',
      friends: 'Wine, pasta, and unforgettable chaos',
      family:  'History alive in every piazza',
    },
    weather: { temp: '18–28°C', condition: 'Mediterranean', icon: '🌞' },
    matchPercentage: 79,
    description: 'Ancient ruins, Renaissance art, coastal villages, and the world\'s greatest food.',
    currency: '€ Euro',
    language: 'Italian',
    timezone: 'UTC+1',
    positives: {
      solo:    ['Welcoming café culture', 'World-class art and architecture', 'Excellent train network', 'Incredible solo dining — order a carafe of house wine', 'Coastal hiking in Cinque Terre'],
      couple:  ['Venice gondola rides', 'Amalfi Coast driving', 'Truffle dinners in Tuscany', 'Vineyard stays', 'Operatic evenings in Verona'],
      friends: ['Affordable wine & aperitivo', 'Cooking classes everywhere', 'Scenic road trips', 'Group villa rentals in Tuscany', 'Beach clubs in Sicily'],
      family:  ['Children eat free in many restaurants', 'Romans love children', 'Gelato on every corner', 'Interactive history everywhere', 'Theme parks near Rome'],
    },
    negatives: {
      solo:    ['Can be touristy in July', 'Some areas expensive', 'Language useful'],
      couple:  ['Venice floods (acqua alta)', 'Expensive in summer', 'Overcrowded popular spots'],
      friends: ['Car rental needed outside cities', 'Traffic chaos in Rome', 'Scams near tourist sites'],
      family:  ['Hills and cobblestones with strollers', 'Summer heat intense', 'Long drives between regions'],
    },
    hotels: [
      { id: 'h1', name: 'Hotel Cipriani Venice', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 5.0, price: '$1200/night', priceLevel: 'luxury', address: 'Giudecca Island, Venice', amenities: ['Private Island', 'Pool', 'Michelin Restaurant', 'Boat Service'], description: 'The legendary Venice island hotel reachable only by private launch. Timeless and extraordinary.', squadTags: ['couple'] },
      { id: 'h2', name: 'Belmond Villa San Michele', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80', rating: 4.9, price: '$750/night', priceLevel: 'luxury', address: 'Fiesole, Florence', amenities: ['Pool', 'Michelin Dining', 'Wine Cellar', 'Garden'], description: 'Former 15th-century monastery overlooking Florence with a façade attributed to Michelangelo.', squadTags: ['couple', 'solo'] },
      { id: 'h3', name: 'Family Hotel Garni Riviera', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.5, price: '$120/night', priceLevel: 'mid-range', address: 'Lake Garda, Lombardy', amenities: ['Lake Views', 'Kids Pool', 'Garden', 'Bike Rental'], description: 'Family-friendly hotel on Lake Garda with shallow swimming areas and a beautiful garden.', squadTags: ['family'] },
      { id: 'h4', name: 'The RomeHello Hostel', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.4, price: '$40/night', priceLevel: 'budget', address: 'Termini, Rome', amenities: ['Rooftop Terrace', 'Free Tours', 'Bar', 'Lockers'], description: 'Social hostel near the Colosseum with free walking tours and a lively rooftop hangout.', squadTags: ['friends', 'solo'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Da Ivo Venice', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.8, cuisine: 'Venetian', description: 'The most romantic restaurant in Venice, hidden down a quiet canal alley. Candlelit, intimate, perfect.', price: '$120/person', priceLevel: 'luxury', address: 'San Marco, Venice', tags: ['romantic', 'hidden', 'candlelit'], squadTags: ['couple'] },
      { id: 'r2', name: 'Trattoria Dall\'Olio', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.7, cuisine: 'Tuscan', description: 'A family-run trattoria in Florence\'s Oltrarno. Grandmother cooks, prices are 1970s, flavors are eternal.', price: '$25/person', priceLevel: 'budget', address: 'Oltrarno, Florence', tags: ['family-run', 'authentic', 'traditional'], squadTags: ['friends', 'family', 'solo'] },
    ],
    activities: [
      { id: 'a1', name: 'Colosseum VIP Night Tour', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80', description: 'Walk the ancient arena floor after dark with only 12 guests. Utterly haunting and magnificent.', duration: '2 hours', rating: 5.0, price: '$120', category: 'History', accentColor: 'from-amber-500 to-orange-600', squadTags: ['couple', 'solo', 'friends'] },
      { id: 'a2', name: 'Amalfi Coast Drive', image: 'https://images.unsplash.com/photo-1534445538923-ab0e2b26f3f6?w=600&q=80', description: 'Rent a convertible or hire a local driver for the most dramatic coastal road in Europe.', duration: 'Full day', rating: 4.9, price: '$150', category: 'Scenic', accentColor: 'from-blue-500 to-cyan-600', squadTags: ['couple', 'friends'] },
      { id: 'a3', name: 'Cooking Class in Bologna', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', description: 'Make fresh tagliatelle and ragù with a Bolognese nonnas. The real way. Worth every pasta calorie.', duration: '4 hours', rating: 4.9, price: '$90', category: 'Food', accentColor: 'from-red-500 to-orange-600', squadTags: ['friends', 'couple', 'family', 'solo'] },
    ],
    events: [
      { id: 'e1', name: 'Venice Carnival', category: 'Festival', date: 'Feb 17–25', matchPercentage: 93, description: 'Masks, elaborate costumes, and centuries of tradition in the streets and canals of Venice.', squadTags: ['couple', 'friends', 'solo'] },
      { id: 'e2', name: 'Verona Opera at Arena', category: 'Music', date: 'Jun–Aug', matchPercentage: 88, description: 'World-class opera in a 2,000-year-old Roman amphitheater under the stars.', squadTags: ['couple', 'solo'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Rome Classics', morning: 'Vatican & Sistine Chapel (early entry)', afternoon: 'Roman Forum & Palatine Hill', evening: 'Aperitivo in Trastevere', icon: '🏛️' },
        { day: 2, theme: 'Florence Discovery', morning: 'Train to Florence, Uffizi Gallery (Botticelli)', afternoon: 'Oltrarno neighborhood exploration', evening: 'Wine bar in Enoteca Pitti Gola e Cantina', icon: '🎨' },
        { day: 3, theme: 'Tuscan Hills', morning: 'Day trip to Siena or San Gimignano', afternoon: 'Vineyard visit with wine tasting', evening: 'Return to Florence, bistecca for one', icon: '🍷' },
      ],
      couple: [
        { day: 1, theme: 'Venice Romance', morning: 'Arrive Venice, gondola through quiet canals', afternoon: 'St. Mark\'s Basilica & Doge\'s Palace', evening: 'Dinner at Da Ivo with Aperol spritz', icon: '🚤' },
        { day: 2, theme: 'Floating City', morning: 'Murano glass-blowing demonstration', afternoon: 'Burano island — the colorful houses', evening: 'Sunset Prosecco on the Rialto Bridge', icon: '🏡' },
        { day: 3, theme: 'Cinque Terre', morning: 'Train to Cinque Terre', afternoon: 'Hike between the five villages', evening: 'Seafood dinner with a cliffside view', icon: '🌊' },
      ],
      friends: [
        { day: 1, theme: 'Rome Squad Day', morning: 'Colosseum & Roman Forum', afternoon: 'Trastevere street food tour', evening: 'Bar crawl in Pigneto neighborhood', icon: '🍕' },
        { day: 2, theme: 'Day Trip to Naples', morning: 'Train to Naples', afternoon: 'Real Neapolitan pizza at Da Michele', evening: 'Return — Aperol spritz night in Rome', icon: '🍕' },
        { day: 3, theme: 'Amalfi Adventure', morning: 'Drive the Amalfi Coast', afternoon: 'Swimming off the rocks in Positano', evening: 'Beach club sunset party', icon: '🌊' },
      ],
      family: [
        { day: 1, theme: 'Rome for Kids', morning: 'Colosseum gladiator tour (kid-friendly guide)', afternoon: 'Gelato route through the historic center', evening: 'Pizza making class for the family', icon: '🗡️' },
        { day: 2, theme: 'Vatican Wonders', morning: 'Vatican Museums — mummies, maps, and Raphael', afternoon: 'Piazza Navona — street performers and fountains', evening: 'Pasta dinner in a family trattoria', icon: '🙏' },
        { day: 3, theme: 'Lake Escape', morning: 'Drive to Lake Garda', afternoon: 'Gardaland theme park (Italy\'s Disney)', evening: 'Lakeside pizza and gelato', icon: '🎡' },
      ],
    },
    aiInsight: {
      solo:    'Italy rewards the solo traveler who moves slowly. Order a carafe of house wine in Florence, sketch the Colosseum at dawn in Rome, take a slow train through Tuscany — Italy\'s beauty is best when unhurried and yours alone.',
      couple:  'Italy didn\'t invent love, but it perfected the setting. Venice, Verona, the Amalfi Coast, the Tuscan hills at harvest time — every backdrop in Italy was made for two people who want to be overwhelmed together.',
      friends: 'An Italian friend group trip is a masterclass in joy. Aperitivo culture means you order a $5 drink and get a free buffet. Group cooking classes. Long lunches. Noisy trattorias. The Italians understand that the best meals take three hours and end in argument about who ate the most.',
      family:  'Italians famously adore children — bambini get preferential treatment in restaurants, special attention in shops, and genuine affection from strangers. The history is alive and interactive, and the food is so good that even picky children find something to love.',
    },
    mapCenter: { lat: 41.9028, lng: 12.4964 },
  },

  {
    id: 'morocco',
    name: 'Morocco',
    flag: '🇲🇦',
    heroImage: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=600&q=80',
    taglines: {
      solo:    'Lose yourself in the medinas',
      couple:  'A thousand and one nights of romance',
      friends: 'Desert adventures you\'ll talk about forever',
      family:  'A sensory world that opens young minds',
    },
    weather: { temp: '20–32°C', condition: 'Warm & Sunny', icon: '🌞' },
    matchPercentage: 74,
    description: 'Labyrinthine medinas, Sahara dunes, blue cities, and the warmest hospitality.',
    currency: 'MAD Dirham',
    language: 'Arabic/French',
    timezone: 'UTC+1',
    positives: {
      solo:    ['Very affordable', 'Fascinating cultural exploration', 'Excellent riads', 'Sahara desert experience', 'Unique medina labyrinth walking'],
      couple:  ['Romantic riad stays', 'Sahara sunset together', 'Hammam spa for two', 'Blue city of Chefchaouen', 'Intimate rooftop dinners'],
      friends: ['Camel trekking in the Sahara', 'Group riad villa rentals', 'Quad biking in dunes', 'Night camping under stars', 'Medina market treasure hunting'],
      family:  ['Fascinating spice markets', 'Camel rides for kids', 'Friendly local families', 'Affordable luxury', 'Snake charmers in Djemaa el-Fna'],
    },
    negatives: {
      solo:    ['Solo women face more attention', 'Persistent touts in medinas', 'Haggling exhausting'],
      couple:  ['Public displays of affection frowned upon', 'Hot summers', 'Some sites far from cities'],
      friends: ['Desert camps fill up fast in winter', 'Alcohol limited outside tourist areas', 'Long bus journeys between cities'],
      family:  ['Heat can overwhelm young children', 'Medina labyrinth hard with strollers', 'Some food too spicy for kids'],
    },
    hotels: [
      { id: 'h1', name: 'La Mamounia Marrakech', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 4.9, price: '$450/night', priceLevel: 'luxury', address: 'Avenue Bab Jdid, Marrakech', amenities: ['Pool', 'Hammam Spa', 'Gardens', 'Churchill\'s Bar'], description: 'Winston Churchill called it the most beautiful place in the world. A palace surrounded by olive groves.', squadTags: ['couple', 'solo'] },
      { id: 'h2', name: 'Dar Ahlam Desert Camp', image: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=600&q=80', rating: 5.0, price: '$600/night', priceLevel: 'luxury', address: 'Sahara Desert, Skoura', amenities: ['Private Tents', 'Star Gazing', 'Camel Trek', 'Gourmet Camp Dining'], description: 'Luxury Sahara camp with astronomers, private guides, and meals under the Milky Way. Unforgettable.', squadTags: ['couple', 'friends', 'solo'] },
      { id: 'h3', name: 'Riad Yasmine', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80', rating: 4.6, price: '$90/night', priceLevel: 'budget', address: 'Medina, Marrakech', amenities: ['Pool', 'Rooftop', 'Breakfast', 'Hammam'], description: 'Instagram-famous pink plunge pool riad in the heart of the medina. Excellent value.', squadTags: ['friends', 'couple', 'family'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Nomad Marrakech', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.7, cuisine: 'Contemporary Moroccan', description: 'Rooftop restaurant with views over the medina. Modern takes on tagine and couscous with natural wines.', price: '$35/person', priceLevel: 'mid-range', address: 'Derb Berima, Marrakech', tags: ['rooftop', 'views', 'modern'], squadTags: ['couple', 'friends', 'solo'] },
      { id: 'r2', name: 'Djemaa el-Fna Stalls', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.5, cuisine: 'Moroccan Street Food', description: 'The world\'s greatest outdoor dining experience. Hundreds of stalls at dusk serving harira, merguez, and snails.', price: '$5/person', priceLevel: 'budget', address: 'Djemaa el-Fna Square, Marrakech', tags: ['street-food', 'experience', 'authentic'], squadTags: ['friends', 'family', 'solo'] },
    ],
    activities: [
      { id: 'a1', name: 'Sahara Camel Trek & Camp', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80', description: 'Ride camels into the Erg Chebbi dunes, camp overnight, and watch the sunrise paint the sand pink.', duration: '2 days', rating: 5.0, price: '$150', category: 'Adventure', accentColor: 'from-amber-500 to-orange-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a2', name: 'Fes Medina Guided Walk', image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&q=80', description: 'Navigate the world\'s largest car-free urban area with a local guide. Medieval tanneries, spice souks, fountains.', duration: '4 hours', rating: 4.8, price: '$40', category: 'Culture', accentColor: 'from-teal-500 to-emerald-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a3', name: 'Chefchaouen Blue City', image: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=600&q=80', description: 'The blue-painted mountain city is impossibly photogenic. Every alley is a perfect photo.', duration: 'Full day', rating: 4.9, price: 'Free', category: 'Photography', accentColor: 'from-blue-500 to-indigo-600', squadTags: ['solo', 'couple', 'friends'] },
    ],
    events: [
      { id: 'e1', name: 'Marrakech International Film Festival', category: 'Film', date: 'Nov 29 – Dec 7', matchPercentage: 80, description: 'Red carpet events and screenings in the Palais des Congrès.', squadTags: ['couple', 'solo'] },
      { id: 'e2', name: 'Fes Festival of World Sacred Music', category: 'Music', date: 'Jun 14–22', matchPercentage: 85, description: 'World music festival in an ancient walled medina setting.', squadTags: ['solo', 'couple', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Marrakech Arrival', morning: 'Get lost in the medina (intentionally)', afternoon: 'Bahia Palace & Saadian Tombs', evening: 'Rooftop dinner watching the square come alive', icon: '🕌' },
        { day: 2, theme: 'Blue City', morning: 'Day trip to Chefchaouen', afternoon: 'Wander the blue alleys and medina', evening: 'Stay in Chefchaouen riad overnight', icon: '💙' },
        { day: 3, theme: 'Sahara Journey', morning: 'Drive to Merzouga desert', afternoon: 'Camel trek into the dunes', evening: 'Camp under the Milky Way', icon: '🐪' },
      ],
      couple: [
        { day: 1, theme: 'Marrakech Magic', morning: 'Majorelle Garden & Yves Saint Laurent Museum', afternoon: 'Couples hammam & massage at the riad', evening: 'Private rooftop dinner under the stars', icon: '🌺' },
        { day: 2, theme: 'Atlas Day Trip', morning: 'Drive through the Atlas Mountains to Aït Benhaddou', afternoon: 'Explore the UNESCO-listed ancient ksar', evening: 'Return for sunset cocktails at La Mamounia', icon: '⛰️' },
        { day: 3, theme: 'Sahara Romance', morning: 'Arrive at Sahara camp', afternoon: 'Dune sunset with champagne', evening: 'Private Berber dinner under the stars', icon: '✨' },
      ],
      friends: [
        { day: 1, theme: 'Marrakech Chaos', morning: 'Medina treasure hunt (guided)', afternoon: 'Hammam followed by mint tea in the souk', evening: 'Djemaa el-Fna feast + storytellers + music', icon: '🎭' },
        { day: 2, theme: 'Desert Adventure', morning: 'Drive to Sahara via Aït Benhaddou', afternoon: 'Quad biking on the dunes', evening: 'Group camp with live Gnawa music', icon: '🏍️' },
        { day: 3, theme: 'Blue City Trip', morning: 'Chefchaouen group exploration', afternoon: 'Photography challenge through the medina', evening: 'Return to Marrakech for a last night celebration', icon: '📸' },
      ],
      family: [
        { day: 1, theme: 'Marrakech Senses', morning: 'Djemaa el-Fna — snake charmers, musicians', afternoon: 'Majorelle Garden — peacocks and exotic plants', evening: 'Family tagine dinner in the medina', icon: '🐍' },
        { day: 2, theme: 'Desert & Camels', morning: 'Drive south, stop at Aït Benhaddou', afternoon: 'Camel ride on the dunes (kids love it)', evening: 'Family camp with stories around the fire', icon: '🐪' },
        { day: 3, theme: 'Markets & Crafts', morning: 'Spice souk tour — smell every jar', afternoon: 'Pottery workshop — make your own bowl', evening: 'Last rooftop dinner, watch the medina at dusk', icon: '🎨' },
      ],
    },
    aiInsight: {
      solo:    'Morocco is the ultimate solo journey into otherness. The medinas of Fes and Marrakech reward explorers who get deliberately lost. The warmth of Moroccan hospitality — endless mint tea, conversations with strangers — creates connections that solo travelers treasure.',
      couple:  'A thousand and one nights isn\'t just a book title in Morocco — it\'s the promise of every riad. Sleeping under canvas in the Sahara, watching the sun set over the Atlas, taking a hammam together in a 14th-century bathhouse: these are experiences that become part of your story.',
      friends: 'Morocco with friends is controlled chaos at its most beautiful. The medina treasure hunt, the Sahara camp with live music, the impossibly cheap food, the quad bikes on dunes, the group riad with a shared plunge pool — every day generates stories that outlast the trip.',
      family:  'Children experience Morocco through pure wonder. The snake charmers in Djemaa el-Fna, the rainbow spice mounds in the souk, the camel ride at sunset, the call to prayer echoing through ancient walls — it\'s a living, breathing education in the world\'s diversity.',
    },
    mapCenter: { lat: 31.6295, lng: -7.9811 },
  },

  {
    id: 'greece',
    name: 'Greece',
    flag: '🇬🇷',
    heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80',
    taglines: {
      solo:    'Ancient stories and sun-bleached islands await',
      couple:  'Blue domes, sunsets and eternal romance',
      friends: 'Ouzo, beaches and memories for life',
      family:  'Myths, meze and Mediterranean magic',
    },
    weather: { temp: '20–30°C', condition: 'Sunny & Warm', icon: '☀️' },
    matchPercentage: 85,
    description: 'Whitewashed villages, volcanic beaches, ancient ruins, and legendary Mediterranean hospitality.',
    currency: '€ Euro',
    language: 'Greek',
    timezone: 'UTC+2',
    positives: {
      solo:    ['Safe and welcoming culture', 'Island hopping easy by ferry', 'Affordable accommodation', 'Rich history to explore alone', 'Vibrant café culture'],
      couple:  ['World-famous Santorini sunsets', 'Intimate cave hotels', 'Wine tasting in Santorini vineyards', 'Secluded cove beaches', 'Romantic seaside tavernas'],
      friends: ['Legendary Mykonos nightlife', 'Affordable island parties', 'Group villa rentals', 'Water sports and boat trips', 'Amazing street food and mezze'],
      family:  ['Very family-friendly culture', 'Calm shallow waters on many islands', 'Kids love ancient ruins', 'Affordable family tavernas', 'Safe and clean beaches'],
    },
    negatives: {
      solo:    ['Peak season very crowded', 'Some islands expensive', 'Ferry schedules can be unreliable'],
      couple:  ['Santorini extremely busy July–August', 'Accommodation prices high in summer', 'Mosquitoes at night'],
      friends: ['Mykonos nightlife very expensive', 'Transport between islands takes time', 'Accommodation books up fast'],
      family:  ['Sun very intense in July–August', 'Some ancient sites have no shade', 'Ferry travel long with young children'],
    },
    hotels: [
      { id: 'h1', name: 'Canaves Oia Epitome', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 5.0, price: '$900/night', priceLevel: 'luxury', address: 'Oia, Santorini', amenities: ['Infinity Pool', 'Cave Suites', 'Sunset Views', 'Fine Dining'], description: 'The most iconic cave hotel in Santorini, perched on the caldera with incomparable sunset views.', squadTags: ['couple'] },
      { id: 'h2', name: 'Mykonos Blu Resort', image: 'https://images.unsplash.com/photo-1551882547-ff40c4a49ce7?w=600&q=80', rating: 4.8, price: '$450/night', priceLevel: 'luxury', address: 'Psarou Beach, Mykonos', amenities: ['Beach Club', 'Pool', 'Spa', 'DJ Sets'], description: 'Elegant resort steps from Psarou Beach with a world-famous beach club and party scene.', squadTags: ['friends', 'couple'] },
      { id: 'h3', name: 'Athens Gate Hotel', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.6, price: '$120/night', priceLevel: 'mid-range', address: 'Syntagma, Athens', amenities: ['Rooftop Bar', 'Acropolis Views', 'Restaurant', 'City Center'], description: 'Boutique hotel in Athens with an iconic rooftop bar overlooking the Acropolis and Temple of Zeus.', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'h4', name: 'Creta Maris Beach Resort', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.7, price: '$200/night', priceLevel: 'mid-range', address: 'Hersonissos, Crete', amenities: ['Kids Club', 'Waterslides', 'Multiple Pools', 'Kids Activities'], description: 'All-inclusive family resort on Crete with dedicated kids club and calm shallow beach.', squadTags: ['family'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Selene Santorini', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.9, cuisine: 'Modern Greek', description: 'Santorini\'s finest restaurant showcasing local ingredients — fava, cherry tomatoes, white eggplant — with caldera views.', price: '$120/person', priceLevel: 'luxury', address: 'Pyrgos, Santorini', tags: ['romantic', 'fine-dining', 'views'], squadTags: ['couple', 'solo'] },
      { id: 'r2', name: 'Thanasis Taverna', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.7, cuisine: 'Traditional Greek', description: 'Athens\' most beloved souvlaki and kebab taverna since 1960s. Always a queue, always worth it.', price: '$12/person', priceLevel: 'budget', address: 'Monastiraki, Athens', tags: ['iconic', 'street-food', 'traditional'], squadTags: ['friends', 'family', 'solo'] },
      { id: 'r3', name: 'Nautilus Mykonos', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.6, cuisine: 'Seafood', description: 'Fresh daily catch on Little Venice waterfront. Octopus, sea urchin, grilled fish — as Greek as it gets.', price: '$50/person', priceLevel: 'mid-range', address: 'Little Venice, Mykonos', tags: ['seafood', 'waterfront', 'fresh'], squadTags: ['friends', 'couple'] },
    ],
    activities: [
      { id: 'a1', name: 'Acropolis Sunrise Visit', image: 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=600&q=80', description: 'Visit the Parthenon and ancient Acropolis at opening time before the crowds. One of humanity\'s greatest monuments.', duration: '3 hours', rating: 4.9, price: '$25', category: 'Culture', accentColor: 'from-amber-500 to-orange-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a2', name: 'Santorini Caldera Boat Tour', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80', description: 'Sail around the volcanic caldera, swim in hot springs, and watch the sunset from the water.', duration: 'Full day', rating: 5.0, price: '$90', category: 'Scenic', accentColor: 'from-blue-500 to-cyan-600', squadTags: ['couple', 'friends', 'family', 'solo'] },
      { id: 'a3', name: 'Mykonos Beach Clubs', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', description: 'Paradise Beach and Super Paradise Beach — world-class DJ sets, cocktails, and Mediterranean vibes.', duration: 'Full day', rating: 4.7, price: '$30+', category: 'Nightlife', accentColor: 'from-purple-500 to-pink-600', squadTags: ['friends'] },
      { id: 'a4', name: 'Crete Palace of Knossos', image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80', description: 'Europe\'s oldest city and birthplace of the Minoan civilization. Kids love the labyrinth legends.', duration: '3 hours', rating: 4.7, price: '$15', category: 'History', accentColor: 'from-yellow-500 to-amber-600', squadTags: ['family', 'solo', 'couple'] },
    ],
    events: [
      { id: 'e1', name: 'Athens Epidaurus Festival', category: 'Cultural', date: 'Jun–Aug', matchPercentage: 88, description: 'Ancient Greek theatre performed in the 2,400-year-old Epidaurus amphitheater. Extraordinary.', squadTags: ['couple', 'solo', 'friends'] },
      { id: 'e2', name: 'Mykonos Pride', category: 'Festival', date: 'Jun', matchPercentage: 85, description: 'One of Europe\'s most vibrant and welcoming Pride celebrations on the island.', squadTags: ['friends', 'solo'] },
      { id: 'e3', name: 'Greek Easter (Pascha)', category: 'Cultural', date: 'Apr (varies)', matchPercentage: 90, description: 'The most important Greek celebration — midnight services, fireworks, lamb feasts. Unforgettable.', squadTags: ['family', 'couple', 'solo', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Athens Ancient Core', morning: 'Acropolis at opening hour — Parthenon alone at dawn', afternoon: 'National Archaeological Museum', evening: 'Solo mezze at a Monastiraki wine bar', icon: '🏛️' },
        { day: 2, theme: 'Santorini Arrival', morning: 'Ferry to Santorini, settle in Oia', afternoon: 'Walk the caldera rim from Oia to Fira', evening: 'Sunset solo wine tasting at a vineyard', icon: '🍷' },
        { day: 3, theme: 'Island Exploration', morning: 'Rent a quad bike, explore hidden beaches', afternoon: 'Red Beach and Black Beach swim', evening: 'Fresh seafood dinner in Ammoudi Bay', icon: '🛵' },
      ],
      couple: [
        { day: 1, theme: 'Santorini Romance', morning: 'Check into cave hotel, caldera views', afternoon: 'Boat tour around the volcanic islands', evening: 'Dinner at Selene restaurant', icon: '💙' },
        { day: 2, theme: 'Island Day', morning: 'Oia village walk at dawn (before crowds)', afternoon: 'Private wine tasting at Santo Wines', evening: 'Watch Oia sunset — world\'s most romantic view', icon: '🌅' },
        { day: 3, theme: 'Athens Culture', morning: 'Ferry to Athens, Acropolis visit', afternoon: 'Plaka neighborhood stroll, souvenir shopping', evening: 'Rooftop dinner with Acropolis views at dusk', icon: '🏛️' },
      ],
      friends: [
        { day: 1, theme: 'Athens Party Start', morning: 'Acropolis morning, history done fast', afternoon: 'Monastiraki food market, cheap mezze feast', evening: 'Athens bar scene in Psiri neighborhood', icon: '🎉' },
        { day: 2, theme: 'Mykonos Island Life', morning: 'Ferry to Mykonos, beach club arrival', afternoon: 'Paradise Beach DJ sets and swimming', evening: 'Mykonos Town nightlife until dawn', icon: '🏖️' },
        { day: 3, theme: 'Recovery & Boat', morning: 'Late brunch, Little Venice waterfront', afternoon: 'Sailing trip around the island, snorkeling', evening: 'Farewell seafood dinner and cocktails', icon: '⛵' },
      ],
      family: [
        { day: 1, theme: 'Athens Family', morning: 'Acropolis with guided family tour', afternoon: 'Stavros Niarchos Cultural Center & park', evening: 'Family dinner in a traditional taverna', icon: '🏛️' },
        { day: 2, theme: 'Crete Adventure', morning: 'Fly/ferry to Crete, Knossos Palace tour', afternoon: 'Beach afternoon at Elafonissi (pink sand)', evening: 'Fresh grilled fish dinner by the sea', icon: '🏺' },
        { day: 3, theme: 'Beach Day', morning: 'Calm beach resort morning, waterslides', afternoon: 'Glass-bottom boat tour, spot fish below', evening: 'Kids choose dinner — souvlaki wins every time', icon: '🐠' },
      ],
    },
    aiInsight: {
      solo:    'Greece rewards the solo traveler who moves between worlds — from the intellectual weight of Athens to the breezy freedom of the islands. The ferry network makes island hopping natural, and Greek café culture makes sitting alone feel like an art form.',
      couple:  'Santorini exists for couples. The iconic blue-domed churches, the caldera at sunset, the cave hotels carved into volcanic rock — every element conspires to create an unforgettable romantic backdrop. It\'s as beautiful as every photograph promises, and more.',
      friends: 'Greece with friends is a masterpiece. Mykonos is unashamedly the party capital of the Mediterranean — world-class DJs, beach clubs at midday, waterfront cocktails at 3am. Athens provides the culture, Mykonos provides the chaos. Both are perfect.',
      family:  'Greece is brilliant for families — the calm azure waters of Crete, the legends of the Minotaur that bring history alive for children, the ice cream shops on every corner, and the genuinely child-loving Greek culture make every family feel like royalty here.',
    },
    mapCenter: { lat: 37.9838, lng: 23.7275 },
  },

  {
    id: 'spain',
    name: 'Spain',
    flag: '🇪🇸',
    heroImage: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&q=80',
    taglines: {
      solo:    'Live like a local in the most alive country on Earth',
      couple:  'Flamenco, tapas and endless Iberian romance',
      friends: 'The friend group trip that never ends',
      family:  'Sun, paella and Barcelona adventures',
    },
    weather: { temp: '18–30°C', condition: 'Sunny & Mediterranean', icon: '☀️' },
    matchPercentage: 86,
    description: 'Passionate culture, world-class food, golden beaches, and architectural masterpieces.',
    currency: '€ Euro',
    language: 'Spanish',
    timezone: 'UTC+1',
    positives: {
      solo:    ['Incredibly social culture', 'Excellent solo dining (tapas bars)', 'Great train network', 'Safe for solo travelers', 'Affordable tapas and wine'],
      couple:  ['Romantic flamenco shows', 'Stunning Alhambra palace', 'Gaudi architecture in Barcelona', 'Pintxos tours in San Sebastián', 'Golden sunsets on Costa del Sol'],
      friends: ['World-class nightlife (Barcelona, Ibiza, Madrid)', 'Affordable wine and cocktails', 'Group cooking classes', 'Football matches in Camp Nou', 'San Sebastián food tours'],
      family:  ['PortAventura World theme park', 'Great beaches with calm waters', 'Child-friendly culture', 'Affordable family restaurants', 'Fascinating Gaudi for curious kids'],
    },
    negatives: {
      solo:    ['Late night culture can be tiring', 'Summer heat intense', 'Pickpockets in tourist areas'],
      couple:  ['Very crowded in summer', 'Barcelona accommodation expensive', 'Language barrier outside cities'],
      friends: ['Ibiza very expensive', 'Nightlife starts very late', 'Heat in July/August extreme'],
      family:  ['Long drives between regions', 'Summer beaches very crowded', 'Iberian heat exhausting for young children'],
    },
    hotels: [
      { id: 'h1', name: 'Hotel Arts Barcelona', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 4.9, price: '$500/night', priceLevel: 'luxury', address: 'Barceloneta, Barcelona', amenities: ['Beach Club', 'Infinity Pool', 'Michelin Spa', 'City & Sea Views'], description: 'Iconic tower hotel on the Barcelona beachfront with a world-famous rooftop pool overlooking the Mediterranean.', squadTags: ['couple', 'friends'] },
      { id: 'h2', name: 'Parador de Granada', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80', rating: 4.8, price: '$280/night', priceLevel: 'luxury', address: 'Alhambra, Granada', amenities: ['Historic Palace', 'Garden', 'Flamenco', 'Andalusian Cuisine'], description: 'Sleep inside the Alhambra complex itself — a 15th-century convent converted into a magnificent parador.', squadTags: ['couple', 'solo'] },
      { id: 'h3', name: 'Chic & Basic Born', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$80/night', priceLevel: 'budget', address: 'El Born, Barcelona', amenities: ['Rooftop Terrace', 'Design Hotel', 'Central Location', 'Bar'], description: 'Stylish budget-friendly hotel in Barcelona\'s coolest neighborhood, steps from Gothic Quarter and La Boqueria.', squadTags: ['friends', 'solo'] },
      { id: 'h4', name: 'Hotel Mas Ses Vinyes', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.6, price: '$160/night', priceLevel: 'mid-range', address: 'Costa Daurada, Catalonia', amenities: ['Pool', 'Kids Club', 'Near PortAventura', 'Gardens'], description: 'Family resort near PortAventura theme park with pools, kids activities, and calm Mediterranean beach access.', squadTags: ['family'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Tickets Barcelona', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 5.0, cuisine: 'Creative Tapas', description: 'Albert Adrià\'s legendary tapas bar where every bite is a miniature work of art. Book 2 months ahead.', price: '$90/person', priceLevel: 'luxury', address: 'El Poble Sec, Barcelona', tags: ['creative', 'michelin', 'tapas'], squadTags: ['couple', 'friends', 'solo'] },
      { id: 'r2', name: 'Bar El Xampanyet', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.7, cuisine: 'Traditional Tapas', description: 'Barcelona\'s most beloved traditional tapas bar since 1929. House cava, anchovies, and a perfect bar atmosphere.', price: '$20/person', priceLevel: 'budget', address: 'El Born, Barcelona', tags: ['traditional', 'cava', 'historic'], squadTags: ['friends', 'solo', 'couple'] },
      { id: 'r3', name: 'La Mar Salada', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.6, cuisine: 'Seafood & Paella', description: 'Exceptional seafood paella overlooking the beach. The black rice with squid ink is extraordinary.', price: '$45/person', priceLevel: 'mid-range', address: 'Barceloneta, Barcelona', tags: ['seafood', 'paella', 'beach-view'], squadTags: ['family', 'friends', 'couple'] },
    ],
    activities: [
      { id: 'a1', name: 'Sagrada Família Visit', image: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=600&q=80', description: 'Gaudí\'s unfinished masterpiece — the most visited monument in Spain and one of the world\'s greatest buildings.', duration: '3 hours', rating: 5.0, price: '$30', category: 'Culture', accentColor: 'from-amber-500 to-orange-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a2', name: 'Alhambra Palace Granada', image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&q=80', description: 'The most exquisite Moorish palace in the world. Intricate tile work, garden courtyards, and mountain views.', duration: '4 hours', rating: 5.0, price: '$18', category: 'History', accentColor: 'from-teal-500 to-emerald-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a3', name: 'Flamenco Show Seville', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80', description: 'Authentic flamenco in a traditional tablao — raw emotion, stamping feet, and guitar in a 19th-century tavern.', duration: '2 hours', rating: 4.9, price: '$40', category: 'Culture', accentColor: 'from-red-500 to-rose-600', squadTags: ['couple', 'friends', 'solo', 'family'] },
      { id: 'a4', name: 'Ibiza Beach Clubs', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', description: 'Nikki Beach, Ushuaïa, Amnesia — the greatest DJ lineup in the world on the most electric island.', duration: 'Full day', rating: 4.8, price: '$50+', category: 'Nightlife', accentColor: 'from-purple-500 to-violet-600', squadTags: ['friends'] },
      { id: 'a5', name: 'PortAventura World', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80', description: 'Spain\'s biggest theme park with Dragon Khan roller coaster and Ferrari Land next door.', duration: 'Full day', rating: 4.7, price: '$60', category: 'Adventure', accentColor: 'from-yellow-500 to-orange-600', squadTags: ['family', 'friends'] },
    ],
    events: [
      { id: 'e1', name: 'La Tomatina', category: 'Festival', date: 'Aug 28', matchPercentage: 91, description: 'The world\'s biggest food fight — 40,000 people hurling 150,000 tomatoes in Buñol. Legendary.', squadTags: ['friends'] },
      { id: 'e2', name: 'San Fermín Running of the Bulls', category: 'Festival', date: 'Jul 6–14', matchPercentage: 88, description: 'Pamplona\'s iconic week-long festival with bull runs, music, and parties through the night.', squadTags: ['friends', 'solo'] },
      { id: 'e3', name: 'Feria de Abril Seville', category: 'Cultural', date: 'Apr (varies)', matchPercentage: 92, description: 'Flamenco dresses, horse parades, and casetas serving manzanilla — Seville\'s magical spring fair.', squadTags: ['couple', 'friends', 'family', 'solo'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Barcelona Discovery', morning: 'Sagrada Família and Park Güell', afternoon: 'La Boqueria market food tour', evening: 'Solo tapas crawl in El Born neighborhood', icon: '🏗️' },
        { day: 2, theme: 'Gothic & Modern', morning: 'Gothic Quarter exploration at dawn', afternoon: 'Picasso Museum', evening: 'Bar El Xampanyet cava and anchovies', icon: '🎨' },
        { day: 3, theme: 'Day Trip', morning: 'Train to Montserrat monastery', afternoon: 'Hike the mountain trails', evening: 'Return to Barcelona — wine bar in Eixample', icon: '⛰️' },
      ],
      couple: [
        { day: 1, theme: 'Granada Romance', morning: 'Alhambra Palace at opening (pre-booked)', afternoon: 'Generalife gardens, Nasrid Palaces', evening: 'Flamenco show in the Sacromonte caves', icon: '🌹' },
        { day: 2, theme: 'Seville Magic', morning: 'Train to Seville, Real Alcázar palace', afternoon: 'Tapas in Triana, walk along the river', evening: 'Rooftop cocktails with Giralda tower views', icon: '🎭' },
        { day: 3, theme: 'Barcelona Together', morning: 'Sagrada Família morning visit', afternoon: 'Picnic at Park Güell with views', evening: 'Fine dining at Tickets or beachfront dinner', icon: '🏗️' },
      ],
      friends: [
        { day: 1, theme: 'Barcelona Culture & Food', morning: 'Sagrada Família quick visit', afternoon: 'La Boqueria market, street food feast', evening: 'Bar crawl through El Born and Barceloneta', icon: '🍻' },
        { day: 2, theme: 'Ibiza Day Trip', morning: 'Fly or ferry to Ibiza', afternoon: 'Beach clubs from noon (Ushuaïa)', evening: 'Amnesia or Pacha nightclub until 6am', icon: '🎧' },
        { day: 3, theme: 'Recovery Beach Day', morning: 'Late start, Barceloneta beach', afternoon: 'Group paella lunch by the sea', evening: 'Vermouth and tapas at sunset — perfect ending', icon: '🥘' },
      ],
      family: [
        { day: 1, theme: 'Barcelona Icons', morning: 'Sagrada Família (kids love the towers)', afternoon: 'Park Güell mosaic terrace and views', evening: 'Beachfront dinner at Barceloneta', icon: '🏗️' },
        { day: 2, theme: 'Theme Park Day', morning: 'PortAventura World — open at gates', afternoon: 'Ferrari Land next door', evening: 'Tired but happy — hotel pool time', icon: '🎡' },
        { day: 3, theme: 'Beach & Culture', morning: 'Camp Nou stadium tour (football mad kids)', afternoon: 'Barceloneta beach afternoon swim', evening: 'La Boqueria dinner — let kids pick from the stalls', icon: '⚽' },
      ],
    },
    aiInsight: {
      solo:    'Spain is built for social solo travelers. Tapas bars are designed to be visited alone — you stand, you order small plates, you talk to strangers. The Spanish culture of communal eating makes solitude impossible here, and that\'s entirely the point.',
      couple:  'The Alhambra in Granada, a flamenco performance in Seville\'s caves, a shared paella on the Barcelona beachfront — Spain delivers romance through passion, not cliché. The architecture, the food, the music, the people: all of it conspires to make couples feel intensely alive.',
      friends: 'Spain is the friend group\'s paradise. Barcelona has beach AND nightlife. Ibiza is Ibiza. San Sebastián has the best pintxos bars in Europe. La Tomatina exists. If your group needs convincing, show them any of the above and the argument is over.',
      family:  'Spain adores children and the culture shows it. Kids eat free, play late, and see magnificent things — Gaudí\'s dragon staircases, Roman amphitheaters, the sheer chaos of La Boqueria market. PortAventura seals the deal for any family hesitating.',
    },
    mapCenter: { lat: 40.4168, lng: -3.7038 },
  },

  {
    id: 'dubai',
    name: 'Dubai',
    flag: '🇦🇪',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    taglines: {
      solo:    'The future arrived early — and it\'s spectacular',
      couple:  'Luxury beyond imagination, together',
      friends: 'The most extravagant group trip on Earth',
      family:  'Thrills, wonders and no limits',
    },
    weather: { temp: '20–35°C', condition: 'Sunny & Arid', icon: '🌞' },
    matchPercentage: 80,
    description: 'Ultra-modern skyline, desert adventures, world-record attractions, and five-star everything.',
    currency: 'AED Dirham',
    language: 'Arabic/English',
    timezone: 'UTC+4',
    positives: {
      solo:    ['Extremely safe city', 'World-class malls and attractions', 'Tax-free shopping', 'Efficient metro system', 'English spoken everywhere'],
      couple:  ['Ultra-luxury hotels and resorts', 'Romantic desert dinners', 'Private beach clubs', 'Helicopter tours of the skyline', 'Burj Khalifa sunset views'],
      friends: ['Amazing brunch culture', 'Ski Dubai indoor slopes', 'Supercar rentals', 'Yacht charters', 'Wild Wadi and Atlantis waterparks'],
      family:  ['IMG Worlds of Adventure', 'Legoland Dubai', 'Dubai Aquarium', 'Very safe environment', 'KidZania education park'],
    },
    negatives: {
      solo:    ['Very expensive', 'Strict cultural codes', 'Alcohol only in licensed venues'],
      couple:  ['Public displays of affection restricted', 'Extreme summer heat (June–Sep)', 'Very expensive for luxury travel'],
      friends: ['Alcohol laws restrict party culture', 'Summer months unbearably hot', 'Expensive by regional standards'],
      family:  ['Summer heat dangerous for young children', 'Everything is very expensive', 'Cultural restrictions to navigate'],
    },
    hotels: [
      { id: 'h1', name: 'Burj Al Arab Jumeirah', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 5.0, price: '$2000/night', priceLevel: 'luxury', address: 'Jumeirah Beach, Dubai', amenities: ['Private Beach', 'Helipad', 'Butler Service', '9 Restaurants'], description: 'The world\'s most recognizable luxury hotel, built on its own island. Truly the pinnacle of opulence.', squadTags: ['couple'] },
      { id: 'h2', name: 'Atlantis The Palm', image: 'https://images.unsplash.com/photo-1551882547-ff40c4a49ce7?w=600&q=80', rating: 4.8, price: '$500/night', priceLevel: 'luxury', address: 'Palm Jumeirah, Dubai', amenities: ['Aquaventure Waterpark', 'Aquarium', 'Kids Club', 'Private Beach'], description: 'The iconic Palm resort with the world\'s most thrilling waterpark and an enormous marine habitat.', squadTags: ['family', 'friends'] },
      { id: 'h3', name: 'Rove Downtown', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$120/night', priceLevel: 'mid-range', address: 'Downtown Dubai', amenities: ['Rooftop Pool', 'Gym', 'Burj Khalifa Walking Distance', 'Social Lounge'], description: 'Smart, design-forward hotel steps from the Burj Khalifa and Dubai Mall. Outstanding value in a prime location.', squadTags: ['solo', 'friends', 'couple'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Nobu Dubai', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.9, cuisine: 'Japanese-Peruvian', description: 'Nobu Matsuhisa\'s legendary fusion restaurant in Atlantis. Black cod miso here is the definitive version.', price: '$150/person', priceLevel: 'luxury', address: 'Atlantis The Palm, Dubai', tags: ['celebrity', 'fine-dining', 'fusion'], squadTags: ['couple', 'friends', 'solo'] },
      { id: 'r2', name: 'Al Fanar Restaurant', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.7, cuisine: 'Emirati', description: 'Authentic Emirati cuisine in a heritage setting — camel meat, luqaimat dessert, and fresh laban. A rare window into local culture.', price: '$35/person', priceLevel: 'mid-range', address: 'Festival City, Dubai', tags: ['authentic', 'local', 'cultural'], squadTags: ['solo', 'couple', 'family', 'friends'] },
      { id: 'r3', name: 'Shakespeare and Co.', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.5, cuisine: 'International', description: 'Whimsical Victorian-themed café chain beloved by Dubai families. Excellent brunch menu at a fraction of hotel prices.', price: '$25/person', priceLevel: 'mid-range', address: 'Multiple locations, Dubai', tags: ['family-friendly', 'brunch', 'whimsical'], squadTags: ['family', 'friends'] },
    ],
    activities: [
      { id: 'a1', name: 'Burj Khalifa At The Top', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', description: 'Visit the world\'s tallest building. The 124th floor observation deck offers 360° views of the city, desert, and sea.', duration: '2 hours', rating: 4.9, price: '$40', category: 'Landmark', accentColor: 'from-blue-500 to-cyan-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a2', name: 'Desert Safari & Camp', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80', description: 'Dune bashing, camel rides, sandboarding, and a Bedouin camp dinner under the desert stars with live entertainment.', duration: 'Full day', rating: 4.8, price: '$80', category: 'Adventure', accentColor: 'from-amber-500 to-orange-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a3', name: 'Dubai Mall & Fountain Show', image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&q=80', description: 'The world\'s largest mall + the world\'s largest dancing fountain show every evening. Staggering spectacle.', duration: '4 hours', rating: 4.7, price: 'Free', category: 'Shopping', accentColor: 'from-yellow-500 to-amber-600', squadTags: ['family', 'friends', 'couple', 'solo'] },
      { id: 'a4', name: 'Aquaventure Waterpark', image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&q=80', description: 'Atlantis\'s record-breaking waterpark with 105 rides, rapids, private beach, and an aquarium tunnel.', duration: 'Full day', rating: 4.9, price: '$90', category: 'Adventure', accentColor: 'from-blue-500 to-indigo-600', squadTags: ['family', 'friends'] },
    ],
    events: [
      { id: 'e1', name: 'Dubai Shopping Festival', category: 'Shopping', date: 'Jan–Feb', matchPercentage: 85, description: 'Massive citywide shopping festival with huge discounts, fireworks, raffles and live performances.', squadTags: ['friends', 'family', 'solo', 'couple'] },
      { id: 'e2', name: 'Dubai Food Festival', category: 'Food', date: 'Feb–Mar', matchPercentage: 88, description: 'City-wide culinary event celebrating Dubai\'s extraordinary dining scene with special menus and pop-ups.', squadTags: ['couple', 'friends', 'solo'] },
      { id: 'e3', name: 'New Year\'s Eve at Burj Khalifa', category: 'Celebration', date: 'Dec 31', matchPercentage: 97, description: 'The world\'s most spectacular New Year\'s countdown with the tallest fireworks display on Earth.', squadTags: ['friends', 'couple', 'family', 'solo'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Modern Dubai', morning: 'Burj Khalifa observation deck', afternoon: 'Dubai Mall, indoor ice rink, aquarium', evening: 'Dubai Fountain show at dusk, solo dinner at Al Fanar', icon: '🏙️' },
        { day: 2, theme: 'Desert & Heritage', morning: 'Old Dubai — spice souk and gold souk', afternoon: 'Dubai Museum and Al Fahidi heritage district', evening: 'Desert safari and Bedouin camp dinner', icon: '🐪' },
        { day: 3, theme: 'Modern Extremes', morning: 'Ski Dubai indoor slopes', afternoon: 'Palm Jumeirah monorail and The View at The Palm', evening: 'Sunset rooftop bar, tax-free shopping', icon: '🎿' },
      ],
      couple: [
        { day: 1, theme: 'Arrival & Luxury', morning: 'Check into iconic hotel, beach time', afternoon: 'Dubai Mall, afternoon tea at Burj Al Arab', evening: 'Burj Khalifa sunset + Dubai Fountain', icon: '✨' },
        { day: 2, theme: 'Desert Romance', morning: 'Private helicopter tour of the skyline', afternoon: 'Desert safari, private dune dinner', evening: 'Bedouin camp, stargazing in the Arabian Desert', icon: '🌟' },
        { day: 3, theme: 'Beach & Indulgence', morning: 'Private beach club morning', afternoon: 'Couples spa at a 5-star hotel', evening: 'Nobu dinner — sunset over the Palm', icon: '🌅' },
      ],
      friends: [
        { day: 1, theme: 'Dubai Icons', morning: 'Burj Khalifa + Dubai Frame', afternoon: 'Dubai Mall — Virtual Reality Park & Aquarium', evening: 'Rooftop bar crawl — Zero Gravity, Barasti Beach', icon: '🏗️' },
        { day: 2, theme: 'Aquaventure Day', morning: 'Atlantis Aquaventure waterpark all day', afternoon: 'Private beach at Atlantis', evening: 'Nobu dinner, then yacht party or club', icon: '💦' },
        { day: 3, theme: 'Desert & Shopping', morning: 'Group desert safari — dune bashing', afternoon: 'Dubai Mall tax-free luxury shopping', evening: 'Brunch at Saffron (Atlantis famous brunch)', icon: '🏎️' },
      ],
      family: [
        { day: 1, theme: 'Dubai Wonders', morning: 'Burj Khalifa — kids love the elevator speed', afternoon: 'Dubai Aquarium & Underwater Zoo', evening: 'Dubai Fountain show + dinner in Dubai Mall', icon: '🏙️' },
        { day: 2, theme: 'Theme Park Day', morning: 'IMG Worlds of Adventure (Marvel, Cartoon Network)', afternoon: 'More rides, Legoland preview', evening: 'Pool evening at hotel, exhausted but happy', icon: '🎡' },
        { day: 3, theme: 'Water & Desert', morning: 'Aquaventure Waterpark', afternoon: 'Afternoon desert safari — camel rides for kids', evening: 'Al Fanar Emirati dinner — kids try local food', icon: '🐫' },
      ],
    },
    aiInsight: {
      solo:    'Dubai rewards solo travelers with sheer spectacle and convenience. English is universal, the metro is world-class, everything is signposted, and the city is extraordinarily safe. The desert heritage sits quietly beneath the glass towers — finding it is the solo traveler\'s reward.',
      couple:  'Dubai stages luxury romance on an almost theatrical scale. Helicopter rides over the Palm, private beach dinners under the stars, suites in the Burj Al Arab — it\'s designed to impress at every turn. If you want a trip that feels entirely extraordinary, this is it.',
      friends: 'Dubai for friend groups is an arms race of experience. The brunches are legendary — 5-star hotel buffets with free-flow for 4 hours. The waterparks are world-record holders. The rooftop bars are vertical. The desert safaris are adrenaline. It competes with itself constantly.',
      family:  'Dubai has quietly become one of the world\'s best family destinations. IMG Worlds, Legoland, KidZania, Aquaventure, the Dubai Aquarium — every attraction is world-class and engineered for families. The city is safe, clean, and entirely set up to make children feel like the main characters.',
    },
    mapCenter: { lat: 25.2048, lng: 55.2708 },
  },

  {
    id: 'vietnam',
    name: 'Vietnam',
    flag: '🇻🇳',
    heroImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80',
    taglines: {
      solo:    'A thousand kilometers of wonder at your own pace',
      couple:  'Ancient lanterns, emerald bays, and just the two of you',
      friends: 'The best budget adventure on the planet',
      family:  'History, nature and the freshest food on Earth',
    },
    weather: { temp: '22–32°C', condition: 'Tropical', icon: '🌤️' },
    matchPercentage: 83,
    description: 'Emerald rice terraces, ancient towns, dramatic karst bays, and the world\'s best street food.',
    currency: 'VND Dong',
    language: 'Vietnamese',
    timezone: 'UTC+7',
    positives: {
      solo:    ['One of Asia\'s best solo destinations', 'Extremely affordable', 'Easy north-south train journey', 'Very safe for solo travelers', 'Incredible local food culture'],
      couple:  ['Hoi An romantic lantern-lit old town', 'Ha Long Bay private cruise', 'Quieter beaches than Thailand', 'Affordable private villa rentals', 'Beautiful countryside cycling'],
      friends: ['Insanely affordable everything', 'Motorbike road trips', 'Night market street food', 'Group cooking classes in Hoi An', 'Pub street in Hanoi and Hoi An'],
      family:  ['Very child-friendly culture', 'Fascinating history for older kids', 'Safe and gentle countryside', 'UNESCO World Heritage sites', 'Affordable luxury resorts'],
    },
    negatives: {
      solo:    ['Persistent touts in tourist areas', 'Traffic chaotic in Hanoi and HCMC', 'Scams around major tourist sites'],
      couple:  ['Rainy season flooding in some areas', 'Some beaches crowded', 'Long distances between highlights'],
      friends: ['Motorbike rental risks', 'Food safety variable at street stalls', 'Alcohol culture lower-key than elsewhere'],
      family:  ['Long journey between north and south', 'Heat can be intense', 'Some historical sites distressing for young children'],
    },
    hotels: [
      { id: 'h1', name: 'Four Seasons Nam Hai', image: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=600&q=80', rating: 5.0, price: '$700/night', priceLevel: 'luxury', address: 'Ha My Beach, Hoi An', amenities: ['Private Pool Villas', 'Spa', 'Cooking School', 'Beach Club'], description: 'Vietnam\'s finest resort — 100 private pool villas on a secluded beach 10 minutes from Hoi An Ancient Town.', squadTags: ['couple'] },
      { id: 'h2', name: 'Hanoi La Siesta', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 4.7, price: '$85/night', priceLevel: 'mid-range', address: 'Old Quarter, Hanoi', amenities: ['Rooftop Pool', 'Spa', 'Restaurant', 'City Views'], description: 'Beautiful boutique hotel in the heart of Hanoi\'s Old Quarter with rooftop pool overlooking the ancient streets.', squadTags: ['couple', 'solo'] },
      { id: 'h3', name: 'Hoi An Backpackers', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$15/night', priceLevel: 'budget', address: 'Hoi An Ancient Town', amenities: ['Pool', 'Free Bikes', 'Social Events', 'Bar'], description: 'Social party hostel in Hoi An with free bicycles, pool parties, and the legendary weekly pub quiz.', squadTags: ['friends', 'solo'] },
      { id: 'h4', name: 'Vinpearl Nha Trang', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.6, price: '$180/night', priceLevel: 'mid-range', address: 'Nha Trang Island', amenities: ['Waterpark', 'Kids Club', 'Private Island', 'Multiple Pools'], description: 'Private island family resort accessible only by cable car, with a dedicated waterpark and kids club.', squadTags: ['family'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Madam Hiên Hanoi', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.8, cuisine: 'Traditional Vietnamese', description: 'Award-winning restaurant serving perfectly executed Vietnamese classics in a beautiful French colonial setting. The pho is transcendent.', price: '$25/person', priceLevel: 'mid-range', address: 'Hoan Kiem, Hanoi', tags: ['traditional', 'award-winning', 'colonial'], squadTags: ['couple', 'solo', 'friends'] },
      { id: 'r2', name: 'Bún Bò Huế Mệ Rơi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.7, cuisine: 'Vietnamese Street Food', description: 'The definitive version of Vietnam\'s most complex noodle soup — lemongrass, shrimp paste, pork knuckle. Life-changing at $2.', price: '$2/person', priceLevel: 'budget', address: 'Hue, Central Vietnam', tags: ['street-food', 'iconic', 'authentic'], squadTags: ['friends', 'solo', 'family'] },
      { id: 'r3', name: 'Morning Glory Hoi An', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.7, cuisine: 'Hoi An Street Food', description: 'Hoi An\'s most beloved restaurant serving regional specialties — cao lầu, white rose dumplings, banh mi. Essential.', price: '$15/person', priceLevel: 'budget', address: 'Hoi An Ancient Town', tags: ['regional', 'must-try', 'authentic'], squadTags: ['family', 'friends', 'couple', 'solo'] },
    ],
    activities: [
      { id: 'a1', name: 'Ha Long Bay Cruise', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80', description: 'Overnight cruise through 2,000 limestone islands rising from emerald water. UNESCO World Heritage Site. Genuinely awe-inspiring.', duration: '2 days', rating: 5.0, price: '$120', category: 'Nature', accentColor: 'from-teal-500 to-cyan-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a2', name: 'Hoi An Lantern Festival', image: 'https://images.unsplash.com/photo-1540541338537-71e1d30f5e9f?w=600&q=80', description: 'Every full moon, Hoi An switches off its lights and floats thousands of lanterns on the river. Magical beyond words.', duration: '3 hours', rating: 5.0, price: 'Free', category: 'Cultural', accentColor: 'from-orange-500 to-amber-600', squadTags: ['couple', 'solo', 'friends', 'family'] },
      { id: 'a3', name: 'Hoi An Cooking Class', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', description: 'Visit the morning market, pick fresh ingredients, and cook pho, spring rolls, and banh xeo with a local chef.', duration: '4 hours', rating: 4.9, price: '$35', category: 'Food', accentColor: 'from-green-500 to-emerald-600', squadTags: ['friends', 'couple', 'family', 'solo'] },
      { id: 'a4', name: 'Motorbike Ha Giang Loop', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', description: 'The most spectacular motorbike route in Asia — 4 days through rice terraces, mountain passes, and ethnic minority villages.', duration: '4 days', rating: 5.0, price: '$60', category: 'Adventure', accentColor: 'from-red-500 to-rose-600', squadTags: ['friends', 'solo'] },
    ],
    events: [
      { id: 'e1', name: 'Tết Lunar New Year', category: 'Cultural', date: 'Jan/Feb (varies)', matchPercentage: 94, description: 'Vietnam\'s biggest celebration — fireworks, flower markets, family feasts, and temple visits across the country.', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'e2', name: 'Hoi An Full Moon Lantern Festival', category: 'Cultural', date: 'Monthly', matchPercentage: 97, description: 'Monthly lantern festival when the ancient town goes dark and glows with candlelit paper lanterns on the river.', squadTags: ['couple', 'solo', 'friends', 'family'] },
      { id: 'e3', name: 'Hue Festival', category: 'Cultural', date: 'Apr/May (even years)', matchPercentage: 82, description: 'Biennial arts and cultural festival in the imperial city of Hue, with royal ceremonies and traditional performances.', squadTags: ['solo', 'couple', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Hanoi Old Quarter', morning: 'Hoan Kiem Lake at dawn, Ngoc Son Temple', afternoon: 'Old Quarter walking tour — 36 ancient streets', evening: 'Bia hoi corner — $0.25 draft beer with locals', icon: '🛵' },
        { day: 2, theme: 'Ha Long Bay', morning: 'Bus to Ha Long, board cruise ship', afternoon: 'Kayaking through limestone caves', evening: 'Sunset cocktail on the deck, seafood dinner', icon: '🚢' },
        { day: 3, theme: 'Hoi An Ancient Town', morning: 'Fly to Da Nang, cycle into Hoi An', afternoon: 'Ancient Town walking tour, lantern shopping', evening: 'Full Moon Lantern Festival on the Thu Bon River', icon: '🏮' },
      ],
      couple: [
        { day: 1, theme: 'Hanoi Charm', morning: 'Temple of Literature at dawn', afternoon: 'Old Quarter exploration and silk shopping', evening: 'Fine dining at Madam Hiên, evening walk', icon: '🌸' },
        { day: 2, theme: 'Ha Long Romance', morning: 'Private cruise boarding, champagne welcome', afternoon: 'Kayaking through hidden caves together', evening: 'Sunset tai chi on deck, private seafood dinner', icon: '🌅' },
        { day: 3, theme: 'Hoi An Together', morning: 'Cooking class — learn Vietnamese cuisine', afternoon: 'Cycle through rice fields to a secret beach', evening: 'Lantern release on the river at dusk', icon: '🏮' },
      ],
      friends: [
        { day: 1, theme: 'Hanoi Street Food', morning: 'Bun cha breakfast like Obama had here', afternoon: 'Old Quarter scooter tour', evening: 'Bia hoi corner — cheapest fun in Asia', icon: '🍜' },
        { day: 2, theme: 'Ha Long Adventure', morning: 'Ha Long Bay party cruise', afternoon: 'Cliff jumping, kayaking, swimming', evening: 'Boat party deck with cocktails and music', icon: '🏄' },
        { day: 3, theme: 'Hoi An Vibes', morning: 'Motorbike to My Son ruins', afternoon: 'Cooking class with group', evening: 'Hoi An pub street — bar crawl through the old town', icon: '🛵' },
      ],
      family: [
        { day: 1, theme: 'Hanoi Discovery', morning: 'Ho Chi Minh Mausoleum and Museum', afternoon: 'Vietnam Museum of Ethnology — hands-on for kids', evening: 'Hoan Kiem lake evening walk, street food', icon: '🏛️' },
        { day: 2, theme: 'Ha Long Bay', morning: 'Board family cruise, cabin settling', afternoon: 'Cave exploration, fishing off the boat', evening: 'Kids cook spring rolls with the ship\'s chef', icon: '🐉' },
        { day: 3, theme: 'Hoi An Family Day', morning: 'Lantern-making workshop for kids', afternoon: 'Cycle through the countryside to the rice fields', evening: 'Lantern release on the river — kids remember this forever', icon: '🏮' },
      ],
    },
    aiInsight: {
      solo:    'Vietnam is a solo traveler\'s masterpiece. The north-south train journey is one of Asia\'s great rail experiences. The bia hoi culture of Hanoi — street corner plastic chairs, 25-cent beers, instant friendships — exists nowhere else. Travel here slowly and everything reveals itself.',
      couple:  'Vietnam offers rare romantic moments that feel genuinely undiscovered. The Hoi An lantern festival at full moon, a private Ha Long Bay cruise through morning mist, cycling to a secret beach — these aren\'t Instagram constructs, they\'re real. Vietnam for couples is quietly extraordinary.',
      friends: 'Vietnam is the benchmark budget group trip. Ha Long Bay party boats. Motorbike loops through the mountains. Street food for $1 per meal. Cooking classes in Hoi An. The Ha Giang Loop. Pub Street. At $40/day everything included, it\'s the trip that ruins other trips.',
      family:  'Vietnam is endlessly fascinating for children — the lantern festivals, the Ha Long karsts, the street food variety, the friendly locals, the living history. The country rewards curious young minds and produces memories that last a lifetime. Costs are low enough that splurging on quality experiences is easy.',
    },
    mapCenter: { lat: 21.0285, lng: 105.8542 },
  },

  {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    heroImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
    taglines: {
      solo:    'The journey that changes you forever',
      couple:  'The Taj Mahal, Rajasthan, and a love story',
      friends: 'Colors, chaos, and the greatest adventure',
      family:  'Wildlife, palaces and a world of wonder',
    },
    weather: { temp: '18–35°C', condition: 'Varied by Region', icon: '🌤️' },
    matchPercentage: 78,
    description: 'Ancient temples, Mughal palaces, Himalayan peaks, tropical beaches, and the world\'s most vibrant culture.',
    currency: '₹ Rupee',
    language: 'Hindi/English',
    timezone: 'UTC+5:30',
    positives: {
      solo:    ['Incredibly diverse country to explore', 'Very affordable for solo travelers', 'Yoga and meditation retreats in Rishikesh', 'Rich philosophical and spiritual culture', 'World-class street food'],
      couple:  ['Taj Mahal — the ultimate romantic monument', 'Rajasthan palace hotels', 'Kerala houseboat romance', 'Vibrant wedding culture to witness', 'Private Ranthambore safari'],
      friends: ['Holi festival — world\'s most colorful celebration', 'Affordable group travel', 'Goa beaches and parties', 'Himalayan trekking', 'Train journeys through incredible landscapes'],
      family:  ['Tiger safaris in national parks', 'Incredible wildlife diversity', 'Elephant experiences (ethical)', 'Rich storytelling and mythology for kids', 'Budget-friendly family travel'],
    },
    negatives: {
      solo:    ['Solo women face safety concerns in some areas', 'Very intense for first-time travelers', 'Air pollution in Delhi and major cities'],
      couple:  ['Public displays of affection discouraged', 'Stomach issues common if not careful', 'Travel distances very large'],
      friends: ['Group logistics complex', 'Goa expensive by Indian standards', 'Holi festival can be overwhelming'],
      family:  ['Delhi air pollution hard on children', 'Stomach bugs a real risk', 'Heat in summer extreme and dangerous'],
    },
    hotels: [
      { id: 'h1', name: 'Taj Lake Palace Udaipur', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 5.0, price: '$600/night', priceLevel: 'luxury', address: 'Lake Pichola, Udaipur', amenities: ['Lake Views', 'Floating Palace', 'Royal Spa', 'Boat Transfer Only'], description: 'A marble palace floating in the middle of a lake, accessible only by boat. The most dramatic hotel setting in the world.', squadTags: ['couple'] },
      { id: 'h2', name: 'The Leela Palace Delhi', image: 'https://images.unsplash.com/photo-1551882547-ff40c4a49ce7?w=600&q=80', rating: 4.9, price: '$300/night', priceLevel: 'luxury', address: 'Diplomatic Enclave, New Delhi', amenities: ['Spa', 'Multiple Restaurants', 'Pool', 'Butler Service'], description: 'India\'s finest luxury hotel in the heart of diplomatic Delhi. Mughal architecture meets modern indulgence.', squadTags: ['couple', 'solo'] },
      { id: 'h3', name: 'Zostel Jaipur', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$8/night', priceLevel: 'budget', address: 'Pink City, Jaipur', amenities: ['Rooftop Lounge', 'Social Events', 'Local Tours', 'Bike Rental'], description: 'India\'s best hostel chain — social, safe, and beautifully designed. The rooftop view of the Pink City is stunning.', squadTags: ['friends', 'solo'] },
      { id: 'h4', name: 'Taj Exotica Goa', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.7, price: '$250/night', priceLevel: 'luxury', address: 'Benaulim Beach, South Goa', amenities: ['Private Beach', 'Kids Club', 'Pool', 'Water Sports'], description: 'South Goa\'s most elegant family resort on a quiet beach, away from the party crowds. Perfect for families.', squadTags: ['family', 'couple'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Indian Accent Delhi', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.9, cuisine: 'Modern Indian', description: 'Asia\'s best Indian restaurant — traditional recipes reimagined with global technique. Duck khurchan, meetha achar martini.', price: '$80/person', priceLevel: 'luxury', address: 'The Lodhi, New Delhi', tags: ['fine-dining', 'creative', 'award-winning'], squadTags: ['couple', 'solo'] },
      { id: 'r2', name: 'Karim\'s Old Delhi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.8, cuisine: 'Mughal', description: 'Legendary Old Delhi institution since 1913 near Jama Masjid. The nihari and seekh kebabs are 100-year-old recipes. Extraordinary.', price: '$6/person', priceLevel: 'budget', address: 'Jama Masjid, Old Delhi', tags: ['historic', 'mughal', 'iconic'], squadTags: ['friends', 'solo', 'family'] },
      { id: 'r3', name: 'Swaswara Goa', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', rating: 4.7, cuisine: 'Konkani & Ayurvedic', description: 'Wellness resort restaurant serving Konkani coastal cuisine and Ayurvedic meals. Fresh fish, coconut curries, toddy vinegar.', price: '$30/person', priceLevel: 'mid-range', address: 'Om Beach, Gokarna, Goa', tags: ['wellness', 'coastal', 'authentic'], squadTags: ['solo', 'couple'] },
    ],
    activities: [
      { id: 'a1', name: 'Taj Mahal Sunrise Visit', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80', description: 'Watch the Taj Mahal materialize from morning mist at sunrise — the most beautiful building ever constructed by human hands.', duration: '3 hours', rating: 5.0, price: '$15', category: 'Culture', accentColor: 'from-amber-500 to-orange-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
      { id: 'a2', name: 'Ranthambore Tiger Safari', image: 'https://images.unsplash.com/photo-1551522435-a13afa10f103?w=600&q=80', description: 'Jeep safari into one of India\'s best tiger reserves. India has the world\'s largest wild tiger population.', duration: '4 hours', rating: 4.9, price: '$50', category: 'Nature', accentColor: 'from-orange-500 to-red-600', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'a3', name: 'Holi Festival Vrindavan', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80', description: 'The original Holi celebration in the birthplace of Krishna — the most colorful, joyful, overwhelming day of your life.', duration: 'Full day', rating: 5.0, price: '$10', category: 'Festival', accentColor: 'from-pink-500 to-purple-600', squadTags: ['friends', 'solo', 'couple'] },
      { id: 'a4', name: 'Kerala Houseboat Cruise', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', description: 'Sleep on a traditional Kerala kettuvallam boat drifting through the backwater canals lined with palms and paddy fields.', duration: '2 days', rating: 4.9, price: '$80', category: 'Nature', accentColor: 'from-green-500 to-teal-600', squadTags: ['couple', 'solo', 'family'] },
      { id: 'a5', name: 'Varanasi Ganga Aarti', image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&q=80', description: 'Witness the ancient evening fire ritual on the ghats of the Ganges — one of the most spiritually intense experiences on Earth.', duration: '2 hours', rating: 5.0, price: 'Free', category: 'Spiritual', accentColor: 'from-yellow-500 to-orange-600', squadTags: ['solo', 'couple', 'friends', 'family'] },
    ],
    events: [
      { id: 'e1', name: 'Diwali Festival of Lights', category: 'Cultural', date: 'Oct/Nov (varies)', matchPercentage: 95, description: 'India\'s most spectacular celebration — a billion lights, fireworks for days, and the sweetest sweets on Earth.', squadTags: ['family', 'couple', 'solo', 'friends'] },
      { id: 'e2', name: 'Holi Color Festival', category: 'Festival', date: 'Mar (varies)', matchPercentage: 97, description: 'The world\'s most joyful festival — colored powder, water guns, music, dancing, absolute chaos and pure happiness.', squadTags: ['friends', 'couple', 'solo', 'family'] },
      { id: 'e3', name: 'Pushkar Camel Fair', category: 'Cultural', date: 'Nov (varies)', matchPercentage: 88, description: 'The world\'s largest camel fair — 50,000 camels, traders, musicians, and pilgrims at a sacred desert lake.', squadTags: ['solo', 'couple', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Delhi Introduction', morning: 'Old Delhi — Red Fort, Jama Masjid, Chandni Chowk spice market', afternoon: 'Humayun\'s Tomb and Lodhi Garden', evening: 'Karim\'s dinner, then chai on the rooftop', icon: '🕌' },
        { day: 2, theme: 'Agra & the Taj', morning: 'Train to Agra, Taj Mahal at opening hour', afternoon: 'Agra Fort and Mehtab Bagh garden across the river', evening: 'Return train to Delhi, reflect', icon: '🕌' },
        { day: 3, theme: 'Varanasi Soul', morning: 'Dawn boat on the Ganges — ghats at sunrise', afternoon: 'Kashi Vishwanath Temple, narrow lane exploration', evening: 'Ganga Aarti fire ceremony at dusk — unforgettable', icon: '🔥' },
      ],
      couple: [
        { day: 1, theme: 'Taj Mahal', morning: 'Taj Mahal at sunrise — arrive before gates open', afternoon: 'Agra Fort, then Mehtab Bagh sunset view across the river', evening: 'Rooftop dinner watching the Taj glow at dusk', icon: '💞' },
        { day: 2, theme: 'Udaipur Palace', morning: 'Fly to Udaipur, boat transfer to Lake Palace', afternoon: 'City Palace exploration', evening: 'Rooftop dinner over Lake Pichola with sunset and candles', icon: '🛕' },
        { day: 3, theme: 'Kerala Romance', morning: 'Fly to Kochi, board houseboat', afternoon: 'Drift through backwaters, watch village life unfold', evening: 'Ayurvedic couples massage, starlight on the water', icon: '🌴' },
      ],
      friends: [
        { day: 1, theme: 'Delhi Food & History', morning: 'Old Delhi food tour — jalebi, paratha, lassi, kebabs', afternoon: 'Qutub Minar and Humayun\'s Tomb', evening: 'Hauz Khas Village — rooftop bars, DJs, street art', icon: '🍛' },
        { day: 2, theme: 'Holi Festival', morning: 'Travel to Mathura/Vrindavan for Holi', afternoon: 'The most colorful afternoon of your lives', evening: 'Clean up (eventually), celebrate, street food feast', icon: '🎨' },
        { day: 3, theme: 'Jaipur Pink City', morning: 'Amber Fort elephant road', afternoon: 'Hawa Mahal, City Palace, bazaar shopping', evening: 'Rooftop dinner with view, traditional Rajasthani folk music', icon: '🐘' },
      ],
      family: [
        { day: 1, theme: 'Taj Mahal', morning: 'Taj Mahal family visit — kids photograph it endlessly', afternoon: 'Agra Fort — Mughal history comes alive', evening: 'Agra street food tour — kids try everything', icon: '🏯' },
        { day: 2, theme: 'Tiger Safari', morning: 'Ranthambore National Park tiger jeep safari', afternoon: 'Afternoon safari — spot leopards, sloth bears, crocodiles', evening: 'Wildlife documentary then camp dinner', icon: '🐯' },
        { day: 3, theme: 'Jaipur Elephants', morning: 'Amber Fort entry via elephant (if ethical option available)', afternoon: 'Jaipur City Palace museum — kids love the armor and weapons', evening: 'Puppet show and Rajasthani thali dinner', icon: '🐘' },
      ],
    },
    aiInsight: {
      solo:    'India is the solo traveler\'s ultimate challenge and greatest reward. It overwhelms every sense simultaneously — the chaos, the color, the spiritual intensity, the extraordinary food. It also offers the deepest personal transformations: a Varanasi dawn, a Himalayan meditation retreat, the silence of a palace at 6am.',
      couple:  'India\'s romantic credentials are ancient — the Taj Mahal was literally built as a monument to love. Udaipur\'s lake palace hotels, Kerala\'s houseboat drifting through palms, Rajasthan\'s painted havelis at golden hour — India stages romance on an epic, historic scale.',
      friends: 'India with friends is controlled magnificent chaos. Holi in Vrindavan. A train journey through Rajasthan. Street food in Old Delhi at midnight. Tiger safaris in the morning. The sheer volume of extraordinary experiences at almost no cost makes it the group trip that gets referenced forever.',
      family:  'India reveals the world\'s diversity to children in the most vivid, sensory way imaginable. Tiger safaris, elephant encounters, the Taj Mahal, Diwali fireworks, temple monkeys, snake charmers — India hands children a living encyclopedia and makes it unforgettable. Travel here young.',
    },
    mapCenter: { lat: 20.5937, lng: 78.9629 },
  },

  {
    id: 'bali',
    name: 'Bali',
    flag: '🇮🇩',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80',
    cardImage: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80',
    taglines: {
      solo:    'Find your balance in the Island of the Gods',
      couple:  'Paradise found, together',
      friends: 'The group trip that changes everything',
      family:  'Where the whole family falls in love',
    },
    weather: { temp: '26–32°C', condition: 'Tropical & Lush', icon: '🌴' },
    matchPercentage: 88,
    description: 'Rice terraces, temple ceremonies, world-class surf, and spiritual serenity.',
    currency: 'Rp Rupiah',
    language: 'Balinese/Indonesian',
    timezone: 'UTC+8',
    positives: {
      solo:    ['Top solo travel destination', 'Yoga & wellness retreats in Ubud', 'Very affordable', 'Welcoming expat community', 'Easy scooter travel'],
      couple:  ['Romantic jungle cliff villas', 'Private waterfall pools', 'Couples spa rituals', 'Sunset at Tanah Lot', 'Private beach dinners'],
      friends: ['Famous party scene in Seminyak', 'Group villa rentals with pool', 'Surfing lessons', 'Affordable massages everywhere', 'Sunset beach clubs'],
      family:  ['Very safe and family-friendly', 'Warm calm waters in the south', 'Waterbom Bali (Asia\'s best waterpark)', 'Cultural performances for kids', 'Monkeys! Rice terraces! Temples!'],
    },
    negatives: {
      solo:    ['Can be lonely in off-peak season', 'Traffic in Kuta/Seminyak', 'Some areas heavily touristed'],
      couple:  ['Some areas rowdy (Kuta)', 'Rainy season Oct-April', 'Dress codes at temples everywhere'],
      friends: ['Party scene can overwhelm non-partiers', 'Touts at beaches', 'Traffic jams'],
      family:  ['Temple rules strict with children', 'Mosquitoes', 'Jellyfish at certain beaches'],
    },
    hotels: [
      { id: 'h1', name: 'Four Seasons Sayan', image: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=600&q=80', rating: 5.0, price: '$900/night', priceLevel: 'luxury', address: 'Ayung River Valley, Ubud', amenities: ['Infinity Pool', 'Jungle Spa', 'Yoga Pavilion', 'Cooking Class'], description: 'Suspended above the Ayung River gorge. Voted World\'s Best Resort. The jungle views are beyond words.', squadTags: ['couple', 'solo'] },
      { id: 'h2', name: 'Seminyak Villa Ohana', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80', rating: 4.7, price: '$250/night', priceLevel: 'luxury', address: 'Seminyak, Bali', amenities: ['Private Pool', '4 Bedrooms', 'Chef Included', 'Beach Access'], description: 'Private 4-bedroom villa with infinity pool, personal chef, and a 5-minute walk to Seminyak Beach.', squadTags: ['friends', 'family'] },
      { id: 'h3', name: 'Kabak Bali Ubud Hostel', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', rating: 4.5, price: '$18/night', priceLevel: 'budget', address: 'Ubud, Bali', amenities: ['Rice Field Views', 'Yoga Classes', 'Café', 'Scooter Rental'], description: 'The ultimate solo traveler retreat overlooking emerald rice paddies in Ubud.', squadTags: ['solo', 'friends'] },
    ],
    restaurants: [
      { id: 'r1', name: 'Mozaic Ubud', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', rating: 4.9, cuisine: 'French-Balinese', description: 'Garden fine dining by James Beard-nominated chef Chris Salans. Firefly-lit tropical garden setting.', price: '$120/person', priceLevel: 'luxury', address: 'Ubud, Bali', tags: ['romantic', 'garden', 'fine-dining'], squadTags: ['couple', 'solo'] },
      { id: 'r2', name: 'Warung Babi Guling Ibu Oka', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', rating: 4.8, cuisine: 'Balinese', description: 'The legendary suckling pig warung made famous by Anthony Bourdain. Queue early — it sells out by noon.', price: '$8/person', priceLevel: 'budget', address: 'Ubud, Bali', tags: ['iconic', 'authentic', 'street-food'], squadTags: ['friends', 'solo', 'family'] },
    ],
    activities: [
      { id: 'a1', name: 'Tegalalang Rice Terrace', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', description: 'Walk through ancient UNESCO-listed rice terraces that cascade down the hillside in perfect emerald layers.', duration: '2 hours', rating: 4.8, price: '$3 donation', category: 'Nature', accentColor: 'from-green-500 to-emerald-600', squadTags: ['solo', 'couple', 'family', 'friends'] },
      { id: 'a2', name: 'Ubud Yoga Retreat', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80', description: 'Join a morning yoga class overlooking the jungle at one of Ubud\'s world-famous studios.', duration: '2 hours', rating: 4.9, price: '$20', category: 'Wellness', accentColor: 'from-purple-500 to-violet-600', squadTags: ['solo', 'couple', 'friends'] },
      { id: 'a3', name: 'Waterbom Bali', image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&q=80', description: 'Voted Asia\'s best waterpark. 16 thrilling slides in a tropical garden setting.', duration: 'Full day', rating: 4.8, price: '$40', category: 'Adventure', accentColor: 'from-blue-500 to-cyan-600', squadTags: ['family', 'friends'] },
      { id: 'a4', name: 'Uluwatu Surf Lessons', image: 'https://images.unsplash.com/photo-1504680177321-2e6a879d3e91?w=600&q=80', description: 'Learn to surf at Bali\'s most iconic break. Lessons for beginners on the white sand beach.', duration: '3 hours', rating: 4.7, price: '$35', category: 'Sport', accentColor: 'from-orange-500 to-amber-600', squadTags: ['friends', 'solo', 'couple'] },
      { id: 'a5', name: 'Tanah Lot Sunset Temple', image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80', description: 'Watch the sun set behind the sea temple perched on a dramatic rock formation. Possibly Bali\'s most iconic view.', duration: '2 hours', rating: 4.9, price: '$5', category: 'Culture', accentColor: 'from-orange-500 to-red-600', squadTags: ['couple', 'solo', 'family', 'friends'] },
    ],
    events: [
      { id: 'e1', name: 'Nyepi Day of Silence', category: 'Cultural', date: 'Mar (varies)', matchPercentage: 90, description: 'Bali\'s most unique event — the entire island goes completely silent and dark for 24 hours.', squadTags: ['solo', 'couple'] },
      { id: 'e2', name: 'Kuta Carnival', category: 'Festival', date: 'Sep', matchPercentage: 82, description: 'Beach festival with international music, watersports, and food. Vibrant and social.', squadTags: ['friends', 'family'] },
      { id: 'e3', name: 'Bali Spirit Festival', category: 'Wellness', date: 'Apr', matchPercentage: 88, description: 'World\'s premier yoga and wellness festival in Ubud. 100+ classes over 5 days.', squadTags: ['solo', 'friends'] },
    ],
    itinerary: {
      solo: [
        { day: 1, theme: 'Ubud Soul', morning: 'Dawn yoga overlooking rice terraces', afternoon: 'Tegalalang Rice Terrace walk', evening: 'Solo dinner at Mozaic garden restaurant', icon: '🧘' },
        { day: 2, theme: 'Temple Hopping', morning: 'Tirta Empul holy spring purification ceremony', afternoon: 'Goa Gajah Elephant Cave temple', evening: 'Kecak fire dance performance at Uluwatu', icon: '🛕' },
        { day: 3, theme: 'Wellness Day', morning: ' 2-hour traditional Balinese massage', afternoon: 'Cooking class — learn tempeh and sambal', evening: 'Warung Babi Guling dinner, then stargazing', icon: '🌿' },
      ],
      couple: [
        { day: 1, theme: 'Jungle Romance', morning: 'Private waterfall hike to Sekumpul Falls', afternoon: 'Check into cliff jungle villa (Four Seasons)', evening: 'Private candlelit dinner on the villa terrace', icon: '💚' },
        { day: 2, theme: 'Ubud Intimacy', morning: 'Couples balinese massage at a spa', afternoon: 'Tegalalang rice terraces, then cooking class', evening: 'Sunset at Tanah Lot temple', icon: '🌅' },
        { day: 3, theme: 'Beach Escape', morning: 'Drive to Seminyak or Jimbaran beach', afternoon: 'Private beachside lunch', evening: 'Seafood BBQ dinner on the Jimbaran beach at sunset', icon: '🏖️' },
      ],
      friends: [
        { day: 1, theme: 'Arrival Vibes', morning: 'Villa check-in, pool day in Seminyak', afternoon: 'Explore Seminyak boutiques and beach', evening: 'Potato Head Beach Club sunset party', icon: '🎉' },
        { day: 2, theme: 'Adventure Day', morning: 'Group surf lessons in Uluwatu', afternoon: 'Cliff-top lunch at Single Fin', evening: 'Tegalalang swing at golden hour + dinner', icon: '🏄' },
        { day: 3, theme: 'Culture & Party', morning: 'Ubud Monkey Forest + rice terraces', afternoon: 'Balinese cooking class at the villa', evening: 'Ku De Ta beach club — drinks, music, vibes', icon: '🐒' },
      ],
      family: [
        { day: 1, theme: 'Waterbom Day', morning: 'Waterbom Bali — Asia\'s best waterpark', afternoon: 'More slides and the lazy river', evening: 'Casual family warungs dinner', icon: '💦' },
        { day: 2, theme: 'Temple & Nature', morning: 'Tanah Lot sunset temple visit', afternoon: 'Tegalalang rice terraces — kids love the Instagram swings', evening: 'Family dance show at a Ubud stage', icon: '🌾' },
        { day: 3, theme: 'Animal Magic', morning: 'Bali Safari & Marine Park', afternoon: 'Monkey Forest in Ubud (supervised!)', evening: 'Farewell feast of Babi Guling and sate lilit', icon: '🦁' },
      ],
    },
    aiInsight: {
      solo:    'Bali has built an entire economy around the solo traveler\'s soul search. The yoga retreats of Ubud, the spiritual ceremonies, the motorcycle roads through rice paddies — all of it conspires to give you exactly the quiet adventure and internal reset that solo travel is for.',
      couple:  'Bali\'s private cliff villas, jungle waterfalls, and endless spa offerings create a deeply intimate setting. The island\'s spiritual culture adds depth — the Balinese belief that love is sacred makes every romantic gesture feel meaningful here.',
      friends: 'Bali for friends is the group trip benchmark. Private villa with pool and chef? $250/night split four ways. Surfing lessons in the morning, sunset beach clubs in the evening, cooking class at the villa — it\'s impossible to have a bad day.',
      family:  'Bali is one of Asia\'s best family destinations. The people genuinely love children, the waterpark is world-class, the temples are dramatic and fascinating, the beaches safe, and the rice terraces are unlike anything kids have ever seen. The magic is real.',
    },
    mapCenter: { lat: -8.3405, lng: 115.0920 },
  },
];

// ─── Lookup helpers ─────────────────────────────────────────────────────────────

export function getDestination(id: string): DestinationEntry | undefined {
  return DESTINATIONS.find(d => d.id === id);
}

export function getSquadHotels(destination: DestinationEntry, squad: SquadType): Hotel[] {
  return destination.hotels.filter(h => h.squadTags.includes(squad));
}

export function getSquadRestaurants(destination: DestinationEntry, squad: SquadType): Restaurant[] {
  return destination.restaurants.filter(r => r.squadTags.includes(squad));
}

export function getSquadActivities(destination: DestinationEntry, squad: SquadType): Activity[] {
  return destination.activities.filter(a => a.squadTags.includes(squad));
}

export function getSquadEvents(destination: DestinationEntry, squad: SquadType): TravelEvent[] {
  return destination.events.filter(e => e.squadTags.includes(squad));
}

export const SQUAD_LABELS: Record<SquadType, string> = {
  solo:    'Solo',
  couple:  'Couple',
  friends: 'Friends',
  family:  'Family',
};

export const SQUAD_EMOJI: Record<SquadType, string> = {
  solo:    '👤',
  couple:  '💑',
  friends: '👥',
  family:  '👨‍👩‍👧',
};
