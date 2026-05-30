export type UserProfile = {
  likedImages: string[];
  preferenceTags: string[];
};

export type UserPreferences = {
  budget?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  destination?: string;
  travelType?: string;
  interests?: string[];
};
