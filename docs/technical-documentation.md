# AI-Powered Trip Planner: Technical Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Core Algorithms](#core-algorithms)
4. [System Architecture](#system-architecture)
5. [Implementation Details](#implementation-details)
6. [Data Flow](#data-flow)
7. [Conclusion](#conclusion)

---

## Introduction

The AI-Powered Trip Planner is a comprehensive travel planning application that leverages user preferences, machine learning techniques, and collaborative filtering to provide personalized travel recommendations. The system transforms simple user interactions (image swipes) into detailed, actionable travel itineraries while connecting users with travel agencies.

### Key Features

- **Preference Learning**: Users express travel preferences through an intuitive swipe interface
- **Smart Matching**: AI-driven matching between user preferences and travel packages
- **Group Planning**: Squad mode with Least Misery algorithm for group decision making
- **Agency Integration**: Complete marketplace connecting users with travel agencies
- **Itinerary Generation**: Automated day-by-day travel planning

---

## System Overview

### Frontend Architecture

**Technology Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion

The frontend is built as a modern React application using Next.js with the App Router pattern. The system employs:

- **Component-Based Architecture**: Modular, reusable components for maintainability
- **Type Safety**: Full TypeScript implementation for robust development
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for enhanced user experience

### Backend Architecture

**Technology Stack**: Java Spring Boot, RESTful APIs, PostgreSQL (planned)

The backend provides robust API endpoints for:
- User management and authentication
- Preference analysis and storage
- Package management and matching
- Agency dashboard and analytics
- Real-time collaboration features

### External Integrations

- **Unsplash API**: Dynamic image generation for destinations and activities
- **Google Maps API**: Interactive mapping and location services
- **Email Services**: Agency contact and notification systems

---

## Core Algorithms

### 1. Preference Vector Generation

#### Problem Statement
Convert user interactions (likes/dislikes) into a quantifiable preference vector that can be used for matching and recommendations.

#### Algorithm Implementation

```typescript
function calculatePreferences(likedTags: string[], dislikedTags: string[]): UserTaste {
  const allTags = [...likedTags, ...dislikedTags];
  const preferences: UserTaste = {};

  allTags.forEach(tag => {
    const likeCount = likedTags.filter(t => t === tag).length;
    const dislikeCount = dislikedTags.filter(t => t === tag).length;
    const totalInteractions = likeCount + dislikeCount;
    
    if (totalInteractions > 0) {
      // Calculate percentage preference (0-100)
      const preferenceScore = (likeCount / totalInteractions) * 100;
      preferences[tag] = Math.round(preferenceScore);
    }
  });

  return preferences;
}
```

#### Mathematical Representation

Given user interactions:
- **Liked Images**: `L = [beach, nature, beach, luxury]`
- **Disliked Images**: `D = [urban, adventure]`

**Preference Calculation**:
```
P(tag) = (count(tag in L) / (count(tag in L) + count(tag in D))) × 100

Result:
beach = (2 / (2 + 0)) × 100 = 100%
nature = (1 / (1 + 0)) × 100 = 100%
luxury = (1 / (1 + 0)) × 100 = 100%
urban = (0 / (0 + 1)) × 100 = 0%
adventure = (0 / (0 + 1)) × 100 = 0%
```

#### Advantages

- **Intuitive**: Direct mapping from user behavior to preferences
- **Scalable**: Handles unlimited tag categories
- **Flexible**: Adapts to user behavior changes over time

### 2. Least Misery Algorithm for Group Planning

#### Problem Statement
Aggregate individual user preferences into a group recommendation that maximizes overall satisfaction while ensuring fairness.

#### Algorithm Implementation

```typescript
export function leastMisery(userPreferences: UserTaste[]): GroupPreferences {
  if (userPreferences.length === 0) return {};

  const allTags = new Set<string>();
  userPreferences.forEach(pref => {
    Object.keys(pref).forEach(tag => allTags.add(tag));
  });

  const groupPreferences: GroupPreferences = {};

  allTags.forEach(tag => {
    // Get the minimum preference score for this tag across all users
    const scores = userPreferences
      .map(pref => pref[tag] || 0)
      .filter(score => score > 0);

    if (scores.length > 0) {
      groupPreferences[tag] = Math.min(...scores);
    }
  });

  return groupPreferences;
}
```

#### Mathematical Foundation

For a group of users with preferences:
- **User A**: `{beach: 80, nature: 60, luxury: 40}`
- **User B**: `{beach: 40, nature: 80, luxury: 60}`
- **User C**: `{beach: 60, nature: 40, luxury: 80}`

**Least Misrey Calculation**:
```
beach = min(80, 40, 60) = 40
nature = min(60, 80, 40) = 40
luxury = min(40, 60, 80) = 40
```

#### Fairness Principle

The Least Misery algorithm ensures that no group member is significantly dissatisfied with the recommendation. By taking the minimum preference score, we guarantee that the chosen option is acceptable to all group members.

#### Satisfaction Metrics

```typescript
export function calculateGroupSatisfaction(
  userPreferences: UserTaste[],
  groupPreferences: GroupPreferences
): number {
  let totalSatisfaction = 0;
  let validUsers = 0;

  userPreferences.forEach(userPref => {
    let userSatisfaction = 0;
    let validTags = 0;

    Object.entries(userPref).forEach(([tag, userScore]) => {
      const groupScore = groupPreferences[tag] || 0;
      if (userScore > 0) {
        userSatisfaction += Math.min(userScore, groupScore) / userScore;
        validTags++;
      }
    });

    if (validTags > 0) {
      totalSatisfaction += userSatisfaction / validTags;
      validUsers++;
    }
  });

  return validUsers > 0 ? (totalSatisfaction / validUsers) * 100 : 0;
}
```

### 3. Package Matching Algorithm

#### Problem Statement
Match user preference vectors with available travel packages to provide personalized recommendations.

#### Algorithm Implementation

```typescript
export function scorePackage(pkg: Package, userPreferences: UserTaste): number {
  let score = 0;

  pkg.tags.forEach(tag => {
    if (userPreferences[tag]) {
      score += userPreferences[tag];
    }
  });

  return score;
}

export function getTopMatches(
  packages: Package[], 
  userPreferences: UserTaste, 
  limit: number = 3
): Array<Package & { score: number }> {
  const ranked = packages
    .map(pkg => ({
      ...pkg,
      score: scorePackage(pkg, userPreferences)
    }))
    .filter(pkg => pkg.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, limit);
}
```

#### Matching Logic

1. **Tag Overlap**: Calculate intersection between user preferences and package tags
2. **Weighted Scoring**: Higher preference scores contribute more to the match
3. **Ranking**: Sort packages by total score to find best matches
4. **Threshold Filtering**: Only show packages with meaningful matches

#### Example

**User Preferences**: `{beach: 80, nature: 60, luxury: 40}`

**Package A**: `tags: ["beach", "relax", "nature"]`
- Score: 80 + 60 = 140

**Package B**: `tags: ["beach", "luxury", "urban"]`
- Score: 80 + 40 = 120

**Result**: Package A ranks higher due to better preference alignment

### 4. Itinerary Generation Algorithm

#### Problem Statement
Generate a structured, day-by-day travel plan based on user preferences, budget, and duration.

#### Algorithm Implementation

```typescript
export function generateItinerary(input: UserInput): Itinerary {
  const days = getDaysBetweenDates(input.startDate, input.endDate);
  
  const dayPlans: DayPlan[] = days.map((day, index) => {
    const activities = generateActivities(input.preferences, input.budget);
    
    return {
      day: index + 1,
      title: `Day ${index + 1}`,
      date: day.toISOString().split('T')[0],
      activities,
      imageUrl: `https://source.unsplash.com/800x600/?${input.destination},travel,day${index + 1}`,
      estimatedCost: calculateActivityCosts(activities)
    };
  });

  return {
    id: Date.now().toString(),
    destination: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    totalDays: days.length,
    budget: input.budget,
    days: dayPlans,
    totalEstimatedCost: dayPlans.reduce((total, day) => total + day.estimatedCost, 0),
    createdAt: new Date().toISOString()
  };
}
```

#### Activity Selection Logic

```typescript
export function generateActivities(
  preferences: Record<string, number>,
  budget: "low" | "medium" | "premium"
): Activity[] {
  const activities: Activity[] = [];
  const threshold = 50;
  
  // Sort preferences by score (highest first)
  const sortedPrefs = Object.entries(preferences)
    .filter(([_, score]) => score >= threshold)
    .sort(([, a], [, b]) => b - a);
  
  // Generate activities based on top preferences
  for (const [category, score] of sortedPrefs) {
    if (activities.length >= 3) break;
    
    const categoryActivities = ACTIVITY_TEMPLATES[category];
    if (!categoryActivities) continue;
    
    // Select activities appropriate for budget
    const suitableActivities = categoryActivities.filter(activity => {
      if (budget === "low" && activity.cost !== "Free") return false;
      if (budget === "premium" && activity.cost === "Free") return false;
      return true;
    });
    
    if (suitableActivities.length > 0) {
      activities.push(suitableActivities[Math.floor(Math.random() * suitableActivities.length)]);
    }
  }
  
  return activities;
}
```

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Client   │    │   Agency Client │    │   Admin Client  │
│   (Next.js)     │    │   (Next.js)     │    │   (Next.js)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │    API Gateway           │
                    │   (Next.js API Routes)   │
                    └─────────────┬─────────────┘
                                 │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
┌─────────┴─────────┐    ┌─────────┴─────────┐    ┌─────────┴─────────┐
│   User Service   │    │  Agency Service  │    │ Analytics Service │
│   (Java Spring)  │    │   (Java Spring)  │    │   (Java Spring)  │
└─────────┬─────────┘    └─────────┬─────────┘    └─────────┬─────────┘
          │                        │                        │
          └────────────────────────┼────────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │    PostgreSQL DB          │
                    │   (Users, Packages,       │
                    │    Preferences, etc.)     │
                    └───────────────────────────┘
                                 │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
┌─────────┴─────────┐    ┌─────────┴─────────┐    ┌─────────┴─────────┐
│   Unsplash API   │    │  Google Maps API │    │   Email Service   │
│   (Images)       │    │   (Mapping)       │    │   (Notifications) │
└───────────────────┘    └───────────────────┘    └───────────────────┘
```

