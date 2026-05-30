export type UserRole = "traveler" | "agency";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  createdAt: string;
};
