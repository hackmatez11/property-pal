export enum UserRole {
  ADMIN = 'admin',
  DEALER = 'dealer',
  GUEST = 'guest',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export enum PropertyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  PLOT = 'plot',
  COMMERCIAL = 'commercial',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

// Database Types
export interface Profile {
  id: string;
  role: UserRole;
  company_name?: string;
  contact_phone?: string;
  contact_email?: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  listing_limit: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  dealer_id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  size: number;
  size_unit: string;
  bedrooms?: number;
  bathrooms?: number;
  property_type: PropertyType;
  amenities: string[];
  status: PropertyStatus;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  cloudinary_public_id: string;
  secure_url: string;
  thumbnail_url: string;
  standard_url: string;
  media_type: MediaType;
  display_order: number;
  created_at: string;
}

export interface Lead {
  id: string;
  property_id: string;
  dealer_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  message?: string;
  status: string;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// UI-Safe Auth Response
export interface AuthResponse {
  isAuthenticated: boolean;
  role: UserRole;
  subscriptionStatus?: SubscriptionStatus;
  userId?: string;
  email?: string;
}

// UI-Safe Feature Flags
export interface FeatureFlags {
  canPostProperty: boolean;
  remainingListings: number;
  canAccessAnalytics: boolean;
  canExportLeads: boolean;
}

// Property Filter Options
export interface PropertyFilters {
  city?: string;
  state?: string;
  property_type?: PropertyType;
  min_price?: number;
  max_price?: number;
  min_size?: number;
  max_size?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  status?: PropertyStatus;
}

// Pagination Options
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// AI Search Response
export interface AISearchResponse {
  summary: string;
  properties: Property[];
  suggestedFilters: PropertyFilters;
  totalResults: number;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  thumbnail_url: string;
  standard_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}