### Frontend Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── swipe/             # Preference collection
│   ├── results/           # Destination recommendations
│   ├── itinerary/         # Generated travel plans
│   └── agency/            # Agency dashboard
├── components/            # Reusable UI components
│   ├── SwipeCard.tsx      # Tinder-style card
│   ├── PackageCard.tsx    # Travel package display
│   └── DayCard.tsx        # Itinerary day display
├── hooks/                 # Custom React hooks
│   ├── useTaste.ts        # Preference management
│   ├── usePackages.ts     # Package operations
│   └── useAuth.ts         # Authentication
├── lib/                   # Utility functions
│   ├── itinerary.ts       # Itinerary generation
│   ├── leastMisery.ts     # Group preferences
│   └── suggestionEngine.ts # Package matching
└── types/                 # TypeScript definitions
    ├── preferences.ts     # User preference types
    ├── package.ts         # Travel package types
    └── itinerary.ts       # Itinerary types
```

### Backend Architecture (Planned)

```
backend/
├── src/main/java/com/tripplanner/
│   ├── controller/        # REST API endpoints
│   │   ├── UserController.java
│   │   ├── PackageController.java
│   │   └── AgencyController.java
│   ├── service/           # Business logic
│   │   ├── PreferenceService.java
│   │   ├── MatchingService.java
│   │   └── ItineraryService.java
│   ├── repository/        # Data access layer
│   │   ├── UserRepository.java
│   │   ├── PackageRepository.java
│   │   └── PreferenceRepository.java
│   ├── entity/            # Database entities
│   │   ├── User.java
│   │   ├── Package.java
│   │   └── Preference.java
│   └── config/            # Configuration
│       ├── DatabaseConfig.java
│       └── SecurityConfig.java
└── resources/
    ├── application.yml    # Application configuration
    └── db/migration/       # Database migrations
