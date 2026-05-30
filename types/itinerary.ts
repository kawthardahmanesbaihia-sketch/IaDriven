export type UserInput = {
  preferences: Record<string, number>; // e.g. { beach: 80 }
  budget: "low" | "medium" | "premium";
  startDate: string;
  endDate: string;
  destination: string;
};

export type Activity = {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g. "2 hours"
  cost: string;
  category: string;
  imageUrl?: string;
};

export type DayPlan = {
  day: number;
  title: string;
  date: string;
  activities: Activity[];
  imageUrl: string;
  estimatedCost: number;
};

export type Itinerary = {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  budget: string;
  days: DayPlan[];
  totalEstimatedCost: number;
  createdAt: string;
};

export type AgencyRequest = {
  id: string;
  userInput: UserInput;
  itinerary: Itinerary;
  status: "pending" | "contacted" | "completed";
  createdAt: string;
  userEmail?: string;
  userName?: string;
};
