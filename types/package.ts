export type Package = {
  id: string;
  title: string;
  destination: string;
  price: number;
  duration: string;
  image: string;
  tags: string[];
  description: string;
  agencyId: string;
  agencyName: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
};