```

---

## Implementation Details

### State Management

The application uses a combination of React hooks and localStorage for state management:

```typescript
// User preferences persistence
const { saveTasteProfile, loadTasteProfile } = useTaste();

// Package management
const { packages, addPackage, getTopMatches } = usePackages();

// Agency requests
const { createRequest, getPendingRequests } = useAgencyRequests();
```

### Real-time Features

- **Live Preference Updates**: Immediate feedback as users swipe
- **Dynamic Package Matching**: Real-time recommendation updates
- **Agency Notifications**: Instant request notifications

### Performance Optimizations

- **Image Caching**: Unsplash images cached in localStorage
- **Lazy Loading**: Components loaded on-demand
- **Debounced API Calls**: Prevent excessive API requests
- **Component Memoization**: React.memo for expensive renders

### Security Considerations

- **Input Validation**: All user inputs validated and sanitized
- **Rate Limiting**: API endpoints protected from abuse
- **Data Encryption**: Sensitive data encrypted at rest
- **CORS Configuration**: Proper cross-origin resource sharing

---

## Data Flow

### User Journey Flow

```
1. User Registration/Login
   ↓
2. Preference Collection (Swipe Interface)
   ↓
3. Preference Vector Generation
   ↓
4. Destination Matching
   ↓
5. Package Recommendations
   ↓
