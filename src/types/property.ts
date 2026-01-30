export type PropertyType = 'residential' | 'commercial' | 'land' | 'rental';

export type PropertyStatus = 'available' | 'sold' | 'rented' | 'under_offer';

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  location: {
    city: string;
    area: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  size: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  images: string[];
  videos?: string[];
  dealer: {
    id: string;
    name: string;
    company?: string;
    phone: string;
    email: string;
    whatsapp?: string;
    avatar?: string;
  };
  views: number;
  leads: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilter {
  search?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  type?: PropertyType[];
  bedrooms?: number;
  bathrooms?: number;
  sizeMin?: number;
  sizeMax?: number;
  amenities?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}
