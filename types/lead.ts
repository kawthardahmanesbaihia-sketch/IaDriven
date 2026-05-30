export type Lead = {
  id: string;
  userId: string;
  userName?: string;
  userEmail: string;
  destination: string;
  budget: string;
  preferences: Record<string, number>;
  itinerary: any;
  packageId?: string;
  packageName?: string;
  status: "new" | "contacted" | "quoted" | "booked" | "closed";
  createdAt: string;
  updatedAt: string;
  notes?: string;
  agencyId?: string;
};

export type LeadFilters = {
  status?: Lead["status"];
  destination?: string;
  budget?: string;
  dateRange?: {
    start: string;
    end: string;
  };
};