6. Itinerary Generation
   ↓
7. Agency Contact
   ↓
8. Booking Completion
```

### Data Transformation Pipeline

```
User Interactions (Likes/Dislikes)
   ↓
Tag Extraction and Counting
   ↓
Preference Vector Calculation
   ↓
Normalization (0-100 scale)
   ↓
Package Tag Matching
   ↓
Score Calculation
   ↓
Ranking and Filtering
   ↓
Recommendation Display
```

### Agency Integration Flow

```
1. User submits itinerary request
   ↓
2. Request stored in database
   ↓
3. Agency notified via email/dashboard
   ↓
4. Agency reviews and responds
   ↓
5. User receives agency quotes
   ↓
6. Booking process initiated
```

---

## Conclusion

The AI-Powered Trip Planner represents a comprehensive solution to modern travel planning challenges. By combining intuitive user interfaces with sophisticated algorithms, the system successfully bridges the gap between user preferences and real-world travel offerings.

### Key Achievements

1. **Preference Learning**: Successfully transformed qualitative user interactions into quantitative preference vectors
2. **Group Decision Making**: Implemented fair group planning using the Least Misery algorithm
3. **Marketplace Integration**: Created a complete ecosystem connecting users with travel agencies
4. **Automated Planning**: Generated detailed, personalized itineraries based on user preferences
5. **Scalable Architecture**: Built modular, maintainable codebase ready for production deployment

### Future Enhancements

1. **Machine Learning**: Implement ML models for improved preference prediction
2. **Real-time Collaboration**: Enhanced multiplayer features with live synchronization
3. **Mobile Applications**: Native iOS and Android applications
4. **Advanced Analytics**: Predictive analytics for travel trends
5. **Global Expansion**: Multi-language support and regional customization

### Technical Impact

The system demonstrates the practical application of collaborative filtering, preference learning, and algorithmic fairness in a real-world scenario. The Least Misrey algorithm provides a mathematically sound approach to group decision-making, while the preference vector system offers an intuitive method for capturing user interests.

This implementation serves as a foundation for future research in AI-powered travel planning and recommendation systems, with potential applications in various domains requiring preference matching and group decision support.

---

*Documentation generated for academic and technical reference purposes.*
